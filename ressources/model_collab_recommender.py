import surprise
import pandas as pd
import numpy as np
import os
from surprise import Reader, Dataset, Trainset, SVD, BaselineOnly
from surprise.model_selection import cross_validate
from ressources.config import db, db_connect



def filtering_out_users_and_ratings(df):

    """filter out user and images with too few 
    ratings to preserve matrix sparsity"""

    min_picture_ratings = 10
    filter_picture = df['picture'].value_counts() > min_picture_ratings
    filter_picture = filter_picture[filter_picture].index.tolist()

    min_user_ratings = 20
    filter_users = df['user_id'].value_counts() > min_user_ratings
    filter_users = filter_users[filter_users].index.tolist()

    df_new = df[(df['picture'].isin(filter_picture)) & (df['user_id'].isin(filter_users))]
    print('The original data frame shape:\t{}'.format(df.shape))
    print('The new data frame shape:\t{}'.format(df_new.shape))
    return df_new



def predict_ratings():

    """predict ratings using surprise, for the 
    colaborative recommender system"""

    #get ratings from db
    try:
        collection = db["user_ratings"]
    except:
        db = db_connect()
        collection = db["user_ratings"]


    df = pd.DataFrame(list(collection.find({})))

    # preprocess, feed and predict ratings

    df = filtering_out_users_and_ratings(df)
    reader = Reader(rating_scale=(0, 2))
    data = Dataset.load_from_df(df[['user_id', 'picture', 'rating']], reader)
    trainset = data.build_full_trainset()
    svd = SVD()
    svd.fit(trainset)
    bsl_options = {'method': 'als',
               'n_epochs': 5,
               'reg_u': 12,
               'reg_i': 5
               }
    algo = BaselineOnly(bsl_options=bsl_options)
    cross_validate(algo, data, measures=['RMSE'], cv=3, verbose=False)
    testset = trainset.build_anti_testset()
    predictions = algo.test(testset)
    predictions = np.array(predictions)

    # update database

    collection = db["predicted_ratings_collab"]
    collection.delete_many({})
    collection.insert_many([{
        "user_id": pred[0], 
        "picture" : pred[1],
        "estimation":pred[3]} for pred in predictions])

