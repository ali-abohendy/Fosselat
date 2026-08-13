from datetime import datetime, timezone

from bson import ObjectId

from app import mongo


def get_all_courses():
    """Return all courses."""
    return list(mongo.db.courses.find().sort('created_at', -1))


def get_course_by_id(course_id):
    """Return a single course by its ObjectId string."""
    try:
        return mongo.db.courses.find_one({'_id': ObjectId(course_id)})
    except Exception:
        return None


def get_popular_courses():
    """Return courses flagged as popular."""
    return list(mongo.db.courses.find({'is_popular': True}).sort('created_at', -1))


def create_course(data):
    """Insert a new course document. Returns the inserted ID string."""
    course = {
        'title': data['title'],
        'slug': data.get('slug', data['title'].lower().replace(' ', '-')),
        'description': data.get('description', ''),
        'short_description': data.get('short_description', ''),
        'icon': data.get('icon', ''),
        'image': data.get('image', ''),
        'level': data.get('level', 'Beginner'),
        'subjects': data.get('subjects', []),
        'teacher_id': data.get('teacher_id'),
        'is_popular': data.get('is_popular', False),
        'created_at': datetime.now(timezone.utc),
    }
    result = mongo.db.courses.insert_one(course)
    return str(result.inserted_id)


def serialize_course(course):
    """Convert a course document to a JSON-safe dict."""
    if course is None:
        return None
    return {
        'id': str(course['_id']),
        'title': course.get('title', ''),
        'slug': course.get('slug', ''),
        'description': course.get('description', ''),
        'short_description': course.get('short_description', ''),
        'icon': course.get('icon', ''),
        'image': course.get('image', ''),
        'level': course.get('level', ''),
        'subjects': course.get('subjects', []),
        'teacher_id': str(course['teacher_id']) if course.get('teacher_id') else None,
        'is_popular': course.get('is_popular', False),
        'created_at': course.get('created_at', '').isoformat() if course.get('created_at') else None,
    }
