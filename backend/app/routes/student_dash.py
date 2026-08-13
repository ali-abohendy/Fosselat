from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timezone
from app import mongo

student_bp = Blueprint('student_dash', __name__, url_prefix='/api/student')
meetings_bp = Blueprint('meetings', __name__, url_prefix='/api/meetings')
reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')
sessions_bp = Blueprint('sessions_api', __name__, url_prefix='/api/sessions')


# Student Dashboard
@student_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({"success": False, "message": "Not found"}), 404

    # Get scheduled sessions for this student
    scheduled = list(mongo.db.scheduled_sessions.find({'student_id': user_id, 'active': True}))
    for s in scheduled:
        s['_id'] = str(s['_id'])
        # Attach student phone
        s['student_phone'] = user.get('phone', '')
        if s.get('teacher_id'):
            teacher = mongo.db.users.find_one({'_id': ObjectId(s['teacher_id'])})
            if teacher:
                s['zoom_link'] = teacher.get('zoom_link', '')
                s['google_meet_link'] = teacher.get('google_meet_link', '')

    # Get recent sessions
    sessions = list(mongo.db.sessions.find({'student_id': user_id}).sort('date', -1).limit(20))
    reviewed_ids = set(str(r['session_id']) for r in mongo.db.reviews.find({'student_id': user_id}, {'session_id': 1}))

    recent = []
    for s in sessions:
        s['_id'] = str(s['_id'])
        s['reviewed'] = s['_id'] in reviewed_ids
        recent.append(s)

    return jsonify({"success": True, "data": {
        "scheduled": scheduled,
        "recent_sessions": recent,
    }})


@student_bp.route('/slots', methods=['GET'])
@jwt_required()
def get_slots():
    user_id = get_jwt_identity()
    slots = list(mongo.db.student_slots.find({'student_id': user_id}))
    for s in slots:
        s['_id'] = str(s['_id'])
    return jsonify({"success": True, "data": slots})


@student_bp.route('/slots', methods=['PUT'])
@jwt_required()
def update_slots():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    new_slots = data.get('slots', [])
    
    # Remove existing
    mongo.db.student_slots.delete_many({'student_id': user_id})
    
    # Insert new
    if new_slots:
        docs = []
        for s in new_slots:
            docs.append({
                'student_id': user_id,
                'day': s.get('day'),
                'start_time': s.get('start_time'),
                'end_time': s.get('end_time'),
                'created_at': datetime.now(timezone.utc)
            })
        mongo.db.student_slots.insert_many(docs)
        
    return jsonify({"success": True, "message": "Slots saved successfully"})



# Meetings
@meetings_bp.route('/create', methods=['POST'])
@jwt_required()
def create_meeting():
    data = request.get_json(silent=True) or {}
    room_id = f"fosselat-{ObjectId()}"
    meeting = {
        'room_id': room_id,
        'teacher_id': data.get('teacher_id', ''),
        'student_id': data.get('student_id', ''),
        'start_time': datetime.now(timezone.utc),
        'end_time': None,
        'active': True,
    }
    mongo.db.meetings.insert_one(meeting)
    return jsonify({"success": True, "data": {"room_id": room_id}})


@meetings_bp.route('/end', methods=['POST'])
@jwt_required()
def end_meeting():
    data = request.get_json(silent=True) or {}
    room_id = data.get('room_id', '')
    mongo.db.meetings.update_one(
        {'room_id': room_id},
        {'$set': {'end_time': datetime.now(timezone.utc), 'active': False}}
    )
    return jsonify({"success": True, "message": "Meeting ended"})


# Reviews
@reviews_bp.route('', methods=['POST'])
@jwt_required()
def create_review():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    review = {
        'session_id': data.get('session_id', data.get('room_id', '')),
        'student_id': user_id,
        'rating': int(data.get('rating', 0)),
        'comment': data.get('comment', ''),
        'created_at': datetime.now(timezone.utc),
    }
    mongo.db.reviews.insert_one(review)
    return jsonify({"success": True, "message": "Review submitted"})


# Session by ID
@sessions_bp.route('/<session_id>', methods=['GET'])
@jwt_required()
def get_session(session_id):
    try:
        session = mongo.db.sessions.find_one({'_id': ObjectId(session_id)})
    except Exception:
        return jsonify({"success": False, "message": "Invalid ID"}), 400
    if not session:
        return jsonify({"success": False, "message": "Not found"}), 404
    session['_id'] = str(session['_id'])
    return jsonify({"success": True, "data": session})
