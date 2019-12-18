import pandas as pd
import numpy as np
import os
from surprise import Reader, Dataset, Trainset, SVD, BaselineOnly
from surprise.model_selection import cross_validate

#customs imports
from ressources.config import db, db_connect



def check_minimum_data():
	# minimum data needed
	min_user = 10
	min_picture = 10

	#threshold to filter data before using collab recommender
	min_user_ratings = 20
	min_picture_ratings = 10

	collection = db["user_ratings"]
	ratings = pd.DataFrame(list(collection.find({})))
	count_rating = np.array(ratings["picture"].value_counts())
	count_user = np.array(ratings["user_id"].value_counts())

	picture_count = 0
	for i in count_rating:
		if i >= min_picture_ratings:
			picture_count += 1

	user_count = 0
	for i in count_user:
		if i >= min_user_ratings:
			user_count += 1


	if picture_count >= min_picture and user_count >= min_user:
		return True
	else:
		return False






check_minimum_data()