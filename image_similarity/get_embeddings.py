import os
import shutil
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.neighbors import NearestNeighbors
from src_get_embeddings.CV_IO_utils import read_imgs_dir
from src_get_embeddings.CV_transform_utils import apply_transformer, resize_img, normalize_img
import annoy

# Apply transformations to all images
class ImageTransformer(object):

    def __init__(self, shape_resize):
        self.shape_resize = shape_resize

    def __call__(self, img):
        img_transformed = resize_img(img, self.shape_resize)
        img_transformed = normalize_img(img_transformed)
        return img_transformed

def get_embeddings():
    
    modelName = "vgg19"  # try: "simpleAE", "convAE", "vgg19"
    parallel = True  # use multicore processing

    # Make paths
    dataTrainDir = os.path.join(os.getcwd(), "data", "train")
    dataAlreadyTrainDir = os.path.join(os.getcwd(), "data", "already_trained")
    
    # Read images
    extensions = [".jpg", ".jpeg", ".png"]
    print("Reading train images from '{}'...".format(dataTrainDir))
    imgs_and_filenames_train = read_imgs_dir(dataTrainDir, extensions, parallel=parallel)
    imgs_train = imgs_and_filenames_train[0]
    filenames_train = np.array(imgs_and_filenames_train[1])
    if filenames_train.size == 0 or len(imgs_train) == 0:
        print("Train file is empty")
        return None
    # shape_img = imgs_train[0].shape
    shape_img = (244, 244, 3)
    print("Image shape = {}".format(shape_img))

    # Load pre-trained VGG19 model + higher level layers
    print("Loading vgg19 pre-trained model...")
    model = tf.keras.applications.VGG19(weights='imagenet', include_top=False, input_shape=shape_img)
    model.summary()

    shape_img_resize = tuple([int(x) for x in model.input.shape[1:]])
    input_shape_model = tuple([int(x) for x in model.input.shape[1:]])
    output_shape_model = tuple([int(x) for x in model.output.shape[1:]])
    n_epochs = None

    # Print some model info
    print("input_shape_model = {}".format(input_shape_model))
    print("output_shape_model = {}".format(output_shape_model))

    transformer = ImageTransformer(shape_img_resize)
    print("Applying image transformer to training images...")
    imgs_train_transformed = apply_transformer(imgs_train, transformer, parallel=parallel)

    # Convert images to numpy array
    X_train = np.array(imgs_train_transformed).reshape((-1,) + input_shape_model)
    print(" -> X_train.shape = {}".format(X_train.shape))

    # Create embeddings using model
    print("Inferencing embeddings using pre-trained model...")
    E_train = model.predict(X_train)
    E_train_flatten = E_train.reshape((-1, np.prod(output_shape_model)))
    print(" -> E_train.shape = {}".format(E_train.shape))
    print(" -> E_train_flatten.shape = {}".format(E_train_flatten.shape))
    
    if os.path.isfile('outfile/filenames.npy') and os.path.isfile('outfile/embs.npy'):
        print("Outfiles already exist")
        
        train_filenames = np.load('outfile/filenames.npy')
        train_embs = np.load('outfile/embs.npy')
        
        train_filenames_append = np.append(train_filenames, filenames_train, axis=0)
        train_embs_append = np.append(train_embs, E_train_flatten, axis=0)
        
        np.save('outfile/embs.npy', train_embs_append)
        np.save('outfile/filenames.npy', train_filenames_append)
    else:
        print("Creating outfiles...")
        
        np.save('outfile/embs.npy', E_train_flatten)
        np.save('outfile/filenames.npy', filenames_train)

    files = os.listdir(dataTrainDir)
    for f in files:
        if f == dataTrainDir + "/" + ".DS_Store" :
            os.remove(dataTrainDir + "/" + ".DS_Store")
        else :    
            shutil.move(dataTrainDir + "/" + f, dataAlreadyTrainDir)
