from flask import Flask, request, jsonify, send_file, json, url_for, redirect, render_template, flash
from flask_mail import Mail, Message
from tensorflow.keras import backend
import os
import cv2
import pandas as pd
import numpy as np
import time
import json
from bson import ObjectId
from flask_cors import CORS, cross_origin

from bson.objectid import ObjectId 
from datetime import datetime 
from flask_bcrypt import Bcrypt 
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_raw_jwt

#custom modules
import config
from ressources.config_db import db

from ressources.model_collab_recommender import predict_ratings
from ressources.picture_list_creation import get_recommended_picture_list
from ressources.email_verification import send_email, verify_email, confirm_token

from image_similarity.get_embeddings import get_embeddings
from image_similarity.train_annoy_model import train_annoy_model

URL = "http://127.0.0.1:3000-"


# init app
app = Flask(__name__)
FILE_PATH = os.path.dirname(os.path.realpath(__file__))
app.config.from_pyfile('config.py')

app.config.update(config.mail_settings)
mail = Mail(app)


# app.config['JWT_SECRET_KEY'] = os.environ['JWT_SECRET_KEY']

app.config['JWT_HEADER_TYPE'] = None
app.config['JWT_BLACKLIST_ENABLED'] = True
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access']

bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

blacklist = set()


@jwt.token_in_blacklist_loader
def check_if_token_in_blacklist(decrypted_token):
    jti = decrypted_token['jti']
    return jti in blacklist



@app.route("/", methods= ["GET"])
def testingBackend():
    print("Backend is on")
    return 'Backend is on'



@app.route("/check_token", methods= ["GET"])
@jwt_required
def check_token():
    current_user = get_jwt_identity()
    
    if current_user["userType"] == request.headers.get('fromUserType') :
        return jsonify({"valid" : 'Token is valid'})
    else :
        return jsonify({"msg" : "Wrong type of user"})



@app.route("/upload_image", methods= ["POST"])
@jwt_required
def upload_image():
    current_user = get_jwt_identity()
    
    if current_user["userType"] != 'company' :
        return jsonify({"msg" : "Wrong type of user"})

    company_name = current_user["company_name"]
    
    UPLOAD_FOLDER = './image_similarity/data/train/'
    ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg']
    image_file = request.files["imageFile"]
    typeCloth = request.form["typeCloth"]
    materialCloth = request.form["materialCloth"]
    productionMethod = request.form["productionMethod"]
    price = request.form["price"]
    sex = request.form["sex"]
    description = request.form["description"]
    extension = os.path.splitext(image_file.filename)[1]
    if not extension in ALLOWED_EXTENSIONS :
        return 'Invalid extension'
    
    if not os.path.isdir(UPLOAD_FOLDER):
        os.mkdir(UPLOAD_FOLDER)
    
    if os.path.isfile('./image_similarity/outfile/nbrFiles.npy'):
        nbrFiles = np.load('./image_similarity/outfile/nbrFiles.npy').astype(int)
        filename = "IMG_" + str(nbrFiles +1) + extension
    else:
        filename = "IMG_1" + extension

    destination = UPLOAD_FOLDER + filename
    image_file.save(destination)
    while not os.path.exists(destination):
        print('waiting')
        time.sleep(1)

    if os.path.isfile(UPLOAD_FOLDER + filename):
        get_embeddings()
        train_annoy_model()
        coll = db["image_info"]
        x = coll.insert_one({
            "name":filename,
            "typeCloth": typeCloth,
            "materialCloth": materialCloth,
            "productionMethod": productionMethod,
            "price": int(price),
            "sex": sex,
            "description": description,
            "company_name" : company_name,
            "company_id": current_user["_id"]
        })

        coll = db.company_info
        result = coll.find_one({"company_name":company_name})
        company_images = result["images_uploaded"]
        company_images.append(filename)
        cursor = coll.update_one({"company_name":company_name},{"$set":{"images_uploaded":company_images}})
    
    return jsonify({"valid" : "Cloth has been uploaded"})



@app.route('/update_info', methods=["POST"])
@jwt_required
def update_info():
    try:
        current_user = get_jwt_identity()
        user_id = ObjectId(current_user["_id"])
        user = db.user_info if current_user["userType"] == 'client' else db.company_info

        new_mail = str(request.get_json()["email"])
        old_mail = current_user["email"]
        mailAlreadyExist = user.find_one({"email":request.get_json()["email"]})
        if mailAlreadyExist :
            return jsonify({'already_exist' : 'Mail already used'})  
        
        res = user.find_one({"_id":user_id})
    
        if res:
            x = user.update_one({"_id":user_id},{"$set":request.get_json()})
            if old_mail != new_mail:
                verify_email(new_mail)
                x = user.update_one({"_id":user_id},{"$set":{"mail_verified":False, "mail_verified_on":""}})
            return jsonify({'valid' : 'User informations updated !'})
        else:
            return jsonify({'msg' : 'User not found'})
    except:  
        print('error')
        return jsonify({'msg' : 'Something went wrong'})



