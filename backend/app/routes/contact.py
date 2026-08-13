from datetime import datetime, timezone

from flask import Blueprint, request, jsonify

from app import mongo
from app.utils.validators import validate_required_fields, validate_email

contact_bp = Blueprint('contact', __name__, url_prefix='/api/contact')


# -------------------------------------------------------------------
# POST /api/contact
# -------------------------------------------------------------------
@contact_bp.route('', methods=['POST'])
def submit_contact():
    data = request.get_json(silent=True) or {}

    missing = validate_required_fields(data, ['name', 'email', 'message'])
    if missing:
        return jsonify({"success": False, "message": f"Missing required fields: {', '.join(missing)}"}), 400

    if not validate_email(data['email']):
        return jsonify({"success": False, "message": "Invalid email format"}), 400

    contact = {
        'name': data['name'].strip(),
        'email': data['email'].lower().strip(),
        'message': data['message'].strip(),
        'submitted_at': datetime.now(timezone.utc),
    }
    mongo.db.contacts.insert_one(contact)

    return jsonify({
        "success": True,
        "message": "Your message has been sent successfully",
    }), 201
