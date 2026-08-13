from flask import Blueprint, jsonify

from app.models.course import (
    get_all_courses,
    get_course_by_id,
    get_popular_courses,
    serialize_course,
)
from app.models.teacher import get_teacher_by_id, serialize_teacher

courses_bp = Blueprint('courses', __name__, url_prefix='/api/courses')


# -------------------------------------------------------------------
# GET /api/courses
# -------------------------------------------------------------------
@courses_bp.route('', methods=['GET'])
def list_courses():
    courses = get_all_courses()
    return jsonify({
        "success": True,
        "data": [serialize_course(c) for c in courses],
    }), 200


# -------------------------------------------------------------------
# GET /api/courses/popular
# -------------------------------------------------------------------
@courses_bp.route('/popular', methods=['GET'])
def popular_courses():
    courses = get_popular_courses()
    return jsonify({
        "success": True,
        "data": [serialize_course(c) for c in courses],
    }), 200


# -------------------------------------------------------------------
# GET /api/courses/<course_id>
# -------------------------------------------------------------------
@courses_bp.route('/<course_id>', methods=['GET'])
def single_course(course_id):
    course = get_course_by_id(course_id)
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404

    course_data = serialize_course(course)

    # Attach teacher info if available
    if course.get('teacher_id'):
        teacher = get_teacher_by_id(str(course['teacher_id']))
        course_data['teacher'] = serialize_teacher(teacher)

    return jsonify({
        "success": True,
        "data": course_data,
    }), 200
