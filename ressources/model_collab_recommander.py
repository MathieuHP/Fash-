import surprise
import pandas as pd
import numpy as np
import os
from surprise import Reader, Dataset, Trainset, SVD, BaselineOnly
from surprise.model_selection import cross_validate


FIRST_PICTURES_LIST = [ 
"00b6d6ed71e27101211bd77627e5c1b2.jpg", 
"000e18920575a2e59b3a0c38e6546d29.jpg",
'00af8f65bb93f4131499dc9807129a24.jpg',
"00a722065820c4561a5522054ee62fe4.jpg"
]



def get_data():
    path_df = r"C:\Users\mathi\Desktop\Cronos\Fash!\DB\user_ratings_unified_3001x1000.csv"
    df = pd.read_csv(path_df)
    return df


def filtering_out_users_and_ratings(df):
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


def predict_ratings():
    df = get_data()
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
    np.save(r"DB\predictions_reco.npy", predictions)


PAHT_DB = r"C:\Users\mathi\Desktop\Cronos\Fash!\DB\user_ratings_unified_3001x1000.csv"
def get_already_rated_pictures(user_id):
    # ------------- get list of rated pictures from DB  ------------- *
    data = pd.read_csv(PAHT_DB)
    rated_pictures = data.loc[data["user_id"] == user_id]
    rated_pictures.drop(["rating","user_id"],1, inplace = True)
    rated_pictures = np.array(rated_pictures)
    return rated_pictures


def get_collaborative_recommanded_picture(user_id=int):
    """ get 10 best estimated pictures for an user_id from Surprise predictions """
    predictions = np.load(r"DB/predictions_reco.npy", allow_pickle = True)
    rated_pictures = get_already_rated_pictures(user_id)

    estimated_ratings = []
    for pred in predictions:
        if int(pred[0]) == user_id:
            estimated_ratings.append([pred[3] , pred[1]])
    estimated_ratings.sort(reverse = True)

    return estimated_ratings


def create_recommended_pictures_list(user_id):
    rated_pictures = get_already_rated_pictures(user_id)
    number_ratings = len(rated_pictures)
    
    if number_ratings < 20:
        return FIRST_PICTURES_LIST
    
    else:
        estimated_ratings = get_collaborative_recommanded_picture(user_id)
        result = []
        i = 0
        while len(result) < 50 :
            if estimated_ratings[i]:
                if estimated_ratings[i] in rated_pictures:
                    estimated_ratings.remove(estimated_ratings[i])
                    continue
                result.append(estimated_ratings[i])
                if estimated_ratings[i] == estimated_ratings[-1]:
                    break
            i+=1
        return result
        
       
# format surprise.predict()
#Prediction (
# uid=1, 
# iid='00b10502fb082dcc8f156562b71f6f91.jpg', 
# r_ui=0.6009273632105954,
# est=0.5726982131029839, 
# details={'was_impossible': False}
# )