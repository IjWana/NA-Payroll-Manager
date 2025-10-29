from flask import Flask
from flask_cors import CORS
from .auth import auth_bp
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
import os
from dotenv import load_dotenv
# from server.models.database import init_app



mongo = PyMongo()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    load_dotenv()
    app.config['MONGO_URI'] = os.getenv(
        'MONGO_URI',
        'mongodb+srv://group_payroll_sysdb:ICTGroupProject@cluster1.eeqaf7t.mongodb.net/?appName=Cluster1'
    )
    app.config['MONGO_DB'] = os.getenv('MONGO_DB', 'payroll_db')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'ia41sId6LOTehoP0XR8VZ_e96_G4n4-IqZ2FI9XsJRw')
    app.config['CORS_ORIGIN'] = os.getenv('CORS_ORIGIN', 'http://localhost:5173')

    # Initialize MongoDB and JWT
    mongo.init_app(app)
    jwt.init_app(app)

    # Test Mongo Connection (before blueprints)
    try:
        with app.app_context():
            mongo.db.command('ping')
            print("\n✅ MongoDB connected successfully!\n")
    except Exception as e:
        print(f"\n❌ MongoDB connection failed: {e}\n")


    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGIN']}}, supports_credentials=True)

    # Register routes
    app.register_blueprint(auth_bp, url_prefix="/auth")


    @app.route('/')
    def home():
        return "Hello, World!", 200

    return app


# app = create_app()



