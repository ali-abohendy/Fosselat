from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash
import re
from app import mongo
from app.models.user import find_user_by_id

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


def require_admin():
    user_id = get_jwt_identity()
    user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    if not user or user.get('role') != 'admin':
        return None
    return user


def generate_family_id(family_name):
    """Generate a family-based ID like HEN001. Same family = same ID."""
    prefix = re.sub(r'[^A-Z]', '', family_name.upper()[:3]).ljust(3, 'X')
    existing = mongo.db.users.find_one(
        {'family_name': {'$regex': f'^{re.escape(family_name)}$', '$options': 'i'}, 'student_id': {'$exists': True}},
        {'student_id': 1}
    )
    if existing and existing.get('student_id'):
        return existing['student_id']
    # Find next sequence for this prefix
    count = mongo.db.users.count_documents({
        'student_id': {'$regex': f'^{prefix}', '$exists': True}
    })
    seq = count + 1
    return f"{prefix}{seq:03d}"


def generate_credentials(full_name, family_name, role='student', student_id=None):
    """Auto-generate email and password for a new user."""
    first = re.sub(r'[^a-z]', '', full_name.lower().split()[0] if full_name else 'user')
    family = re.sub(r'[^a-z]', '', family_name.lower() if family_name else 'user')
    base_email = f"{first}.{family}@fosselat.com"
    # Ensure uniqueness
    email = base_email
    counter = 1
    while mongo.db.users.find_one({'email': email}):
        email = f"{first}.{family}{counter}@fosselat.com"
        counter += 1
    if student_id:
        password = f"Fosselat_{student_id}"
    else:
        password = f"Fosselat_{first.capitalize()}{family.capitalize()}"
    return email, password


# Dashboard stats
@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    
    period = request.args.get('period', 'all_time')
    now = datetime.now(timezone.utc)
    
    # Simple period matching for 'date' (which is usually YYYY-MM-DD or similar)
    # Or just use created_at where available.
    
    # We will build match conditions for different collections
    match_session = {}
    match_sp = {}
    match_tp = {}
    
    if period == 'this_month':
        prefix = now.strftime('%Y-%m')
        month_str = now.strftime('%B %Y') # e.g. July 2026
        match_session = {'date': {'$regex': f'^{prefix}'}}
        match_sp = {'month': month_str}
        match_tp = {'month': month_str}
    elif period == 'last_month':
        last = now.replace(day=1)
        import datetime as dt
        last = last - dt.timedelta(days=1)
        prefix = last.strftime('%Y-%m')
        month_str = last.strftime('%B %Y')
        match_session = {'date': {'$regex': f'^{prefix}'}}
        match_sp = {'month': month_str}
        match_tp = {'month': month_str}
    elif period == 'this_year':
        prefix = now.strftime('%Y')
        match_session = {'date': {'$regex': f'^{prefix}'}}
        match_sp = {'month': {'$regex': f'{prefix}$'}}
        match_tp = {'month': {'$regex': f'{prefix}$'}}

    active_students = mongo.db.users.count_documents({'role': 'student', 'status': 'active'})
    active_teachers = mongo.db.users.count_documents({'role': 'teacher', 'status': 'active'})
    inactive_teachers = mongo.db.users.count_documents({'role': 'teacher', 'status': 'inactive'})
    
    total_sessions = mongo.db.sessions.count_documents(match_session)
    present_times = mongo.db.sessions.count_documents({**match_session, 'status': 'present'})
    absent_times = mongo.db.sessions.count_documents({**match_session, 'status': 'absent'})
    
    pipeline = []
    if match_session:
        pipeline.append({'$match': match_session})
    pipeline.append({'$group': {'_id': None, 'total': {'$sum': '$duration_minutes'}}})
    hrs = list(mongo.db.sessions.aggregate(pipeline))
    teaching_minutes = hrs[0]['total'] if hrs and hrs[0].get('total') else 0
    
    sp_pipeline = []
    if match_sp:
        sp_pipeline.append({'$match': match_sp})
    sp_pipeline.append({'$group': {'_id': None, 'due': {'$sum': '$total_due'}, 'paid': {'$sum': '$amount_paid'}}})
    sp = list(mongo.db.student_payments.aggregate(sp_pipeline))
    total_due = sp[0]['due'] if sp else 0
    total_paid = sp[0]['paid'] if sp else 0
    
    tp_pipeline = []
    if match_tp:
        tp_pipeline.append({'$match': match_tp})
    tp_pipeline.append({'$group': {'_id': None, 'total': {'$sum': '$net_salary'}}})
    tp = list(mongo.db.teacher_payments.aggregate(tp_pipeline))
    total_payroll_le = tp[0]['total'] if tp else 0
    total_payroll = total_payroll_le / 50  # Convert L.E to USD (50 L.E = $1)
    
    return jsonify({"success": True, "data": {
        "active_students": active_students, "total_sessions": total_sessions,
        "total_due": total_due, "active_teachers": active_teachers,
        "inactive_teachers": inactive_teachers, "total_paid": total_paid,
        "teaching_hours": round(teaching_minutes / 60, 1), "absent_times": absent_times,
        "present_times": present_times, "balance": total_paid - total_payroll,
        "total_payroll": total_payroll,  # In USD
        "total_payroll_le": total_payroll_le,  # In L.E for reference
        "revenue": total_paid - total_payroll,
        "remaining": total_due - total_paid
    }})


