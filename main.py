from ressources.model_collab_recommender import predict_ratings, get_collaborative_recommended_picture
from ressources.picture_list_creation import create_recommended_pictures_list
from ressources.config import db

import time
from pymongo import MongoClient


settings.init()

loop = True

user_id = 1

while loop == True:

	user_input =  int(input(f""" \n
		0 => Exit \n 
		99 = > change user_id (current = {user_id}) \n
		1 => get_collaborative_recommended_picture \n
		2 => predict ratings \n
		3 => create_recommended_pictures_list \n """))

	start = time.time()

	if user_input == "0" :
		loop = False
		continue

	elif user_input == "99":
		inp = int(input("set new user_id"))
		user_id = inp
		continue


	elif user_input == 1:

		results = get_collaborative_recommended_picture(user_id)
		for i in results:
			print(i)

		continue

	elif user_input == 2:
		predict_ratings()
		print("prediction complete")

	elif user_input == 3:
		recommended_pictures = create_recommended_pictures_list(user_id)
		for i in recommended_pictures:
			print(i)
	
	print(" ")		
	print(" -=- -=- -=- -=- -=- ")
	print(f"operation effectued in {time.time()-start} sec")
	print(" -=- -=- -=- -=- -=- ")

	# test github

	# C:\Users\mathi\Desktop\Cronos\DATASETS\deep_fashion_2\fake_dataset\images\00d8ff3896fb7afe8d8bcef057d0820a.jpg