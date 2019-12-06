import numpy as np
import os
import pandas as pd
from random  import randrange

from ressources.model_collab_recommander import predict_ratings, get_collaborative_recommanded_picture

FIRST_PICTURES_LIST = [
"00b6d6ed71e27101211bd77627e5c1b2.jpg", 
"000e18920575a2e59b3a0c38e6546d29.jpg",
'00af8f65bb93f4131499dc9807129a24.jpg',
"00a722065820c4561a5522054ee62fe4.jpg"]


def create_recommended_pictures_list(user_id):
    rated_pictures = get_already_rated_pictures(user_id)
    number_ratings = len(rated_pictures)
    
    if number_ratings < 20:
        return FIRST_PICTURES_LIST
    
    else:
        temp_list = get_collaborative_recommanded_picture(user_id)
        return temp_list


def get_reco_picture_list(user_id):
    LIST_PATH = r"DB\reco_list.csv" #DB
    df = pd.read_csv(LIST_PATH)

    if user_id in df.user_id:
        x = df.iloc[user_id,1]
        cars = ["[","]","'"]
        for i in cars:
            x = x.replace(i, "")

        x = x.split(",")
        pictures_list = x

    else:
        pictures_list = less_rated_pictures_selection()

    df.loc[user_id,"recommended_picture"] ,df.loc[user_id,"user_id"] = pictures_list, user_id #DB
    df.to_csv(LIST_PATH, index = False)

    return pictures_list


def less_rated_pictures_selection()
    path_ratings = r"C:\Users\mathi\Desktop\Cronos\Fash!\DB\user_ratings_unified_3001x1000.csv"
    df = pd.read_csv(path_ratings)
    pics_count = df.picture.value_counts()
    ind = pics_count.index
    bag_pic = ind[-100:]
    bag = []
    while len(bag) < 20:
        im = bag_pic[randrange(len(bag_pic))]
        if im not in bag:
            bag.append(im)
    return bag