# Students CRUD
@admin_bp.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    students = list(mongo.db.users.find({'role': 'student'}, {'password': 0}))
    for s in students:
        s['_id'] = str(s['_id'])
        if s.get('teacher_id'):
            s['teacher_id'] = str(s['teacher_id'])
    return jsonify({"success": True, "data": students})


@admin_bp.route('/students', methods=['POST'])
@jwt_required()
def add_student():
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    data = request.get_json(silent=True) or {}
    full_name = data.get('full_name', '').strip()
    family_name = data.get('family_name', '').strip()
    if not full_name or not family_name:
        return jsonify({"success": False, "message": "Name and family name are required"}), 400

    student_id = generate_family_id(family_name)
    email, password = generate_credentials(full_name, family_name, 'student', student_id)

    student = {
        'full_name': full_name, 'family_name': family_name,
        'student_id': student_id,
        'email': email, 'password': generate_password_hash(password),
        'plain_password': password,
        'teacher_id': data.get('teacher_id', ''), 'teacher_name': data.get('teacher_name', ''),
        'program': data.get('program', ''), 'plan': data.get('plan', ''),
        'class_duration': data.get('class_duration', ''),
        'hourly_rate': float(data.get('hourly_rate', 0) or 0),
        'status': data.get('status', 'active'), 'phone': data.get('phone', ''),
        'start_date': data.get('start_date', ''),
        'role': 'student', 'created_at': datetime.now(timezone.utc),
    }
    result = mongo.db.users.insert_one(student)
    return jsonify({"success": True, "data": {
        "_id": str(result.inserted_id), "student_id": student_id,
        "email": email, "generated_password": password,
    }})


@admin_bp.route('/students/<sid>', methods=['PUT'])
@jwt_required()
def update_student(sid):
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    data = request.get_json(silent=True) or {}
    update = {k: v for k, v in data.items() if k not in ('_id', 'password', 'role', 'email', 'student_id')}
    if 'hourly_rate' in update:
        update['hourly_rate'] = float(update['hourly_rate'] or 0)
    mongo.db.users.update_one({'_id': ObjectId(sid)}, {'$set': update})
    return jsonify({"success": True, "message": "Student updated"})


# Teachers CRUD
@admin_bp.route('/teachers', methods=['GET'])
@jwt_required()
def get_teachers():
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    teachers = list(mongo.db.users.find({'role': 'teacher'}, {'password': 0}))
    for t in teachers:
        t['_id'] = str(t['_id'])
    return jsonify({"success": True, "data": teachers})


