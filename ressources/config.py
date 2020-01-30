from pymongo import MongoClient
import app


def db_connect():
	authent_string = r"mongodb+srv://math_01:Math0_91@cluster-math-01-xzcdm.mongodb.net/test?retryWrites=true&w=majority"
	cluster = MongoClient(authent_string)
	db = cluster["fash"]
	print("connection to db successfull !")
	return db

global db 
db = db_connect()

# global SECRET_KEY
# global SECURITY_PASSWORD_SALT
# global JWT_SECRET_KEY

app.config['SECRET_KEY'] = 'my_precious_internship_at_brainjar'
 
app.config['SECURITY_PASSWORD_SALT'] = 'my_precious_training_at_becode'

app.config['JWT_SECRET_KEY'] = 'this_secret_wont_be_enough'