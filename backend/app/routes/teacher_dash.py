from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timezone
from app import mongo

teacher_bp2 = Blueprint('teacher_dash', __name__, url_prefix='/api/teacher')


def require_teacher():
    user_id = get_jwt_identity()
    user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    if not user or user.get('role') not in ('teacher', 'admin'):
        return None
    return user


# Dashboard
@teacher_bp2.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user = require_teacher()
    if not user:
        return jsonify({"success": False, "message": "Teacher only"}), 403
    period = request.args.get('period', 'month')
    user_id = str(user['_id'])

    # Calculate stats from sessions
    sessions = list(mongo.db.sessions.find({'teacher_id': user_id}))
    total_minutes = 0
    lessons = len(sessions)
    for s in sessions:
        dm = s.get('duration_minutes', 0)
        total_minutes += dm

    hours = total_minutes // 60
    minutes = total_minutes % 60
    rate = float(user.get('hourly_rate', 0))

    return jsonify({"success": True, "data": {
        "lessons": lessons, "time_hours": hours, "time_minutes": minutes, "rate_hour": rate,
    }})


# Get teacher's students
@teacher_bp2.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    user = require_teacher()
    if not user:
        return jsonify({"success": False, "message": "Teacher only"}), 403
    teacher_name = user.get('full_name', '')
    students = list(mongo.db.users.find(
        {'role': 'student', '$or': [{'teacher_name': teacher_name}, {'teacher_id': str(user['_id'])}]},
        {'password': 0}
    ))
    # Also include any students if none found (for testing)
    if not students:
        students = list(mongo.db.users.find({'role': 'student'}, {'password': 0}))
    for s in students:
        s['_id'] = str(s['_id'])
    return jsonify({"success": True, "data": students})


# Record session — also store student_family_id
@teacher_bp2.route('/sessions', methods=['POST'])
@jwt_required()
def record_session():
    user = require_teacher()
    if not user:
        return jsonify({"success": False, "message": "Teacher only"}), 403
    data = request.get_json(silent=True) or {}
    student = mongo.db.users.find_one({'_id': ObjectId(data['student_id'])}) if data.get('student_id') else None

    # Parse duration to minutes
    dur_str = data.get('duration', '60 min')
    dur_minutes = int(''.join(filter(str.isdigit, dur_str)) or 60)

    target_date = data.get('date', datetime.now(timezone.utc).isoformat())
    if target_date and data.get('student_id'):
        # Check if already recorded
        existing = mongo.db.sessions.find_one({
            'teacher_id': str(user['_id']),
            'student_id': data['student_id'],
            'date': target_date
        })
        if existing:
            return jsonify({"success": False, "message": "A session for this student on this date is already recorded. Please edit the existing session instead."}), 400


    session = {
        'teacher_id': str(user['_id']),
        'teacher_name': user.get('full_name', ''),
        'student_id': data.get('student_id', ''),
        'student_name': student.get('full_name', '') if student else '',
        'student_family_name': student.get('family_name', '') if student else '',
        'student_family_id': student.get('student_id', '') if student else '',
        'subject': student.get('subject', '') if student else data.get('subject', ''),
        'duration': dur_str,
        'duration_minutes': dur_minutes,
        'status': data.get('status', 'present'),
        'date': data.get('date', datetime.now(timezone.utc).isoformat()),
        'notes': data.get('notes', ''),
        'start_time': data.get('start_time', ''),
        'end_time': data.get('end_time', ''),
        'meeting_room_id': '',
        'last_updated': datetime.now(timezone.utc),
        'created_at': datetime.now(timezone.utc),
    }
    result = mongo.db.sessions.insert_one(session)
    session['_id'] = str(result.inserted_id)
    return jsonify({"success": True, "data": session})

