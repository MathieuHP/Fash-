import numpy as np
import os
import pandas as pd

from ressources.model_collab_recommander import predict_ratings, get_collaborative_recommanded_picture

FIRST_PICTURES_LIST = [ 
"00b6d6ed71e27101211bd77627e5c1b2.jpg", 
"000e18920575a2e59b3a0c38e6546d29.jpg",
'00af8f65bb93f4131499dc9807129a24.jpg',
"00a722065820c4561a5522054ee62fe4.jpg"
]


def create_recommended_pictures_list(user_id):
    rated_pictures = get_already_rated_pictures(user_id)
    number_ratings = len(rated_pictures)
    
    if number_ratings < 20:
        return FIRST_PICTURES_LIST
    
    else:
        temp_list = get_collaborative_recommanded_picture(user_id)
        return temp_list
        