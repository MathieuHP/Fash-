from ressources.model_collab_recommender import predict_ratings, check_minimum_data
from ressources.picture_list_creation import create_recommended_pictures_list
from ressources.config import db
from ressources.enable_collab import run_thread

import time
from pymongo import MongoClient


loop = True

user_id = 1

while loop == True:

	user_input =  int(input(f""" \n
		0 => Exit \n 
		99 = > change user_id (current = {user_id}) \n
		1 => get_collaborative_recommended_picture \n
		2 => predict ratings \n
		3 => create_recommended_pictures_list \n
		4 => enable collab \n
		5 => run_thread \n
		 """))

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

	elif user_input == 4:
		x = check_minimum_data()
		print(x)

	elif user_input == 5:
		print("launching thread to predict with collab")
		run_thread()

	
	print(" ")		
	print(" -=- -=- -=- -=- -=- ")
	print(f"operation effectued in {time.time()-start} sec")
	print(" -=- -=- -=- -=- -=- ")

	# test github

	# C:\Users\mathi\Desktop\Cronos\DATASETS\deep_fashion_2\fake_dataset\images\00d8ff3896fb7afe8d8bcef057d0820a.jpg