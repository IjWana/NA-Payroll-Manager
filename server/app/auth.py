from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models.database import mongo

auth_bp = Blueprint("auth", __name__)

# Signup
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if mongo.db.users.find_one({"username": username}):
        return jsonify({"error": "User already exists"}), 409

    hashed_pw = generate_password_hash(password)
    mongo.db.users.insert_one({
        "username": username,
        "password": hashed_pw
    })

    return jsonify({"message": "User registered successfully"}), 201


# Login
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = mongo.db.users.find_one({"username": username})

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

