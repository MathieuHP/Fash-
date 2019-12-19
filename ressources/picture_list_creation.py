import numpy as np
import os
import pandas as pd
from random  import randrange, shuffle
from bson import ObjectId

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


def less_rated_pictures_selection(rated_pictures, sex):
    """ return a list with the least reated pictures """

    collection = db["user_ratings"]
    ratings = pd.DataFrame(list(collection.find({})))
    ratings_count = ratings["picture"].value_counts()

    rate_ind = np.array(ratings_count.index)
    rate_ind =np.flip(rate_ind)

    coll = db["image_info"]
    results = list(coll.find({"sex":sex}))
    result = [res["name"] for res in results]

    bag = [pic for pic in rate_ind if pic not in rated_pictures and pic in result]

    shuffle(bag)
    if len(bag) > 0:
        return bag[:15]
    else:
        return None

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
    if len(estimated_ratings) < 20:
        return []
    else:
        return [estimated_ratings[i][1] for i in range(20) if i not in rated_pictures]

"""    
format surprise.predict()
Prediction (
uid=1, 
iid='00b10502fb082dcc8f156562b71f6f91.jpg', 
r_ui=0.6009273632105954,
est=0.5726982131029839, 
details={'was_impossible': False}
)"""


def create_recommended_pictures_list(user_id, rated_pictures, sex):
    """ return a list of picture that the user had not rated yet """    
    number_ratings = len(rated_pictures)

    list_new_pic = less_rated_pictures_selection(rated_pictures, sex)
    if list_new_pic == None:
        return "YOU ALREADY LIKE ALL THE PICTURES"

    if number_ratings < 15:
        return list_new_pic

    super_like = False
    collab_on = False

    collection = db["list_images"]
    results = list(collection.find({"user_id": user_id}))[0]
    print(results)

    if len(results["super_like"]) > 0:
        sup_like = results["super_like"]
        list_annoy = get_similar_images(sup_like[0])
        list_annoy = [pic for pic in list_annoy if pic not in rated_pictures]
        super_like = True
        result = collection.update_one({"_id":results["_id"]},{"$set":{"super_like":sup_like[1:]}})

    if number_ratings > 20:
        collab_on = True
        list_collab = get_collaborative_recommended_picture(user_id, rated_pictures)
        if len(list_collab) < 10:
            collab_on = False
    list_final = []

    print(f"-=_=- super_like => {super_like}")
    print(f"-=_=- collab_on => {collab_on}")

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

    if len(list_final) > 0:
        return list_final
    else:     
        return list_new_pic


def get_recommended_picture_list(user_id):
    """ check in DB if a list of recommended picture exists, and if not, generate it then return it """
    rated_pictures = get_already_rated_pictures(user_id)
    collection = db["list_images"]
    result = list(collection.find({"user_id":user_id}))

    coll = db["user_info"]
    sex = list(coll.find({"_id":ObjectId(user_id)}))[0]["sex"]

    try:
        list_image = result[0]["list_image"]

        if len(list_image) < 8 and type(pictures_list)== list:
            pictures_list = list_image.extend(create_recommended_pictures_list(user_id= user_id,rated_pictures= rated_pictures, sex=sex))
        else:
            pictures_list = list_image

    except:
        pictures_list = create_recommended_pictures_list(user_id= user_id,rated_pictures= rated_pictures, sex=sex)
    final_list = [pic for pic in pictures_list if pic not in rated_pictures]

    collection.update_one({"user_id": user_id },{"$set":{"user_id":user_id, "list_image":final_list}})
    return final_list