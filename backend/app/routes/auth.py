from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.models.user import (
    create_user,
    find_user_by_email,
    find_user_by_id,
    verify_password,
    serialize_user,
)
from app.utils.validators import validate_email, validate_required_fields, validate_password

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


# -------------------------------------------------------------------
# POST /api/auth/register
# -------------------------------------------------------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}

    # Validate required fields
    missing = validate_required_fields(data, ['full_name', 'email', 'password'])
    if missing:
        return jsonify({"success": False, "message": f"Missing required fields: {', '.join(missing)}"}), 400

    # Validate email format
    if not validate_email(data['email']):
        return jsonify({"success": False, "message": "Invalid email format"}), 400

    # Validate password strength
    if not validate_password(data['password']):
        return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

    # Check if email already exists
    if find_user_by_email(data['email']):
        return jsonify({"success": False, "message": "Email already registered"}), 409

    # Create user
    user_id = create_user(
        full_name=data['full_name'].strip(),
        email=data['email'],
        password=data['password'],
        role='student', # Force role to student for security
    )

    # Generate JWT
    access_token = create_access_token(identity=user_id)

    return jsonify({
        "success": True,
        "data": {
            "token": access_token,
            "user": {
                "id": user_id,
                "full_name": data['full_name'].strip(),
                "email": data['email'].lower().strip(),
                "role": data.get('role', 'student'),
            }
        }
    }), 201


# -------------------------------------------------------------------
# POST /api/auth/login
# -------------------------------------------------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}

    missing = validate_required_fields(data, ['email', 'password'])
    if missing:
        return jsonify({"success": False, "message": f"Missing required fields: {', '.join(missing)}"}), 400

    user = find_user_by_email(data['email'])
    if not user or not verify_password(user['password'], data['password']):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user['_id']))

    return jsonify({
        "success": True,
        "data": {
            "token": access_token,
            "user": serialize_user(user),
        }
    }), 200


# -------------------------------------------------------------------
# GET /api/auth/me  (protected)
# -------------------------------------------------------------------
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = find_user_by_id(user_id)

    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    return jsonify({
        "success": True,
        "data": serialize_user(user),
    }), 200
