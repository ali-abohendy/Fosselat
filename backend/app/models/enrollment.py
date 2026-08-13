from datetime import datetime, timezone

from bson import ObjectId

from app import mongo


def create_enrollment(data):
    """Create a new enrollment. Returns the inserted ID string."""
    enrollment = {
        'user_id': data.get('user_id'),
        'course_id': data.get('course_id'),
        'full_name': data.get('full_name', ''),
        'email': data.get('email', '').lower().strip(),
        'phone': data.get('phone', ''),
        'status': 'active',
        'progress': 0,
        'enrolled_at': datetime.now(timezone.utc),
    }
    result = mongo.db.enrollments.insert_one(enrollment)
    return str(result.inserted_id)


def get_user_enrollments(user_id):
    """Return all enrollments for a given user ID string."""
    return list(mongo.db.enrollments.find({'user_id': user_id}).sort('enrolled_at', -1))


def serialize_enrollment(enrollment):
    """Convert an enrollment document to a JSON-safe dict."""
    if enrollment is None:
        return None
    return {
        'id': str(enrollment['_id']),
        'user_id': enrollment.get('user_id', ''),
        'course_id': enrollment.get('course_id', ''),
        'full_name': enrollment.get('full_name', ''),
        'email': enrollment.get('email', ''),
        'phone': enrollment.get('phone', ''),
        'status': enrollment.get('status', 'active'),
        'progress': enrollment.get('progress', 0),
        'enrolled_at': enrollment.get('enrolled_at', '').isoformat() if enrollment.get('enrolled_at') else None,
    }
