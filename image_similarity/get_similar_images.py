import os
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.neighbors import NearestNeighbors
from image_similarity.src_get_embeddings.CV_IO_utils import read_imgs_dir
from image_similarity.src_get_embeddings.CV_transform_utils import apply_transformer, resize_img, normalize_img
import annoy

def get_similar_images(picture_name ="IMG_1.jpg"):

    train_filenames = list(np.load('image_similarity/outfile/filenames.npy'))
    train_embs = np.load('image_similarity/outfile/embs.npy')
    embeddings_size = train_embs.shape[1]

    index_image = train_filenames.index(picture_name)

    load_annoy_model = annoy.AnnoyIndex(embeddings_size, metric='angular')
    load_annoy_model.load('image_similarity/models/annoy_model.annoy')

    similar_images = load_annoy_model.get_nns_by_item(index_image, 15)
    list_annoy = [train_filenames[i] for i in similar_images]
    del list_annoy[0]
    return list_annoy



