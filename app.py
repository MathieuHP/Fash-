from flask import Flask, request, jsonify
from keras import backend
import os
import cv2

#custom modules
from ressources.user_class import User, new_user_id
from ressources.model_embeddings import image_to_embedding
from ressources.model_collab_recommander import predict_ratings, get_collaborative_recommanded_picture, create_recommended_pictures_list


# init app
app = Flask(__name__)


FILE_PATH = os.path.dirname(os.path.realpath(__file__))


# # * ---------- DATABASE CONFIG --------- *
# DATABASE_USER = os.environ['DATABASE_USER']
# DATABASE_PASSWORD = os.environ['DATABASE_PASSWORD']
# DATABASE_HOST = os.environ['DATABASE_HOST']
# DATABASE_PORT = os.environ['DATABASE_PORT']
# DATABASE_NAME = os.environ['DATABASE_NAME']

# def DATABASE_CONNECTION():
#     return psycopg2.connect(user=DATABASE_USER,
#                               password=DATABASE_PASSWORD,
#                               host=DATABASE_HOST,
#                               port=DATABASE_PORT,
#                               database=DATABASE_NAME)



# def routes

@app.route("/", methods= ["GET", "POST"])
def index():
	return'''-> /new_user :  create a new user <br /> 
	-> /recommended_picture :  get recommended pictures list <br /> 
	-> /ratings_update :  give a rating and push it to DB <br /> 
	-> /user/<username> :  go to user page  <br /> 
	'''


@app.route("/new_user", methods=["POST"])
def new_user():
	user = User(new_user_id())

	#push data to DB

	return "user created"


@app.route("/load_image_for_rating", methods=["POST"])
@login_required # protect route => only logged users can access it
def load_image_for_rating():

	# DATABASE_CONNECTION()
	# ------------- get picture list for the user ------------- *
	LIST_PATH = r"DB\reco_list.csv"
	df = pd.read_csv(LIST_PATH)
	user_id = 5

	if user_id in df.user_id:
    	pictures_list = df.iloc[user_id,1]
    else:
		pictures_list = FIRST_PICTURES_LIST


	backend.clear_session()
	image = pictures_list.pop(0)


	# ------------- send list back to DB and create new one if ------------- *
	if len(picture_list) < 10:  # MULTITHREADING !!!!

fswerfwsgrdx
	image = cv2.imread( FILE_PATH + "/" + image)

	return image #jsonify(image)


@app.route("/rate_image", methods=["POST"])
@login_required 
def rate_image():
	json_data = request.get_json()
	# DATABASE_CONNECTION()
	# ------------- push to db : rating x image x user => to DB ------------- *

	return redirect(url_for('load_image_for_rating'))


# @app.route("/train", methods = ["GET"])
# def train():
# 	model_cnn()
# 	return("training completed")


# @app.route('/user/<username>')
# # def profile(username):



# run server
if __name__ == "__main__":
	app.run(host="127.0.0.1", port=5000, debug = True)
#	app.run(host="0.0.0.0", port = os.environ["PORT"])
