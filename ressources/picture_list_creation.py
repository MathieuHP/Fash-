import numpy as np
import os
import pandas as pd
from random  import randrange, shuffle
from bson import ObjectId

from ressources.config import db, db_connect
from ressources.model_collab_recommender import predict_ratings, check_minimum_data
from ressources.enable_collab import train_collab
from image_similarity.get_similar_images import get_similar_images

def get_already_rated_pictures(user_id):
    """retreive all pictures the user already rated"""
    collection = db["user_ratings"]
    rated_pictures = pd.DataFrame(list(collection.find({"user_id":user_id})))
    try:
        rated_pictures = np.array(rated_pictures[["picture"]])
    except:
        rated_pictures = []
    return rated_pictures


def filter_pictures(filt_dic):
    """filter out picture based on preferences"""
    
    coll = db.image_info
    clothes_list =  list(coll.find({}))

    clothe_sex = filt_dic["clothe_sex"]
    clothe_type = filt_dic["clothe_type"]
    clothe_material = filt_dic["clothe_material"]
    clothe_production = filt_dic["clothe_production"]
    clothe_price_range = filt_dic["clothe_price_range"]
    clothe_price_down = str(clothe_price_range[0])
    clothe_price_up = str(clothe_price_range[1])

    def predicate(clothe_sex, clothe_type,  clothe_material, clothe_production, 
                  clothe_price_down, clothe_price_up):

        def _predicate(clothe):

            if not clothe_sex == 'all' and not clothe_sex == clothe["sex"]:
                return False
            if not clothe_type == 'all' and not clothe_type == clothe["typeCloth"]:
                return False
            if not clothe_material == 'all' and not clothe_material == clothe["materialCloth"]:
                return False
            if not clothe_production == 'all' and not clothe_production == clothe["productionMethod"]:
                return False
            if not clothe_price_down == 'all' and int(clothe_price_down) > int(clothe["price"]):
                return False
            if not clothe_price_up == 'all' and int(clothe_price_up) < int(clothe["price"]):
                return False
            return True

        return _predicate

    my_filtered_clothes = list(filter(predicate(
        clothe_sex, clothe_type,  clothe_material, clothe_production, clothe_price_down, clothe_price_up
    ), clothes_list))

    return my_filtered_clothes


def less_rated_pictures_selection(candidates, alread_rated_pics):
    """ return a list with the least reated pictures """

    collection = db["user_ratings"]
    ratings = pd.DataFrame(list(collection.find({})))

    if ratings.shape == (0,0):
        return candidates
    else:
        ratings_count = ratings["picture"].value_counts()
        rate_index =np.array(ratings_count.index)
        rate_index =np.flip(rate_index)

    bag = [pic for pic in candidates if pic not in rate_index]
    
    if len(bag) < 10 :
        x= len(bag)-10
        for i in range(x):
            if rate_index[-i] not in alread_rated_pics:
                bag.append(rate_index[-i])
        
    shuffle(bag)
    if len(bag) > 0:
        return bag[:15]
    else:
        return None


def get_collaborative_recommended_picture(user_id, candidates):
    """ get 10 best estimated pictures for an user_id from 
    Surprise predictions """

    collection = db["predicted_ratings_collab"]
    predictions = collection.find({"user_id": user_id})

    estimated_ratings = []
    for pred in predictions:
        estimated_ratings.append([pred["estimation"] , pred["picture"]])
    if len(estimated_ratings) < 10:
        x = len(estimated_ratings)
    else:
        x= 10
    estimated_ratings.sort(reverse = True)
    return [estimated_ratings[i][1] for i in range(x) if estimated_ratings[i][1] in candidates]


def create_picture_list(user_id, filt_dic, actual_list):
    """create list of picture to give to user
    inputs:  user_id and filter dict
    output: list of picture, or False if user as already seen all pictures"""

    #retreive already rated pictures and filtered pictures, then return a picture with candidates pictures
    already_rated_pics = get_already_rated_pictures(user_id)
    filtered_clothes = filter_pictures(filt_dic)

    candidates = [pic["name"] for pic in filtered_clothes 
                  if pic["name"] not in already_rated_pics and pic["name"] not in actual_list]
            
    #check if user has already seen all pictures
    if len(candidates) == 0:
        print("you've already seen all the pictures")
        return False

    #check if user has already rated enough pictures, and if not return list with less rated pictures
    list_new_pic = less_rated_pictures_selection(candidates, already_rated_pics)
    if len(already_rated_pics) < 10 and len(list_new_pic) > 5:
        print("got brand new pictures")
        return list_new_pic

    super_like = False
    collab_on = False

    print("__ testing minimum data __")

    if check_minimum_data():
        collab_on = True
        predict_ratings()   #TO REMOVE ? train collab reco
        print("-- data amount OK --")

    collection = db["list_images"]
    results = list(collection.find({"user_id": user_id}))[0]

    #check with geoffrey cmt il feed son annoy car il faut appliquer les filtres
    if len(results["super_like"]) > 0:
        sup_like = results["super_like"]
        list_annoy = get_similar_images(sup_like[0], candidates)
        if len(list_annoy) >= 5:
            super_like = True
            cursor = collection.update_one({"_id":results["_id"]},{"$set":{"super_like":sup_like[1:]}})

    if collab_on:
        list_collab = get_collaborative_recommended_picture(user_id, candidates)
        if len(list_collab) < 1:
            collab_on = False

    list_final = []

    print(f"-=_=- super_like => {super_like}")
    print(f"-=_=- collab_on => {collab_on}")

    if super_like == True and collab_on == True:
        for i, j in zip(list_annoy, list_collab) :
            list_final.append(i)
            list_final.append(j)      

    elif super_like == False and collab_on == True:
        for i, j in zip(list_new_pic, list_collab) :
            list_final.append(i)
            list_final.append(j)    

    elif super_like == True and collab_on == False:
        for i, j,k in zip(list_annoy, list_collab, list_new_pic):
            list_final.append(i)
            list_final.append(j)
            list_final.append(k)

    if len(list_final) > 0:
        return [pic for pic in list_final if pic in candidates]
    elif len(list_new_pic)>0:     
        return [pic for pic in list_new_pic if pic in candidates]
    else:
        return False


def get_recommended_picture_list(user_id, filt_dic):
    """ check in DB if a list of recommended picture exists, and if not, generate it then return it """
    collection = db["list_images"]
    result = list(collection.find({"user_id":user_id}))

    try:
        list_image = result[0]["list_image"]

        if len(list_image) < 3 and type(pictures_list)== list:
            pictures_list = list_image.extend(create_recommended_pictures_list(user_id, filt_dic, list_image))
        else:
            pictures_list = list_image

    except:
        pictures_list = create_recommended_pictures_list(user_id, filt_dic, [])

    cursor = collection.update_one({"user_id": user_id },{"$set":{"list_image":pictures_list}})
    return pictures_list


