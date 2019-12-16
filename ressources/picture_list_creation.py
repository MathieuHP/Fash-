import numpy as np
import os
import pandas as pd
from random  import randrange

from ressources.config import db, db_connect
from ressources.model_collab_recommender import predict_ratings
from image_similarity.get_similar_images import get_similar_images

def get_already_rated_pictures(user_id):

    collection = db["user_ratings"]
    rated_pictures = pd.DataFrame(list(collection.find({"user_id":user_id})))
    try:
        rated_pictures = np.array(rated_pictures[["picture"]])
    except:
        rated_pictures = []
    return rated_pictures


def less_rated_pictures_selection(rated_pictures):
    """ return a list with the least reated pictures """

    collection = db["image_info"]
    results = list(collection.find({}))

    pic_list = [i["name"] for i in results]    
    bag = [pic for pic in pic_list if pic not in rated_pictures]

    while len(bag) < 15:
        im = bag_pic[randrange(len(bag_pic))]
        if im not in bag:
            bag.append(im)

    return bag[:15]


def get_collaborative_recommended_picture(user_id, rated_pictures):

    """ get 10 best estimated pictures for an user_id from 
    Surprise predictions """

    collection = db["predicted_ratings_collab"]
    predictions = collection.find({"user_id": user_id})

    estimated_ratings = []
    for pred in predictions:
        if int(pred["user_id"]) == user_id:
            estimated_ratings.append([pred["estimation"] , pred["picture"]])
    estimated_ratings.sort(reverse = True)

    return [estimated_ratings[i][1] for i in range(10) if i not in rated_picture]

"""    
format surprise.predict()
Prediction (
uid=1, 
iid='00b10502fb082dcc8f156562b71f6f91.jpg', 
r_ui=0.6009273632105954,
est=0.5726982131029839, 
details={'was_impossible': False}
)"""


def create_recommended_pictures_list(user_id):
    """ return a list of picture that the user had not rated yet """

    rated_pictures = get_already_rated_pictures(user_id)
    
    number_ratings = len(rated_pictures)

    list_new_pic = less_rated_pictures_selection(rated_pictures)

    if number_ratings < 15:
        return list_new_pic

    super_like = False
    collab_on = False
    # check if super like in "short storage !!! (todo)"
    collection = db["list_images"]
    results = list(collection.find({"user_id": user_id}))

    if results[0]["super_like"]:
        list_annoy = get_similar_images(results[0]["super_like"])
        super_like = True

    if number_ratings > 20:
        collab_on = True
        list_collab = get_collaborative_recommended_picture(user_id, rated_pictures)

    list_final = []

    if super_like == True and collab_on == True:
        for i in range(5):
            list_final.append(list_annoy.pop(0))
            list_final.append(list_collab.pop(0))
            list_final.append(list_new_pic.pop(0))

    elif super_like == False and collab_on == True:
        for i in range(5):
            list_final.append(list_collab.pop(0))
            list_final.append(list_collab.pop(0))
            list_final.append(list_new_pic.pop(0))

    elif super_like == True and collab_on == False:
        for i in range(5):
            list_final.append(list_annoy.pop(0))
            list_final.append(list_annoy.pop(0))
            list_final.append(list_new_pic.pop(0))

    else:
        return list_new_pic      

    return list_final


def get_recommended_picture_list(user_id=1):
    """ check in DB if a list of recommended picture exists, and if not, generate it, then return it """

    collection = db["list_images"]

    if list(collection.find({"user_id":user_id})):
        result = list(collection.find({"user_id":user_id}))
        try:
            pictures_list = result[0]["list_image"]
        except:
            pictures_list = create_recommended_pictures_list(user_id)
            collection.insert_one({"user_id":user_id, "list_image":pictures_list})

    return pictures_list
