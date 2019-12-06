import os
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.neighbors import NearestNeighbors
from src_get_embeddings.CV_IO_utils import read_imgs_dir
from src_get_embeddings.CV_transform_utils import apply_transformer, resize_img, normalize_img
import annoy

def get_similar_images():

    train_filenames = list(np.load('outfile/filenames.npy'))
    train_embs = np.load('outfile/embs.npy')
    embeddings_size = train_embs.shape[1]
    
    dataTrainDir = os.path.join(os.getcwd(), "data", "train")
    
    # index_image = 997
    index_image = train_filenames.index(dataTrainDir + "/000004.jpg")

    load_annoy_model = annoy.AnnoyIndex(embeddings_size, metric='angular')
    load_annoy_model.load('models/annoy_model.annoy')

    similar_images = load_annoy_model.get_nns_by_item(index_image, 5)

    for i in similar_images :
        print(train_filenames[i])
