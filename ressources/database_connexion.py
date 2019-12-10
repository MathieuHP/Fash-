from pymongo import MongoClient
import time
import pandas as pd 


def db_connect():
	authent_string = r"mongodb+srv://math_01:Math0_91@cluster-math-01-xzcdm.mongodb.net/test?retryWrites=true&w=majority"
	cluster = MongoClient(authent_string)
	db = cluster["fash"]
	return db



