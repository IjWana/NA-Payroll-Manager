from flask import Flask
from flask_pymongo import PyMongo

mongo = PyMongo()

def init_app(app):
    mongo.init_app(app)

def create_app():
    app = Flask(__name__)
    
    app.config['MONGO_URI'] = 'mongodb+srv://group_payroll_sysdb:ICTGroupProject@cluster1.eeqaf7t.mongodb.net/?appName=Cluster1'
    
    


    return app
