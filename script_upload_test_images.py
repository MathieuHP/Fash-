from flask import Flask, request, jsonify, send_file
from tensorflow.keras import backend
import os
import cv2
import pandas as pd
import numpy as np
import time
import json
from flask_cors import CORS, cross_origin
import shutil

#custom modules
from ressources.config import db, db_connect
from ressources.model_collab_recommender import predict_ratings, get_collaborative_recommended_picture
from ressources.picture_list_creation import create_recommended_pictures_list, get_recommended_picture_list

from image_similarity.get_embeddings import get_embeddings
from image_similarity.train_annoy_model import train_annoy_model


UPLOAD_FOLDER = './image_similarity/data/train/'
ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg','png', 'jpg', 'jpeg']

les_200_images = r'./les_200_images/'
for file in os.listdir(les_200_images):
    print("--------")
    print("--------")
    print(file)
    print("--------")
    print("--------")    

    image_file = file
    extension = "." + file.split(".")[1]
    img_file = les_200_images + file
    
    if not extension in ALLOWED_EXTENSIONS :
        print('Invalid extension')
    
    if not os.path.isdir(UPLOAD_FOLDER):
        os.mkdir(UPLOAD_FOLDER)
    
    if os.path.isfile('./image_similarity/outfile/nbrFiles.npy'):
        nbrFiles = np.load('./image_similarity/outfile/nbrFiles.npy').astype(int)
        filename = "IMG_" + str(nbrFiles +1) + extension
    else:
        filename = "IMG_1" + extension

    destination = UPLOAD_FOLDER + filename
    shutil.move(img_file, destination)

    # while not os.path.exists(destination):
    #     print('waiting')
    #     time.sleep(1)

    if os.path.isfile(destination):
        get_embeddings()
        train_annoy_model()
        coll = db["image_info"]
        coll.insert_one({
            "name":filename,
        })
        print("--------")
        print("--------")
        print("PUSHED TO DB")
        print("--------")
        print("--------")
    
    print("--------")
    print("--------")
    print(filename)
    print("--------")
    print("--------")  

    print("script is working")
    
    # break