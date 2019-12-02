from user_class import User
from model_embeddings import image_to_embedding
from model_collaborative_recommander import predict_ratings, get_recommanded_picture
import time

loop = True

while loop == True:

	user_input =  int(input(""" \n
		0 => Exit \n  
		1 => from image returns embeddings \n
		2 => predict ratings \n
		3 => get recommended picture for specified user_id \n
		"""))
	start = time.time()

	if user_input == 0 :
		loop = False
		continue


	if user_input == 1:
		img_path =  input("enter complete image path")
		emb = image_to_embedding(img_path)
		print(emb)
		continue

	if user_input == 2:
		predict_ratings()
		print("prediction complete")

	if user_input == 3:
		user_id = int(input("enter user ID"))
		results = get_recommanded_picture(user_id)
		for i in results:
			print(i)





	print(" -=- -=- -=- -=- -=- ")
	print(f"operation effectued in {time.time()-start} sec")
	print(" -=- -=- -=- -=- -=- ")