@app.route('/update_image_info', methods=["POST"])
@jwt_required
def update_image_info():
    json_data = request.get_json(force = True)['image_info_card']
    
    try:
        coll = db.image_info
        image_name = json_data['name']
        res = coll.find_one({"name":image_name})
                
        if res:
            x = coll.update_one({"name" : image_name},{"$set":json_data})
            return jsonify({'valid' : 'User informations updated !'})
        else:
            return jsonify({'msg' : 'User not found'})
    except:  
        print('error')
        return jsonify({'msg' : 'Something went wrong'})



@app.route('/update_filters', methods=["POST"])
@jwt_required
def update_filters():
    try:
        current_user = get_jwt_identity()
        user_id = current_user["_id"]
        filters = db.filters
        res = filters.find_one({"user_id": user_id })
        if res:
            x = filters.update_one({ "user_id" : user_id },{ "$set" : request.get_json(force = True) })
            return jsonify({'valid' : 'Filters updated'})
        else:
            json_data = request.get_json(force = True)
            json_data["user_id"] = user_id
            x = filters.insert_one(json_data)
            return jsonify({'valid' : 'Filters created'})
    except:  
        print('error in update filters')
        return jsonify({'msg' : 'Something went wrong'})
    
    

@app.route('/change_pwd', methods=["POST"])
@jwt_required
def change_pwd():
    try:
        current_user = get_jwt_identity()
        user_id = ObjectId(current_user["_id"])
        user = db.user_info if current_user["userType"] == 'client' else db.company_info
        res = user.find_one({"_id":user_id})
        
        if res:
            old_password = request.get_json()['old_password']
            if bcrypt.check_password_hash(res['password'], old_password):
                new_password = bcrypt.generate_password_hash(request.get_json()['new_password']).decode('utf-8')
                x = user.update_one({"_id":user_id},{"$set":{'password': new_password}})
                return jsonify({'valid' : 'User pwd updated !'})
            else:
                return jsonify({'info' : 'Invalid old password'})                
        else:
            return jsonify({'msg' : 'User not found'})
    except:
        return jsonify({'msg' : 'Something went wrong'})



@app.route('/re_verify', methods=["POST"])
def re_verify():
    email = request.get_json(force = True)["email"]
    coll= db.user_info
    result = coll.find_one({"email":email})
    if not result:
        return jsonify({'msg' : 'This email does not exists, try to register again !'})


    verify_email(email)
    return jsonify({'success' : 'verification email sent'})



@app.route('/new_company', methods=["POST"])
def new_company():
    try:
        company = db.company_info
        company_name = request.get_json()['company_name']
        location = request.get_json()["location"]
        email = request.get_json()['email']
        phone = str(request.get_json()['phone'])
        password = bcrypt.generate_password_hash(request.get_json()['password']).decode('utf-8')
        created = datetime.utcnow()

        try:
            res = company.find_one({"email":email})
            if res["email"] == email:
                return "already exists"
        except:
            None

        x = company.insert_one({
            'company_name': company_name,
            "location":location,
            'email': email,
            'password': password,
            'created': created,
            'phone' : phone,
            "images_uploaded":[],
            'mail_verified': True  # IF TRUE EMAIL VERIF IS NOT ACTIVE !!!
        })
                
        result = company.find_one({"email":email})
        company_id = str(result["_id"])

        verify_email(email)

        return redirect(URL + "", code=307)  # !!! TO DO : change toward login screen 
                                                    # and add relevant message
    except:
        return ''



@app.route('/new_user', methods=["POST"])
def new_user():
    # try:
    user = db.user_info
    first_name = request.get_json()['first_name']
    last_name = request.get_json()['last_name']
    email = request.get_json()['email']
    phone = request.get_json()['phone']
    sex = request.get_json()['sex']
    password = bcrypt.generate_password_hash(request.get_json()['password']).decode('utf-8')
    created = datetime.utcnow()

    try:
        res = user.find_one({"email":email})
        if res["email"] == email:
            return "already exists"
    except:
        None

    x = user.insert_one({
        'first_name': first_name,
        'last_name': last_name,
        'email': email,
        'password': password,
        'created': created,
        "sex" : sex,
        'phone' : phone,
        'mail_verified': True  # IF TRUE EMAIL VERIF IS NOT ACTIVE !!!
    })
    
    result = user.find_one({"email":email})
    user_id = str(result["_id"])

    collection = db.list_images
    x = collection.insert_one({
        "user_id":user_id,
        "super_like":[],
        "list_image":[]
        })
  

    verify_email(email)
    
    return redirect(URL + "/notconfirm", code=307)  # !!! TO DO : change toward login screen 
                                                    # and add relevant message
    # except:
    #     return(" ")