@admin_bp.route('/teachers', methods=['POST'])
@jwt_required()
def add_teacher():
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    data = request.get_json(silent=True) or {}
    full_name = data.get('full_name', '').strip()
    family_name = data.get('family_name', '').strip()
    if not full_name:
        return jsonify({"success": False, "message": "Teacher name is required"}), 400

    email, password = generate_credentials(full_name, family_name, 'teacher')

    teacher = {
        'full_name': full_name, 'family_name': family_name,
        'email': email, 'password': generate_password_hash(password),
        'plain_password': password,
        'status': data.get('status', 'active'),
        'hourly_rate': float(data.get('hourly_rate', 0) or 0),
        'zoom_link': data.get('zoom_link', ''),
        'google_meet_link': data.get('google_meet_link', ''),
        'role': 'teacher', 'created_at': datetime.now(timezone.utc),
    }
    result = mongo.db.users.insert_one(teacher)
    return jsonify({"success": True, "data": {
        "_id": str(result.inserted_id),
        "email": email, "generated_password": password,
    }})


@admin_bp.route('/teachers/<tid>', methods=['PUT'])
@jwt_required()
def update_teacher(tid):
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    data = request.get_json(silent=True) or {}
    update = {k: v for k, v in data.items() if k not in ('_id', 'password', 'role', 'email')}
    for f in ('hourly_rate',):
        if f in update:
            update[f] = float(update[f] or 0)
    mongo.db.users.update_one({'_id': ObjectId(tid)}, {'$set': update})
    return jsonify({"success": True, "message": "Teacher updated"})


# Attendance
@admin_bp.route('/attendance', methods=['GET'])
@jwt_required()
def get_attendance():
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    
    query = {}
    
    # Backwards compatibility
    filter_by = request.args.get('filter_by', 'all')
    filter_value = request.args.get('filter_value', '')
    if filter_by == 'teacher' and filter_value:
        query['teacher_id'] = filter_value
    elif filter_by == 'student' and filter_value:
        query['student_id'] = filter_value
    elif filter_by == 'subject' and filter_value:
        query['subject'] = filter_value
    elif filter_by == 'month' and filter_value:
        query['date'] = {'$regex': f'^{filter_value}'}
        
    # Additional specific filters
    teacher_id = request.args.get('teacher_id')
    student_id = request.args.get('student_id')
    month = request.args.get('month')
    
    if teacher_id:
        query['teacher_id'] = teacher_id
    if student_id:
        query['student_id'] = student_id
    if month:
        query['date'] = {'$regex': f'^{month}'}
        
    # Remove limit for complete calculation
    sessions = list(mongo.db.sessions.find(query).sort('last_updated', -1))
    for s in sessions:
        s['_id'] = str(s['_id'])
        if s.get('teacher_id'):
            s['teacher_id'] = str(s['teacher_id'])
        if s.get('student_id'):
            s['student_id'] = str(s['student_id'])
    return jsonify({"success": True, "data": sessions})


# Scheduling
@admin_bp.route('/schedule', methods=['GET'])
@jwt_required()
def get_schedule():
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    # Get all teacher slots
    slots = list(mongo.db.time_slots.find())
    for s in slots:
        s['_id'] = str(s['_id'])
        teacher = mongo.db.users.find_one({'_id': ObjectId(s['teacher_id'])}) if s.get('teacher_id') else None
        s['teacher_name'] = teacher['full_name'] if teacher else 'Unknown'
    # Get scheduled sessions
    scheduled = list(mongo.db.scheduled_sessions.find().sort('created_at', -1))
    for s in scheduled:
        s['_id'] = str(s['_id'])
    return jsonify({"success": True, "data": {"slots": slots, "scheduled": scheduled}})


@admin_bp.route('/schedule', methods=['POST'])
@jwt_required()
def create_schedule():
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    data = request.get_json(silent=True) or {}
    teacher = mongo.db.users.find_one({'_id': ObjectId(data['teacher_id'])}) if data.get('teacher_id') else None
    student = mongo.db.users.find_one({'_id': ObjectId(data['student_id'])}) if data.get('student_id') else None
    room_id = f"fosselat-{ObjectId()}"
    session = {
        'teacher_id': data.get('teacher_id', ''),
        'teacher_name': teacher['full_name'] if teacher else '',
        'student_id': data.get('student_id', ''),
        'student_name': student['full_name'] if student else '',
        'student_family_name': student.get('family_name', '') if student else '',
        'student_family_id': student.get('student_id', '') if student else '',
        'subject': student.get('subject', '') if student else data.get('subject', ''),
        'day': data.get('day', ''),
        'start_time': data.get('start_time', ''),
        'end_time': data.get('end_time', ''),
        'duration': data.get('duration', '60 min'),
        'meeting_room_id': room_id,
        'recurring': True,
        'active': True,
        'created_at': datetime.now(timezone.utc),
    }
    result = mongo.db.scheduled_sessions.insert_one(session)
    session['_id'] = str(result.inserted_id)
    return jsonify({"success": True, "data": session})


