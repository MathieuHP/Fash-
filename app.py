from flask import Flask, request, jsonify, send_file
from tensorflow.keras import backend
import os
import cv2
import pandas as pd
import numpy as np
import time
import json
from flask_cors import CORS, cross_origin

#custom modules
from ressources.config import db, db_connect
from ressources.model_collab_recommender import predict_ratings, get_collaborative_recommended_picture
from ressources.picture_list_creation import create_recommended_pictures_list, get_recommended_picture_list

from image_similarity.get_embeddings import get_embeddings
from image_similarity.train_annoy_model import train_annoy_model

# init app
app = Flask(__name__)
FILE_PATH = os.path.dirname(os.path.realpath(__file__))

@app.route("/", methods= ["POST"])
@cross_origin(supports_credentials=True)
def home():
    print("Backend is on")
    return 'All good !'

@app.route("/upload_image", methods= ["POST"])
@cross_origin(supports_credentials=True)
def upload_image():
    UPLOAD_FOLDER = './image_similarity/data/train/'
    ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg']
    image_file = request.files["imageFile"]
    typeCloth = request.form["typeCloth"]
    materialCloth = request.form["materialCloth"]
    productionMethod = request.form["productionMethod"]
    price = request.form["price"]
    sex = request.form["sex"]
    description = request.form["description"]
    extension = os.path.splitext(image_file.filename)[1]
    if not extension in ALLOWED_EXTENSIONS :
        return 'Invalid extension'
    
    if not os.path.isdir(UPLOAD_FOLDER):
        os.mkdir(UPLOAD_FOLDER)
    
    if os.path.isfile('./image_similarity/outfile/nbrFiles.npy'):
        nbrFiles = np.load('./image_similarity/outfile/nbrFiles.npy').astype(int)
        filename = "IMG_" + str(nbrFiles +1) + extension
    else:
        filename = "IMG_1" + extension

    destination = UPLOAD_FOLDER + filename
    image_file.save(destination)
    while not os.path.exists(destination):
        print('waiting')
        time.sleep(1)

    if os.path.isfile(UPLOAD_FOLDER + filename):
        get_embeddings()
        train_annoy_model()
        coll = db["image_info"]
        coll.insert_one({
            "name":filename,
            "path": destination,
            "typeCloth": typeCloth,
            "materialCloth": materialCloth,
            "productionMethod": productionMethod,
            "price": price,
            "sex": sex,
            "description": description
        })
    
    return 'All good'

@app.route("/new_user", methods=["POST"])
def new_user():
    user = User(new_user_id())
    #push data to DB
    return "user created"


@app.route("/load_image_for_rating", methods=["GET"])
@cross_origin(supports_credentials=True)
def load_image_for_rating():
    user_id = 1
    pictures_list_info = get_recommended_picture_list(user_id)
    # TODO GET ALL THE INFO FROM THE DB
    
    for i in range(len(pictures_list_info)):
        pictures_list_info[i] = {
            "name": pictures_list_info[i],
            "path": "destination" + str([i]),
            "typeCloth": "typeCloth"+ str([i]),
            "materialCloth": "materialCloth"+ str([i]),
            "productionMethod": "productionMethod"+ str([i]),
            "price": "price"+ str([i]),
            "sex": "sex"+ str([i]),
            "description": "description"+ str([i])
        }

    send_image_info = jsonify(pictures_list_info)
    return send_image_info

@app.route("/show_image", methods=["POST"])
@cross_origin(supports_credentials=True)
def show_image():
    json_data = request.get_json(force = True)
    filename = './imagesOnDb/' + json_data['imageName']
    send_file_image = send_file(filename, mimetype='image/jpg')    
    return send_file_image

@app.route("/rate_image", methods=["POST"])
@cross_origin(supports_credentials=True)
def rate_image():
    json_data = request.get_json(force = True)
    print(json_data)
    return "All good!"

    # TODO PUSH RATINGS INTO DB

# @app.route("/train", methods = ["GET"])
# def train():
#     model_cnn()
#     return("training completed")


# @app.route('/user/<username>')
# # def profile(username):

# run server
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug = True)
#    app.run(host="0.0.0.0", port = os.environ["PORT"])
