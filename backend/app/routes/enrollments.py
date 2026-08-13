from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.enrollment import create_enrollment, get_user_enrollments, serialize_enrollment
from app.models.course import get_course_by_id, serialize_course
from app.utils.validators import validate_required_fields, validate_email

enrollments_bp = Blueprint('enrollments', __name__, url_prefix='/api/enrollments')


# -------------------------------------------------------------------
# POST /api/enrollments
# -------------------------------------------------------------------
@enrollments_bp.route('', methods=['POST'])
def enroll():
    data = request.get_json(silent=True) or {}

    missing = validate_required_fields(data, ['course_id', 'full_name', 'email'])
    if missing:
        return jsonify({"success": False, "message": f"Missing required fields: {', '.join(missing)}"}), 400

    if not validate_email(data['email']):
        return jsonify({"success": False, "message": "Invalid email format"}), 400

    # Verify the course exists
    course = get_course_by_id(data['course_id'])
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404

    enrollment_id = create_enrollment({
        'user_id': data.get('user_id', ''),
        'course_id': data['course_id'],
        'full_name': data['full_name'].strip(),
        'email': data['email'],
        'phone': data.get('phone', ''),
    })

    return jsonify({
        "success": True,
        "data": {"enrollment_id": enrollment_id},
        "message": "Enrollment successful",
    }), 201


# -------------------------------------------------------------------
# GET /api/enrollments/my  (protected)
# -------------------------------------------------------------------
@enrollments_bp.route('/my', methods=['GET'])
@jwt_required()
def my_enrollments():
    user_id = get_jwt_identity()
    enrollments = get_user_enrollments(user_id)

    result = []
    for enrollment in enrollments:
        item = serialize_enrollment(enrollment)
        # Attach course info
        course = get_course_by_id(enrollment.get('course_id', ''))
        item['course'] = serialize_course(course)
        result.append(item)

    return jsonify({
        "success": True,
        "data": result,
    }), 200
