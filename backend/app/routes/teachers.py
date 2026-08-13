from flask import Blueprint, jsonify

from app.models.teacher import (
    get_all_teachers,
    get_teacher_by_id,
    serialize_teacher,
)

teachers_bp = Blueprint('teachers', __name__, url_prefix='/api/teachers')


# -------------------------------------------------------------------
# GET /api/teachers
# -------------------------------------------------------------------
@teachers_bp.route('', methods=['GET'])
def list_teachers():
    teachers = get_all_teachers()
    return jsonify({
        "success": True,
        "data": [serialize_teacher(t) for t in teachers],
    }), 200


# -------------------------------------------------------------------
# GET /api/teachers/<teacher_id>
# -------------------------------------------------------------------
@teachers_bp.route('/<teacher_id>', methods=['GET'])
def single_teacher(teacher_id):
    teacher = get_teacher_by_id(teacher_id)
    if not teacher:
        return jsonify({"success": False, "message": "Teacher not found"}), 404

    return jsonify({
        "success": True,
        "data": serialize_teacher(teacher),
    }), 200
