from ressources.user_class import User
from ressources.model_collab_recommander import predict_ratings, get_collaborative_recommanded_picture, create_recommended_pictures_list
from ressources import *
import time

loop = True

user_id = 1

while loop == True:

	user_input =  int(input(f""" \n
		0 => Exit \n 
		00 = > change user_id (current = {user_id}) 
		1 => get_collaborative_recommanded_picture \n
		2 => predict ratings \n
		3 => get_collaborative_recommanded_picture  \n
		4 => create_recommended_pictures_list \n
		"""))
	start = time.time()

	if user_input == 0 :
		loop = False
		continue
	elif user_input == 00:
		inp = int(input("set new user_id"))
		user_id = inp
		continue


	elif user_input == 1:

		get_collaborative_recommanded_picture(user_id)
		continue

	elif user_input == 2:
		predict_ratings()
		print("prediction complete")

	elif user_input == 3:
		results = get_collaborative_recommanded_picture(user_id)
		for i in results:
			print(i)

	elif user_input == 4:
		recomended_pictures = create_recommended_pictures_list(user_id)
		for i in recomended_pictures:
			print(i)
			
	print(" -=- -=- -=- -=- -=- ")
	print(f"operation effectued in {time.time()-start} sec")
	print(" -=- -=- -=- -=- -=- ")

	# test github

	# C:\Users\mathi\Desktop\Cronos\DATASETS\deep_fashion_2\fake_dataset\images\00d8ff3896fb7afe8d8bcef057d0820a.jpg