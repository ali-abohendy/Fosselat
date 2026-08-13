from datetime import datetime, timezone

from bson import ObjectId

from app import mongo


def get_all_teachers():
    """Return all teachers."""
    return list(mongo.db.teachers.find().sort('created_at', -1))


def get_teacher_by_id(teacher_id):
    """Return a single teacher by its ObjectId string."""
    try:
        return mongo.db.teachers.find_one({'_id': ObjectId(teacher_id)})
    except Exception:
        return None


def create_teacher(data):
    """Insert a new teacher document. Returns the inserted ID string."""
    teacher = {
        'name': data['name'],
        'title': data.get('title', ''),
        'bio': data.get('bio', ''),
        'experience_years': data.get('experience_years', 0),
        'image': data.get('image', ''),
        'specializations': data.get('specializations', []),
        'created_at': datetime.now(timezone.utc),
    }
    result = mongo.db.teachers.insert_one(teacher)
    return str(result.inserted_id)


def serialize_teacher(teacher):
    """Convert a teacher document to a JSON-safe dict."""
    if teacher is None:
        return None
    return {
        'id': str(teacher['_id']),
        'name': teacher.get('name', ''),
        'title': teacher.get('title', ''),
        'bio': teacher.get('bio', ''),
        'experience_years': teacher.get('experience_years', 0),
        'image': teacher.get('image', ''),
        'specializations': teacher.get('specializations', []),
        'created_at': teacher.get('created_at', '').isoformat() if teacher.get('created_at') else None,
    }
