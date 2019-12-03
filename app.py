from flask import Flask, request, jsonify
from keras import backend
import os

#custom modules
from ressources.user_class import User, new_user_id
 


# init app
app = Flask(__name__)


FIRST_PICTURES_LIST = [ 
"00d8ff3896fb7afe8d8bcef057d0820a.jpg", 
"000e18920575a2e59b3a0c38e6546d29.jpg",
'00af8f65bb93f4131499dc9807129a24.jpg',
"00a722065820c4561a5522054ee62fe4.jpg"
]

# def routes

@app.route("/", methods= ["GET", "POST"])
def index():
	return'''-> /new_user :  create a new user <br /> 
	-> /first_pictures :  have a list of X (=20+/-) random pictures <br /> 
	-> /recommended_picture :  get recommended pictures list <br /> 
	-> /ratings_update :  give a rating and push it to DB <br /> 
	-> /user/<username> :  go to user page  <br /> 
	'''


@app.route("/new_user", methods=["POST"])
def new_user():
	user = User(new_user_id())

	#push data to DB

	return "user created"


@app.route("/predict", methods=["POST"])
@login_required # protect route => only logged users can access it
# def predict():
# 	backend.clear_session()
# 	print("response", request.get_json())
# 	y_test = make_prediction(input_data = request.get_json())
# 	return jsonify(y_test.tolist())



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