@app.route('/confirm/<token>', methods=["GET"])
def confirm_email(token):
    try:
        email = confirm_token(token)
    except:
        flash('The confirmation link is invalid or has expired.', 'danger')
        email = None

    if email == None:
            return redirect(URL + "/notconfirm", code=307)  # !!! TO DO : change toward login screen 
                                                        # and add relevant message

    coll = db.user_info


    try:
        result = coll.find_one({"email":email})
        confirmed = result["mail_verified"]
    except:
        coll = db.company_info
    try:
        result = coll.find_one({"email":email})
        confirmed = result["mail_verified"]
    except: 
        confirmed=None

    if confirmed:
        flash('Account already confirmed. Please login.', 'success')
    else:
        confirmed = True
        confirmed_on = time.ctime()
        cursor = coll.update_one({"email":email},{"$set":{
            "mail_verified":confirmed, "mail_verified_on":confirmed_on
            }})
        flash('You have confirmed your account. Thanks! You can now login.', 'success')
    return redirect(URL + "/confirm", code=307)  # !!! TO DO : change toward login screen 
                                                        # and add relevant message



@app.route('/login', methods=['POST'])
def login():
    userType = request.get_json(force = True)['userType']
    user = db.user_info if userType == 'client' else db.company_info
    email = request.get_json(force = True)['email']
    password = request.get_json(force = True)['password']
    result = ""

    response = user.find_one({'email': email})
    
    if response:
        if response["mail_verified"] == False:
            print(" ! YOU HAVE TO VERIFY YOUR MAIL ! ")
            return redirect(URL + "/notconfirm", code=307)  # !!! TO DO : change toward login screen 
                                                        # and add relevant message


        if bcrypt.check_password_hash(response['password'], password):
            if userType == 'client' :
                access_token = create_access_token(identity = {
                    'first_name': response['first_name'],
                    'last_name': response['last_name'],
                    'email': response['email'],
                    'userType': userType,
                    '_id': str(response['_id'])
                })
            elif userType == 'company' :
                access_token = create_access_token(identity = {
                    'company_name': response['company_name'],
                    'location': response['location'],
                    'email': response['email'],
                    'userType': userType,
                    '_id': str(response['_id'])
                })
            result = jsonify({'token' : access_token})
        else:
            print("Invalid username and password")
    else:
        print("No results found")
    return result


    
@app.route('/getProfileInfo', methods=['POST'])
@jwt_required
def getProfileInfo():
    current_user = get_jwt_identity()
    user_id = ObjectId(current_user["_id"])
    user = db.user_info if current_user["userType"] == 'client' else db.company_info
    
    allInfo = user.find_one({'_id': user_id})
    excluded = ['_id','password','images_uploaded', 'created', "mail_verified", "mail_verified_on" ]
    allInfo = { k : v for k,v in allInfo.items() if k not in excluded }
    
    return jsonify(allInfo)



@app.route('/logout', methods=['DELETE'])
@jwt_required
def logout():
    jti = get_raw_jwt()['jti']
    blacklist.add(jti)
    return jsonify({"msg": "Successfully logged out"})



@app.route('/remove_account', methods=['POST'])
@jwt_required
def remove_account():
    current_user = get_jwt_identity()
    
    if current_user["userType"] != 'client' :
        return jsonify({"msg" : "Wrong type of user"})
    
    user_id = current_user["_id"]
    
    collection = db["user_info"]
    cursor = collection.delete_one({"_id":ObjectId(user_id)})
    
    collection = db["user_ratings"]
    cursor = collection.delete_many({"user_id":user_id})
    print(cursor.deleted_count, " documents deleted.")

    collection = db["pictures_list"]
    cursor = collection.delete_many({"user_id":user_id})

    collection = db["filters"]
    cursor = collection.delete_one({"user_id":user_id})
    
    jti = get_raw_jwt()['jti']
    blacklist.add(jti)

    return jsonify({"valid" : "Account has been removed"})