@admin_bp.route('/student-slots/<student_id>', methods=['GET'])
@jwt_required()
def get_admin_student_slots(student_id):
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    slots = list(mongo.db.student_slots.find({'student_id': student_id}))
    for s in slots:
        s['_id'] = str(s['_id'])
    return jsonify({"success": True, "data": slots})



# Student Payments
@admin_bp.route('/payments/students', methods=['GET'])
@jwt_required()
def get_student_payments():
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    payments = list(mongo.db.student_payments.find().sort('created_at', -1))
    for p in payments:
        p['_id'] = str(p['_id'])
    return jsonify({"success": True, "data": payments})


@admin_bp.route('/payments/students', methods=['POST'])
@jwt_required()
def add_student_payment():
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    data = request.get_json(silent=True) or {}
    payment = {
        'family_id': data.get('family_id', ''),
        'members': data.get('members', ''),
        'month': data.get('month', ''),
        'total_due': float(data.get('total_due', 0) or 0),
        'amount_paid': float(data.get('amount_paid', 0) or 0),
        'remaining': float(data.get('remaining', 0) or 0),
        'status': data.get('status', 'unpaid'),
        'created_at': datetime.now(timezone.utc),
    }
    mongo.db.student_payments.insert_one(payment)
    return jsonify({"success": True, "message": "Payment recorded"})

@admin_bp.route('/payments/students/<pid>', methods=['PUT'])
@jwt_required()
def update_student_payment(pid):
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    data = request.get_json(silent=True) or {}
    update = {k: v for k, v in data.items() if k not in ('_id', 'created_at')}
    for f in ('total_due', 'amount_paid', 'remaining'):
        if f in update:
            update[f] = float(update[f] or 0)
    mongo.db.student_payments.update_one({'_id': ObjectId(pid)}, {'$set': update})
    return jsonify({"success": True, "message": "Payment updated"})


# Teacher Payments
@admin_bp.route('/payments/teachers', methods=['GET'])
@jwt_required()
def get_teacher_payments():
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    payments = list(mongo.db.teacher_payments.find().sort('created_at', -1))
    for p in payments:
        p['_id'] = str(p['_id'])
        if p.get('teacher_id'):
            p['teacher_id'] = str(p['teacher_id'])
    return jsonify({"success": True, "data": payments})


@admin_bp.route('/payments/teachers', methods=['POST'])
@jwt_required()
def add_teacher_payment():
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    data = request.get_json(silent=True) or {}
    payment = {
        'teacher_id': data.get('teacher_id', ''),
        'teacher_name': data.get('teacher_name', ''),
        'month': data.get('month', ''),
        'time_hours': float(data.get('time_hours', 0) or 0),
        'total_salary': float(data.get('total_salary', 0) or 0),
        'bonuses': float(data.get('bonuses', 0) or 0),
        'deductions': float(data.get('deductions', 0) or 0),
        'net_salary': float(data.get('net_salary', 0) or 0),
        'created_at': datetime.now(timezone.utc),
    }
    mongo.db.teacher_payments.insert_one(payment)
    return jsonify({"success": True, "message": "Payroll recorded"})

@admin_bp.route('/payments/teachers/<pid>', methods=['PUT'])
@jwt_required()
def update_teacher_payment(pid):
    if not require_admin():
        return jsonify({"success": False, "message": "Admin only"}), 403
    data = request.get_json(silent=True) or {}
    update = {k: v for k, v in data.items() if k not in ('_id', 'created_at')}
    for f in ('time_hours', 'total_salary', 'bonuses', 'deductions', 'net_salary'):
        if f in update:
            update[f] = float(update[f] or 0)
    mongo.db.teacher_payments.update_one({'_id': ObjectId(pid)}, {'$set': update})
    return jsonify({"success": True, "message": "Payroll updated"})
