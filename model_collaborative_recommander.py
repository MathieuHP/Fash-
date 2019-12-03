import surprise
import pandas as pd
import numpy as np
import os
from surprise import Reader, Dataset, Trainset, SVD, BaselineOnly
from surprise.model_selection import cross_validate

def get_data():   # change when DB is up
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

       
# format surprise.predict()
#Prediction (
# uid=1, 
# iid='00b10502fb082dcc8f156562b71f6f91.jpg', 
# r_ui=0.6009273632105954,
# est=0.5726982131029839, 
# details={'was_impossible': False}
# )

def get_recommanded_picture(user_id=int):
    """ get 10 best estimated pictures for an user_id from Surprise predictions """
    predictions = np.load(r"DB\predictions_reco.npy", allow_pickle = True)
    estimated_ratings = []
    for pred in predictions:
        if int(pred[0]) == user_id:
            estimated_ratings.append([pred[3] , pred[1]])
    estimated_ratings.sort(reverse = True)
    result = []
    for i in range(10):
        result.append(estimated_ratings[i][1])
    return result


