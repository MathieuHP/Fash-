import pandas as pd
import numpy as np
import os

DB_PATH = "./DB/user_ratings_unified_3001x1000.csv"

class User:
    def __init__(self, user_id):
        self.user_id = user_id
        self.ratings = 0
        
    def get_demographics_info(self, age, location):
        self.age = age
        self.location = location
        
        
    def rate_picture(self, picture ):   # get rating from user
        picture_rating = int(input(" do you like this picture? \n 0 = no ,  1 = like , 2 = super-like"))  
        self.update_database_ratings(picture, picture_rating)

    def update_database_ratings(self, picture, rating):
        db_path = r"C:\Users\mathi\Desktop\Cronos\Fash!\DB\user_ratings_unified_3001x1000.csv"
        df = pd.read_csv(db_path)
        if picture not in np.array(df.picture[df["user_id"] == self.user_id]):
            df = df.append({"picture" : picture, "rating":rating, "user_id": user_id }, ignore_index = True)
            df.to_csv(db_path, index = False)
            self.ratings += 1
            print(f" rating of  {rating} / 2 for {picture} pushed to DB")
        else:
            print("image already rated")


def new_user_id():
    df = pd.read_csv(DB_PATH)
    user_id = df.user_id.max()
    user_id += 1
    user = User(user_id)

    return user


