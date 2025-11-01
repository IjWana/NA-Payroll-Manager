from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from .. import mongo
from ..models.personnel import PersonnelModel

personnel_bp = Blueprint("personnel", __name__, url_prefix="/api/personnel")
personnel_model = PersonnelModel(mongo.db)

# -------------------------------------------------------------
# 1️⃣ List all personnel
# -------------------------------------------------------------
@personnel_bp.route("/", methods=["GET"])
@jwt_required()
def list_personnel():
    people = personnel_model.list_all()
    return jsonify({"personnel": people}), 200


# -------------------------------------------------------------
# 2️⃣ Get one personnel by ID
# -------------------------------------------------------------
@personnel_bp.route("/<pid>", methods=["GET"])
@jwt_required()
def get_personnel(pid):
    doc = personnel_model.get_by_id(pid)
    if not doc:
        return jsonify({"error": "Personnel not found"}), 404
    return jsonify(doc), 200


# -------------------------------------------------------------
# 3️⃣ Add new personnel
# -------------------------------------------------------------
@personnel_bp.route("/", methods=["POST"])
@jwt_required()
def add_personnel():
    data = request.get_json() or {}
    if not data.get("Name") or not data.get("Staff_ID"):
        return jsonify({"error": "Missing required fields: Name or Staff_ID"}), 400

    new_doc = personnel_model.create(data)
    return jsonify({"message": "Personnel added successfully", "personnel": new_doc}), 201


# -------------------------------------------------------------
# 4️⃣ Update personnel
# -------------------------------------------------------------
@personnel_bp.route("/<pid>", methods=["PUT", "PATCH"])
@jwt_required()
def update_personnel(pid):
    data = request.get_json() or {}
    updated = personnel_model.update(pid, data)
    if not updated:
        return jsonify({"error": "Personnel not found or invalid ID"}), 404
    return jsonify({"message": "Personnel updated successfully", "personnel": updated}), 200


# -------------------------------------------------------------
# 5️⃣ Delete personnel
# -------------------------------------------------------------
@personnel_bp.route("/<pid>", methods=["DELETE"])
@jwt_required()
def delete_personnel(pid):
    success = personnel_model.delete(pid)
    if not success:
        return jsonify({"error": "Personnel not found or invalid ID"}), 404
    return jsonify({"message": "Personnel deleted successfully"}), 200
