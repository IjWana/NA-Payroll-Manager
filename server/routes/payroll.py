from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from . import mongo
from ..models.payroll import PayrollModel

payroll_bp = Blueprint("payroll", __name__, url_prefix="/api/payroll")
payroll_model = PayrollModel(mongo.db)

# -------------------------------------------------------------
# 1️⃣ Payroll Preview
# -------------------------------------------------------------
@payroll_bp.route("/preview", methods=["GET"])
@jwt_required()
def preview_payroll():
    period = request.args.get("period")
    if not period:
        return jsonify({"error": "Missing period parameter"}), 400

    personnel = list(mongo.db.personnel.find({"active": True}))
    if not personnel:
        return jsonify({"entries": [], "totals": {}}), 200

    entries, totals = payroll_model.compute_preview(personnel)

    return jsonify({"entries": entries, "totals": totals}), 200


# -------------------------------------------------------------
# 2️⃣ Approve Payroll
# -------------------------------------------------------------
@payroll_bp.route("/approve", methods=["POST"])
@jwt_required()
def approve_payroll():
    data = request.get_json() or {}
    period = data.get("period")
    overwrite = data.get("overwrite", False)

    if not period:
        return jsonify({"error": "Missing period"}), 400

    existing = payroll_model.get_by_period(period)
    if existing and not overwrite:
        return jsonify({"error": "Payroll already exists"}), 409

    personnel = list(mongo.db.personnel.find({"active": True}))
    if not personnel:
        return jsonify({"error": "No active personnel found"}), 400

    entries, totals = payroll_model.compute_preview(personnel)
    user = get_jwt_identity()

    if existing and overwrite:
        payroll_model.collection.delete_one({"_id": existing["_id"]})

    payroll_model.create_run(period, entries, totals, approved_by=user)

    return jsonify({"message": f"Payroll for {period} approved successfully."}), 200


# -------------------------------------------------------------
# 3️⃣ Payroll History
# -------------------------------------------------------------
@payroll_bp.route("/history", methods=["GET"])
@jwt_required()
def list_payroll_history():
    runs = payroll_model.list_history(limit=50)
    return jsonify({"runs": runs}), 200
