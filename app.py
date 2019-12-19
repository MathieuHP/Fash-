from flask import Flask, request, jsonify, send_file, json 
from tensorflow.keras import backend
import os
import cv2
import pandas as pd
import numpy as np
import time
import json
from bson import ObjectId
from flask_cors import CORS, cross_origin

from bson.objectid import ObjectId 
from datetime import datetime 
from flask_bcrypt import Bcrypt 
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

#custom modules
from ressources.config import db, db_connect
from ressources.model_collab_recommender import predict_ratings
from ressources.picture_list_creation import get_recommended_picture_list
from image_similarity.get_embeddings import get_embeddings
from image_similarity.train_annoy_model import train_annoy_model

# init app
app = Flask(__name__)
FILE_PATH = os.path.dirname(os.path.realpath(__file__))

app.config['JWT_SECRET_KEY'] = 'this_secret_wont_be_enough'
app.config['JWT_HEADER_TYPE'] = None

bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

@app.route("/", methods= ["GET"])
def home():
    current_user = get_jwt_identity()
    if current_user:
        print(current_user)
    print("Backend is on")
    return 'Backend is on'

@app.route("/check_token", methods= ["GET"])
@jwt_required
def check_token():
    return jsonify({"valid" : 'Token is valid'})


@app.route("/upload_image", methods= ["POST"])
@jwt_required
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
    
    return jsonify({"valid" : "Cloth has been uploaded"})


@app.route('/new_user', methods=["POST"])
def new_user():
    try:
        user = db.user_info
        first_name = request.get_json()['first_name']
        last_name = request.get_json()['last_name']
        email = request.get_json()['email']
        password = bcrypt.generate_password_hash(request.get_json()['password']).decode('utf-8')
        created = datetime.utcnow()

        user_id = user.insert_one({
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'password': password,
            'created': created 
        })
        
        return 'ok'
    except:
        return ''


@app.route('/login', methods=['POST'])
def login():
    user = db.user_info
    email = request.get_json(force = True)['email']
    password = request.get_json(force = True)['password']
    result = ""

    response = user.find_one({'email': email})
    
    if response:
        if bcrypt.check_password_hash(response['password'], password):
            access_token = create_access_token(identity = {
                'first_name': response['first_name'],
                'last_name': response['last_name'],
                'email': response['email'],
                '_id': str(response['_id'])
            })
            result = jsonify({'token' : access_token})
        else:
            print("Invalid username and password")
            result = ""
    else:
        print("No results found")
        result = ""
    return result 



@app.route("/load_image_for_rating", methods=["GET"])
@jwt_required
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
def show_image():
    json_data = request.get_json(force = True)
    filename = './imagesOnDb/' + json_data['imageName']
    send_file_image = send_file(filename, mimetype='image/jpg')

    return send_file_image



@app.route("/rate_image", methods=["POST"])
@jwt_required
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
    print(json_data)
    return jsonify({"valid" : "Image has been rated"})



@app.route("/cart", methods=["POST"])
@jwt_required
def cart():
    # current_user = get_jwt_identity()
    # if current_user:
    try:
        user_id = 1
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
