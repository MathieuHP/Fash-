import pandas as pd
import numpy as np
import os
from surprise import Reader, Dataset, Trainset, SVD, BaselineOnly
from surprise.model_selection import cross_validate
from threading import Timer
from time import sleep

#customs imports
# from ressources.config import db, db_connect
from ressources.model_collab_recommender import predict_ratings, check_minimum_data


class RepeatedTimer(object):
    def __init__(self, interval, function, *args, **kwargs):
        self._timer     = None
        self.interval   = interval
        self.function   = function
        self.args       = args
        self.kwargs     = kwargs
        self.is_running = False
        self.start()

    def _run(self):
        self.is_running = False
        self.start()
        self.function(*self.args, **self.kwargs)

    def start(self):
        if not self.is_running:
            self._timer = Timer(self.interval, self._run)
            self._timer.start()
            self.is_running = True

    def stop(self):
        self._timer.cancel()
        self.is_running = False



def train_collab():

	if check_minimum_data():
		predict_ratings()
	else:
		print("not enough data")


def run_thread():
	""" multithreading to predict ratings with collaborative recommender filtering """
	print ("starting...")
	rt = RepeatedTimer(86400, train_collab) # 86400 sec = 24h
	try:
	    sleep(31536000) # 31536000 sec = 1 year
	finally:
	    rt.stop() 
	    print("thread ended")

