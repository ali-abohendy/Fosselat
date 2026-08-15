from datetime import datetime, timezone

from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash

from app import mongo


def create_user(full_name, email, password, role='student'):
    """Create a new user with a hashed password. Returns the inserted ID."""
    user = {
        'full_name': full_name,
        'email': email.lower().strip(),
        'password': generate_password_hash(password),
        'role': role,
        'created_at': datetime.now(timezone.utc),
    }
    result = mongo.db.users.insert_one(user)
    return str(result.inserted_id)


def find_user_by_email(email):
    """Return the user document or None."""
    return mongo.db.users.find_one({'email': email.lower().strip()})


def find_user_by_id(user_id):
    """Return the user document (without password) or None."""
    try:
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    except Exception:
        return None
    if user:
        user.pop('password', None)
    return user


def verify_password(stored_hash, password):
    """Check a plain-text password against the stored hash."""
    if stored_hash and (stored_hash.startswith('$2b$') or stored_hash.startswith('$2a$')):
        try:
            import bcrypt
            return bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
        except Exception:
            return False
    return check_password_hash(stored_hash, password)


def serialize_user(user):
    """Convert a user document to a JSON-safe dict."""
    if user is None:
        return None
    return {
        'id': str(user['_id']),
        'full_name': user.get('full_name', ''),
        'family_name': user.get('family_name', ''),
        'email': user.get('email', ''),
        'role': user.get('role', 'student'),
        'phone': user.get('phone', ''),
        'status': user.get('status', 'active'),
        'created_at': user.get('created_at', '').isoformat() if user.get('created_at') else None,
    }
