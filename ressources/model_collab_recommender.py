import surprise
import pandas as pd
import numpy as np
import os
from surprise import Reader, Dataset, Trainset, SVD, BaselineOnly
from surprise.model_selection import cross_validate
from ressources.config import db



FIRST_PICTURES_LIST = [ 
"00b6d6ed71e27101211bd77627e5c1b2.jpg", 
"000e18920575a2e59b3a0c38e6546d29.jpg",
'00af8f65bb93f4131499dc9807129a24.jpg',
"00a722065820c4561a5522054ee62fe4.jpg"
]


def filtering_out_users_and_ratings(df):

    """filter out user and images with too few 
    ratings to preserve matrix sparsity"""

    min_picture_ratings = 50
    filter_picture = df['picture'].value_counts() > min_picture_ratings
    filter_picture = filter_picture[filter_picture].index.tolist()

    min_user_ratings = 20
    filter_users = df['user_id'].value_counts() > min_user_ratings
    filter_users = filter_users[filter_users].index.tolist()

    df_new = df[(df['picture'].isin(filter_picture)) & (df['user_id'].isin(filter_users))]
    print('The original data frame shape:\t{}'.format(df.shape))
    print('The new data frame shape:\t{}'.format(df_new.shape))
    return df_new


def get_already_rated_pictures(user_id):

    try:
        collection = db["user_ratings"]
    except:
        db = db_connect()
        collection = db["user_ratings"]

    rated_pictures = pd.DataFrame(list(collection.find({"user_id":user_id})))
    rated_pictures = np.array(rated_pictures[["picture"]])
    return rated_pictures


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


def get_collaborative_recommended_picture(user_id=int):

    """ get 10 best estimated pictures for an user_id from 
    Surprise predictions """

    try:
        collection = db["predicted_ratings_collab"]
    except:
        db = db_connect()
        collection = db["predicted_ratings_collab"]


    predictions = collection.find({"user_id": user_id})
    rated_pictures = get_already_rated_pictures(user_id)

    estimated_ratings = []
    for pred in predictions:
        if int(pred["user_id"]) == user_id:
            estimated_ratings.append([pred["estimation"] , pred["picture"]])
    estimated_ratings.sort(reverse = True)

    return estimated_ratings
    
# format surprise.predict()
#Prediction (
# uid=1, 
# iid='00b10502fb082dcc8f156562b71f6f91.jpg', 
# r_ui=0.6009273632105954,
# est=0.5726982131029839, 
# details={'was_impossible': False}
# )