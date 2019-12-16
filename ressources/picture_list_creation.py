import numpy as np
import os
import pandas as pd
from random  import randrange

from ressources.config import db, db_connect
from ressources.model_collab_recommender import predict_ratings, get_collaborative_recommended_picture, get_already_rated_pictures


def create_recommended_pictures_list(user_id):
    """ return a list of picture that the user had not rated yet """

    rated_pictures = get_already_rated_pictures(user_id)
    number_ratings = len(rated_pictures)
    
    if number_ratings < 20:
        return less_rated_pictures_selection()
    
    else:
        estimated_ratings = get_collaborative_recommended_picture(user_id)
        result = []
        i = 0
        while len(result) < 20 :
            if estimated_ratings[i]:
                if estimated_ratings[i] in rated_pictures:
                    estimated_ratings.remove(estimated_ratings[i])
                    continue
                result.append(estimated_ratings[i])
                if estimated_ratings[i] == estimated_ratings[-1]:
                    break
            i+=1
        return result


def less_rated_pictures_selection():
    """ return a list with the least reated/newest pictures """
    try:
        collection = db["user_ratings"]
    except:
        db = db_connect()
        collection = db["user_ratings"]
    
    df = pd.DataFrame(list(collection.find({})))

    pic_list = []
    collection = db["image_info"]
    results = list(collection.find({}))
    
    for i in results:
        pic_list.append(i["name"])

    try:
        pics_rated_count = df.picture.value_counts()
        ind = pics_rated_count.index
        bag_pic = ind[-100:]
    except:
        bag_pic = []


    bag = []

    for pic in pic_list:
        if pic not in bag_pic:
            bag.append(pic)

    while len(bag) < 20:
        im = bag_pic[randrange(len(bag_pic))]
        if im not in bag:
            bag.append(im)

    return bag
    

def get_recommended_picture_list(user_id):
    """ check in DB if a list of recommended picture exists, and if not, generate it, then return it """
    try:
        collection = db["list_images"]
    except:
        db = db_connect()
        collection = db["list_images"]

    if list(collection.find({"user_id":user_id})):
        result = list(collection.find({"user_id":user_id}))
        pictures_list = result[0]["list_image"]

    else:
        pictures_list = less_rated_pictures_selection()
        collection.insert_one({"user_id":user_id, "list_image":pictures_list})

    return pictures_list