@teacher_bp2.route('/sessions/<session_id>', methods=['PUT'])
@jwt_required()
def update_session(session_id):
    user = require_teacher()
    if not user:
        return jsonify({"success": False, "message": "Teacher only"}), 403
    data = request.get_json(silent=True) or {}
    
    # Parse duration
    dur_str = data.get('duration', '60 min')
    dur_minutes = int(''.join(filter(str.isdigit, dur_str)) or 60)
    
    update_data = {
        'student_id': data.get('student_id', ''),
        'subject': data.get('subject', ''),
        'duration': dur_str,
        'duration_minutes': dur_minutes,
        'status': data.get('status', 'present'),
        'date': data.get('date', ''),
        'start_time': data.get('start_time', ''),
        'end_time': data.get('end_time', ''),
        'notes': data.get('notes', ''),
        'last_updated': datetime.now(timezone.utc)
    }
    
    if update_data['student_id']:
        student = mongo.db.users.find_one({'_id': ObjectId(update_data['student_id'])})
        if student:
            update_data['student_name'] = student.get('full_name', '')
            update_data['student_family_name'] = student.get('family_name', '')
            update_data['student_family_id'] = student.get('student_id', '')
    
    mongo.db.sessions.update_one(
        {'_id': ObjectId(session_id), 'teacher_id': str(user['_id'])},
        {'$set': update_data}
    )
    return jsonify({"success": True, "message": "Session updated"})

@teacher_bp2.route('/sessions/<session_id>', methods=['DELETE'])
@jwt_required()
def delete_session(session_id):
    user = require_teacher()
    if not user:
        return jsonify({"success": False, "message": "Teacher only"}), 403
    mongo.db.sessions.delete_one({'_id': ObjectId(session_id), 'teacher_id': str(user['_id'])})
    return jsonify({"success": True, "message": "Session deleted"})


# Reports
@teacher_bp2.route('/reports', methods=['POST'])
@jwt_required()
def create_report():
    user = require_teacher()
    if not user:
        return jsonify({"success": False, "message": "Teacher only"}), 403
    data = request.get_json(silent=True) or {}
    report = {
        'session_id': data.get('session_id', ''),
        'teacher_id': str(user['_id']),
        'teacher_name': user.get('full_name', ''),
        'notes': data.get('notes', ''),
        'created_at': datetime.now(timezone.utc),
    }
    mongo.db.reports.insert_one(report)
    return jsonify({"success": True, "message": "Report saved"})


# Time Slots
@teacher_bp2.route('/slots', methods=['GET'])
@jwt_required()
def get_slots():
    user = require_teacher()
    if not user:
        return jsonify({"success": False, "message": "Teacher only"}), 403
    slots = list(mongo.db.time_slots.find({'teacher_id': str(user['_id'])}))
    for s in slots:
        s['_id'] = str(s['_id'])
    return jsonify({"success": True, "data": slots})


@teacher_bp2.route('/slots', methods=['PUT'])
@jwt_required()
def update_slots():
    user = require_teacher()
    if not user:
        return jsonify({"success": False, "message": "Teacher only"}), 403
    data = request.get_json(silent=True) or {}
    teacher_id = str(user['_id'])
    mongo.db.time_slots.delete_many({'teacher_id': teacher_id})
    slots = data.get('slots', [])
    for s in slots:
        s['teacher_id'] = teacher_id
    if slots:
        mongo.db.time_slots.insert_many(slots)
    return jsonify({"success": True, "message": "Slots updated"})


# Calendar — returns scheduled sessions assigned by admin
@teacher_bp2.route('/calendar', methods=['GET'])
@jwt_required()
def calendar():
    user = require_teacher()
    if not user:
        return jsonify({"success": False, "message": "Teacher only"}), 403
    teacher_id = str(user['_id'])
    scheduled = list(mongo.db.scheduled_sessions.find({'teacher_id': teacher_id, 'active': True}))
    for s in scheduled:
        s['_id'] = str(s['_id'])
        s['zoom_link'] = user.get('zoom_link', '')
        s['google_meet_link'] = user.get('google_meet_link', '')
    return jsonify({"success": True, "data": scheduled})

@teacher_bp2.route('/session/<session_id>/end', methods=['POST'])
@jwt_required()
def end_session(session_id):
    user = require_teacher()
    if not user:
        return jsonify({"success": False, "message": "Teacher only"}), 403
    mongo.db.sessions.update_one(
        {'_id': ObjectId(session_id), 'teacher_id': str(user['_id'])},
        {'$set': {'end_time': datetime.now(timezone.utc).isoformat(), 'status': 'completed'}}
    )
    return jsonify({"success": True, "message": "Session ended"})
    return jsonify({"success": True, "data": scheduled})

