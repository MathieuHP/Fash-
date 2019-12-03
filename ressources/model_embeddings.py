from tensorflow.keras.models import load_model
from tensorflow.keras.applications.resnet50 import preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
import numpy as np
import pandas as pd 
import os


MODEL_EMBEDDING_PATH = os.path.dirname(os.path.realpath(__file__))+"/Models/model_embedding.h5"

def preprocess_input_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
    return x


def image_to_embedding(img_path):

	#if not emb_model:     # move to somewhere else so model is only loaded once for multiple images
	emb_model =load_model(MODEL_EMBEDDING_PATH)

	test_image = preprocess_input_image(img_path)
	embedding = emb_model.predict(test_image)
	return embedding
	