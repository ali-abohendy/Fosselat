import re


def validate_email(email):
    """Return True if the email looks valid."""
    if not email:
        return False
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_required_fields(data, fields):
    """Return a list of missing field names. Empty list means all present."""
    missing = []
    for field in fields:
        value = data.get(field)
        if value is None or (isinstance(value, str) and not value.strip()):
            missing.append(field)
    return missing


def validate_password(password):
    """Password must be at least 6 characters."""
    if not password or len(password) < 6:
        return False
    return True
