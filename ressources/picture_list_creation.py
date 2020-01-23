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
    results = list(collection.find({"user_id":user_id}))
    try:
        rated_pictures = [pic["picture"] for pic in results]
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
            sex_c = False
            type_c = False
            material_c = False
            production_c = False
            for elem in clothe_sex:
                if elem == 'all' or elem == clothe["sex"]:
                    sex_c = True
            if not sex_c:
                return False 
            
            for elem in clothe_type:
                if elem == 'all' or str(elem) == str(clothe["typeCloth"]):
                    type_c = True
            if not type_c:
                return False
            
            for elem in clothe_material:
                if elem == 'all' or str(elem) == str(clothe["materialCloth"]):
                    material_c = True
            if not material_c:
                return False    
            
            for elem in clothe_production:
                if elem == 'all' or str(elem) == str(clothe["productionMethod"]):
                    production_c = True
            if not production_c:
                return False 
            
            if not clothe_price_down == 'all':
                if int(clothe_price_down) > int(clothe["price"]):
                    return False
            if not clothe_price_up == 'all':
                if int(clothe_price_up) < int(clothe["price"]):
                    return False
            return True

        return _predicate

    my_filtered_clothes = list(filter(predicate(
        clothe_sex, clothe_type,  clothe_material, clothe_production, clothe_price_down, clothe_price_up
    ), clothes_list))
    print(f"filtered clothes : {len(my_filtered_clothes)} out of {len(clothes_list)} total pictures")

    return my_filtered_clothes


def less_rated_pictures_selection(candidates, alread_rated_pics):
    """ return a list with the least reated pictures """

    #get all rated picture and sort them by ascending number of ratings
    collection = db["user_ratings"]
    ratings = pd.DataFrame(list(collection.find({})))
    if ratings.shape == (0,0):
        return candidates
    else:
        ratings_count = ratings["picture"].value_counts()
        rate_index =np.array(ratings_count.index)
        rate_index =np.flip(rate_index)

    #get all picture and sort those with no ratings
    coll = db.image_info
    all_images = list(coll.find({}))
    not_rated_pics = [res["name"] for res in all_images if res["name"] not in rate_index]

    #add zero ratings pictures in the bag if they match filters, then add less rated pictures if needed
    bag = [pic for pic in not_rated_pics if pic in candidates]
    counter = 0

    while len(bag) < 10:
        if counter >= len(rate_index):
            break    
        if rate_index[counter] in candidates:
            bag.append(rate_index[counter])
        counter += 1

    shuffle(bag)
    return bag


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


def create_picture_list(user_id, filt_dic, actual_list, already_rated_pics):
    """create list of picture to give to user
    inputs:  user_id and filter dict
    output: list of picture, or False if user as already seen all pictures"""

    print("--== CREATING PICTURE LIST ==--")
    #retreive already rated pictures and filtered pictures, 
    #then return a picture with candidates pictures
    filtered_clothes = filter_pictures(filt_dic)

    try:
        len(already_rated_pics)
    except:
        already_rated_pics = []

    candidates = [pic["name"] for pic in filtered_clothes 
                  if pic["name"] not in already_rated_pics and pic["name"] not in actual_list]

            
    #check if user has already seen all pictures
    if len(candidates) == 0:
        print("you've already seen all the pictures")
        return []

    #check if user has already rated enough pictures, and if not return list with less rated pictures
    list_new_pic = less_rated_pictures_selection(candidates, already_rated_pics)
    
    if len(already_rated_pics) < 10 and len(list_new_pic) > 5:
        return list_new_pic

    super_like = False
    collab_on = False

    print("__ testing minimum data __")

    if check_minimum_data():
        collab_on = True
        predict_ratings()   #TO REMOVE ? train collab reco, takes 0.5-0.7 sec with few datas
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
        final = [pic for pic in list_final if pic in candidates]
        return set(final)

    elif len(list_new_pic) > 0:     
        final = [pic for pic in list_new_pic if pic in candidates]
        return set(final)

    else:
        return []


def get_recommended_picture_list(user_id, filt_dic):
    """ check in DB if a list of recommended picture exists, and if not, generate it then return it """
    collection = db["list_images"]
    result = list(collection.find({"user_id":user_id}))
    already_rated_pics = get_already_rated_pictures(user_id)

    try:
        list_image = result[0]["list_image"]
        if not list_image:
            list_image = []
            
        if len(list_image) < 7 and type(list_image)== list:
            pictures_list = list(create_picture_list(user_id, filt_dic, list_image,already_rated_pics))
        else:
            pictures_list = list_image

    except:
        list_image = []
        pictures_list = list(create_picture_list(user_id, filt_dic, list_image, already_rated_pics))

    pictures_list = [pic for pic in pictures_list if pic not in already_rated_pics]

    cursor = collection.update_one({"user_id": user_id },{"$set":{"list_image":pictures_list}})
    for i in enumerate(pictures_list):
        print(i)
    return pictures_list

