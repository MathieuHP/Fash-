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
from ressources.model_collab_recommender import predict_ratings
from ressources.picture_list_creation import get_recommended_picture_list
from image_similarity.get_embeddings import get_embeddings
from image_similarity.train_annoy_model import train_annoy_model

# init app
app = Flask(__name__)
FILE_PATH = os.path.dirname(os.path.realpath(__file__))



@app.route("/", methods= ["POST"])
@cross_origin(supports_credentials=True)
def home():
    print("Backend is on")
    return 'Backend is on'



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
    return "user created"



@app.route("/load_image_for_rating", methods=["GET"])
@cross_origin(supports_credentials=True)
def load_image_for_rating():


    user_id = 1 #!!!!


    pictures_list = get_recommended_picture_list(user_id)

    coll = db["image_info"]
    list_dict = []
    i=0
    for pic in pictures_list:
        get_info = coll.find_one({"name":pic})
        list_dict.append({
            "name": pictures_list[i],
            "typeCloth": get_info["typeCloth"],
            "materialCloth": get_info["materialCloth"],
            "productionMethod": get_info["productionMethod"],
            "price": get_info["price"],
            "sex": get_info["sex"],
            "description": get_info["description"]
            })
        i+=1

    send_image_info = jsonify(list_dict)
    return send_image_info



@app.route("/show_image", methods=["POST"])
@cross_origin(supports_credentials=True)
def show_image():

    user_id = 1


    json_data = request.get_json(force = True)
    filename = './imagesOnDb/' + json_data['imageName']
    send_file_image = send_file(filename, mimetype='image/jpg')

    return send_file_image



@app.route("/rate_image", methods=["POST"])
@cross_origin(supports_credentials=True)
def rate_image():
    json_data = request.get_json(force = True)

    user_id = 1 # !!!!

    name = json_data['imageName']
    rating = json_data["rating"]
    coll = db["user_ratings"]
    post = {"user_id":user_id, "picture":name,"rating":rating}
    coll.insert_one(post)
    
    if rating == 2:
        coll = db["list_images"]
        results = list(coll.find({}))
        for res in results:
            if res["user_id"] == user_id:
                try: 
                    super_like = res["super_like"]
                    super_like.append(name)
                except:
                    super_like  = [name]
                
                result = coll.update_one({"_id":res["_id"]},{"$set":{"super_like":super_like}})


    coll = db["list_images"]
    result = coll.find({"user_id":user_id})
    list_pic = result[0]["list_image"]
    push_db = coll.update_one({"_id":result[0]["_id"]}{"$set"{"list_image":list_pic[1:]}})
        

    print(json_data)
    return "All good!"



@app.route("/cart", methods=["POST"])
@cross_origin(supports_credentials=True)
def cart():

    user_id = 1

    try:
        
        collection = db["user_ratings"]
        super_like = list(collection.find({"user_id":user_id, "rating":2}))
        like = list(collection.find({"user_id":user_id, "rating":1}))
        
        for i in range(len(super_like)):
            super_like[i] = super_like[i]["picture"]
        for i in range(len(like)):
            like[i] = like[i]["picture"]

        liked_picture = {"like" : tuple(like), "super_like" : tuple(super_like) }
        return liked_picture
    except:
        return ''


# run server
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug = True)
#    app.run(host="0.0.0.0", port = os.environ["PORT"])
