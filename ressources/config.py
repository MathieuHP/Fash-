from pymongo import MongoClient

def db_connect():
	print("connecting to db")
	authent_string = r"mongodb+srv://math_01:Math0_91@cluster-math-01-xzcdm.mongodb.net/test?retryWrites=true&w=majority"
	cluster = MongoClient(authent_string)
	db = cluster["fash"]
	return db

global db 
db = db_connect()