@app.route("/load_image_for_rating", methods=["POST"])
@jwt_required
def load_image_for_rating():
    
    json_data = request.get_json(force = True)
    current_user = get_jwt_identity()

    collection = db["filters"]
    user_id = current_user["_id"]
    res = collection.find_one({ "user_id" : user_id })
    if res :
        del res['_id']
        del res['user_id']
        filt_dic = res
    else :
        filt_dic = {
            "clothe_sex" : [],
            "clothe_type" : [],
            "clothe_material" : [],
            "clothe_production" : [],
            "clothe_price_range" : [0, 999]
        }
    
    if current_user["userType"] != 'client' :
        return jsonify({"msg" : "Wrong type of user"})

    pictures_list = get_recommended_picture_list(user_id, filt_dic, json_data)
    if not pictures_list:
        return jsonify({"no_more_pictures":"No more pictures to show, try to change your filters", 'filters' : filt_dic})

    coll = db["image_info"]
    list_dict = []
    i=0
    for pic in pictures_list:
        get_info = coll.find_one({"name":pic})
        list_dict.append({
            "name": pictures_list[i],
            "typeCloth": get_info["typeCloth"],
            "materialCloth": get_info["materialCloth"],
            "productionMethod": get_info["productionMethod"],
            "price": get_info["price"],
            "sex": get_info["sex"],
            "description": get_info["description"]
            })
        i+=1

    send_image_info = jsonify({'imgs' : list_dict, 'filters' : filt_dic})
    return send_image_info



@app.route("/one_image_info", methods=["POST"])
def one_image_info():
    image_name = request.get_json(force = True)['image_name']
    coll = db["image_info"]
    get_info = coll.find_one({"name":image_name})
    image_info = {
        "name": image_name,
        "typeCloth": get_info["typeCloth"],
        "materialCloth": get_info["materialCloth"],
        "productionMethod": get_info["productionMethod"],
        "price": get_info["price"],
        "sex": get_info["sex"],
        "description": get_info["description"]
    }

    send_image_info = jsonify({'image_info' : image_info})
    return send_image_info



@app.route("/show_image", methods=["POST"])
def show_image():
    json_data = request.get_json(force = True)
    filename = './imagesOnDb/' + json_data['imageName']
    send_file_image = send_file(filename, mimetype='image/jpg')

    return send_file_image



@app.route("/rate_image", methods=["POST"])
@jwt_required
def rate_image():
    json_data = request.get_json(force = True)
    current_user = get_jwt_identity()
    
    if current_user["userType"] != 'client' :
        return jsonify({"msg" : "Wrong type of user"})
    
    user_id = current_user["_id"]

    name = json_data['imageName']
    rating = json_data["rating"]
    post = {"user_id":user_id, "picture":name,"rating":rating, "timestamp":time.ctime()}
    
    coll = db["user_ratings"]
    results = list(coll.find({"user_id":user_id, "picture":name}))
    try:
        temp_id = results[0]["_id"]
        cursor = coll.update_one({"_id":temp_id},{"$set":post})
        print(" !!! SAME IMAGE RATED TWICE !!! ")
        print(name)
    except:
        x = coll.insert_one(post)

    coll = db["list_images"]
    results = list(coll.find({}))
      
    for res in results:
        if res["user_id"] == user_id:
            if rating == 2:
                try: 
                    super_like = res["super_like"]
                    super_like.append(name)
                except:
                    super_like  = [name]
                
                result = coll.update_one({"_id":res["_id"]},{"$set":{"super_like":super_like}})
            list_pic = res["list_image"]
            push_db = coll.update_one({"_id":res["_id"]},{"$set":{"list_image":list_pic[1:]}})
    
    return jsonify({"valid" : "Cloth has been rated"})



@app.route("/cart", methods=["POST"])
@jwt_required
def cart():
    
    current_user = get_jwt_identity()
    
    if current_user["userType"] != 'client' :
        return jsonify({"msg" : "Wrong type of user"})
    user_id = current_user["_id"]
    
    try:
        collection = db["user_ratings"]
        super_like = list(collection.find({"user_id":user_id, "rating":2}))
        like = list(collection.find({"user_id":user_id, "rating":1}))
        
        for i in range(len(super_like)):
            super_like[i] = super_like[i]["picture"]
        for i in range(len(like)):
            like[i] = like[i]["picture"]

        liked_picture = {"like" : tuple(like), "super_like" : tuple(super_like) }
        return liked_picture
    except:
        return ''



@app.route("/images_uploaded", methods=["POST"])
@jwt_required
def images_uploaded():
    
    current_user = get_jwt_identity()
    if current_user["userType"] != 'company' :
        return jsonify({"msg" : "Wrong type of user"})
    company_id = current_user["_id"]

    try:
        collection = db["company_info"]
        company_list_images = list(collection.find({"_id":ObjectId(company_id)}))[0]['images_uploaded']
        
        return {"company_list_images" : tuple(company_list_images)}
    except:
        return ''
    


@app.errorhandler(404)
def page_not_found(e):
    return '', 404


# run server
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug = True)
#    app.run(host="0.0.0.0", port = os.environ["PORT"])
