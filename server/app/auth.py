# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from bson import ObjectId 
# from datetime import datetime, timezone
# from . import mongo, bcrypt



# def to_iso_now():
#     return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

# def to_id(doc):
#     if not doc:
#         return doc
#     doc = dict(doc)
#     if isinstance(doc.get("_id"), ObjectId):
#         doc["_id"] = str(doc["_id"])
#     return doc

# # bcrypt = Bcrypt()
# auth_bp = Blueprint("auth", __name__)


# @auth_bp.route("/signup", methods=["POST"])
# def signup():
#     db = mongo.db
#     users = db.users
#     data = request.get_json(silent=True) or {}
#     fullName = (data.get('fullName') or '').strip()
#     email = (data.get('email') or '').strip().lower()
#     username = (data.get('username') or '').strip().lower()
#     password = data.get('password') or ''
#     role = (data.get('role') or 'Finance Officer').strip()  # persist selected role

#     if not all([fullName, email, username, password]):
#         return jsonify({"error": "All fields are required."}), 400
#     if db.users.find_one({"$or": [{"email": email}, {"username": username}]}):
#         return jsonify({"error": "Email or username already exists."}), 409

#     user_doc = {
#         "fullName": fullName,
#         "email": email,
#         "username": username,
#         "password": bcrypt.generate_password_hash(password).decode("utf-8"),
#         "role": role,
#         "createdAt": to_iso_now(),
#     }
#     res = db.users.insert_one(user_doc)
#     user_doc["_id"] = res.inserted_id
#     pub = to_id(user_doc); pub.pop("password", None)
#     return jsonify({"message": "Account created", "user": pub}), 201



# # Login
# @auth_bp.route("/login", methods=["POST"])
# def login():
#     db = mongo.db
#     users = db.users
#     data = request.get_json(silent=True) or {}
    
#     email = (data.get("email") or "").strip().lower()
#     password = (data.get("password") or "").strip()
    
#     users = mongo.db.users
#     user = users.find_one({"email": email})


#     # user = users.find_one({"email": data.get("email")})
#     if not user:
#         return jsonify({"error": "User not found"}), 404

#     # if not bcrypt.check_password_hash(user["password"], data.get("password")):
#     #     return jsonify({"error": "Invalid credentials"}), 401
    
    
#     if not bcrypt.check_password_hash(user["password"], password):
#         return jsonify({"error": "Invalid credentials"}), 401

#     # Generate JWT
#     from flask_jwt_extended import create_access_token
#     access_token = create_access_token(identity=str(user["_id"]))
    
#     print("🟢 Login route reached")


#     return jsonify({
#         "message": "Login successful",
#         "token": access_token
#     }), 200



# @auth_bp.route("/profile", methods=["GET"])
# @jwt_required()
# def profile():
#     user_id = get_jwt_identity()
#     # user = mongo.db.users.find_one({"_id": mongo.db.users.ObjectId(user_id)})
    
#     user = mongo.db.users.find_one({"_id": ObjectId(user_id)})

#     if not user:
#         return jsonify({"error": "User not found"}), 404

#     return jsonify({
#         "fullName": user["fullName"],
#         "email": user["email"]
#     })

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from bson import ObjectId
from datetime import datetime, timezone
from . import mongo, bcrypt

auth_bp = Blueprint("auth", __name__)

def to_iso_now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def to_id(doc):
    if not doc:
        return doc
    doc = dict(doc)
    if isinstance(doc.get("_id"), ObjectId):
        doc["_id"] = str(doc["_id"])
    return doc


# ---------- SIGNUP ----------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    db = mongo.db
    data = request.get_json(silent=True) or {}

    fullName = (data.get('fullName') or '').strip()
    email = (data.get('email') or '').strip().lower()
    username = (data.get('username') or '').strip().lower()
    password = data.get('password') or ''
    role = (data.get('role') or 'Finance Officer').strip()

    if not all([fullName, email, username, password]):
        return jsonify({"error": "All fields are required."}), 400

    if db.users.find_one({"$or": [{"email": email}, {"username": username}]}):
        return jsonify({"error": "Email or username already exists."}), 409

    user_doc = {
        "fullName": fullName,
        "email": email,
        "username": username,
        "password": bcrypt.generate_password_hash(password).decode("utf-8"),
        "role": role,
        "createdAt": to_iso_now(),
    }

    res = db.users.insert_one(user_doc)
    user_doc["_id"] = res.inserted_id
    pub = to_id(user_doc); pub.pop("password", None)

    return jsonify({"message": "Account created", "user": pub}), 201


# ---------- LOGIN ----------
@auth_bp.route("/login", methods=["POST"])
def login():
    db = mongo.db
    
    data = request.get_json(silent=True) or {}
    print("raw data:",data)

    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    # print(f"\n🔍 Checking email: {email}")
    # print("📦 DB name:", mongo.db.name)
    # print("📚 Collections:", mongo.db.list_collection_names())

    # 👇 NEW LINE: list all users' emails
    # all_users = list(db.users.find({}, {"email": 1, "_id": 0}))
    # print("🧾 All users in DB:", all_users)

    user = db.users.find_one({"email": email})
    # print("👀 Matched user:", user)

    # if not user:
    #     return jsonify({"error": "User not found"}), 404

    if not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    from flask_jwt_extended import create_access_token
    access_token = create_access_token(identity=str(user["_id"]))
    #print("🟢 Login successful!")

    print("🟢 Login successful!")
    return jsonify({"message": "Login successful", "token": access_token}), 200



# ---------- PROFILE ----------
@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "fullName": user["fullName"],
        "email": user["email"]
    })

