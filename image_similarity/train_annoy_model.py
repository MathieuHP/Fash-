import os
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.neighbors import NearestNeighbors
from .src_get_embeddings.CV_IO_utils import read_imgs_dir
from .src_get_embeddings.CV_transform_utils import apply_transformer, resize_img, normalize_img
import annoy

def train_annoy_model():
    
    mainDir = os.getcwd()
    mainDir = os.getcwd() + "/image_similarity"
    
    train_embs = np.load(mainDir +'/outfile/embs.npy')
    embeddings_size = train_embs.shape[1]

    saving_annoy_model = annoy.AnnoyIndex(embeddings_size, metric='angular')
    for i in range(train_embs.shape[0]):
        v = [z for z in train_embs[i]]
        saving_annoy_model.add_item(i, v)
    saving_annoy_model.build(10)
    if not os.path.isdir(mainDir + '/models'):
        os.mkdir(mainDir + '/models')
    saving_annoy_model.save(mainDir +'/models/annoy_model.annoy')
