import os
import smtplib
from email.message import EmailMessage
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify

from app import mongo
from app.utils.validators import validate_required_fields, validate_email

contact_bp = Blueprint('contact', __name__, url_prefix='/api/contact')


def send_contact_email(name, user_email, message):
    smtp_server = os.environ.get('SMTP_SERVER')
    smtp_port = int(os.environ.get('SMTP_PORT', 465))
    smtp_user = os.environ.get('SMTP_USERNAME')
    smtp_pass = os.environ.get('SMTP_PASSWORD')
    
    if not smtp_server or not smtp_user or not smtp_pass:
        print("SMTP credentials not configured.")
        return False
        
    msg = EmailMessage()
    msg['Subject'] = f"New Contact Form Message from {name}"
    msg['From'] = smtp_user
    msg['To'] = smtp_user
    msg['Reply-To'] = user_email
    
    msg.set_content(f"""You have received a new message from the Fosselat Academy Contact Form.

Name: {name}
Email: {user_email}

Message:
{message}
""")

    try:
        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


# -------------------------------------------------------------------
# POST /api/contact
# -------------------------------------------------------------------
@contact_bp.route('', methods=['POST'])
def submit_contact():
    data = request.get_json(silent=True) or {}

    missing = validate_required_fields(data, ['name', 'email', 'message'])
    if missing:
        return jsonify({"success": False, "message": f"Missing required fields: {', '.join(missing)}"}), 400

    if not validate_email(data['email']):
        return jsonify({"success": False, "message": "Invalid email format"}), 400

    contact = {
        'name': data['name'].strip(),
        'email': data['email'].lower().strip(),
        'message': data['message'].strip(),
        'submitted_at': datetime.now(timezone.utc),
    }
    
    # Save to MongoDB
    mongo.db.contacts.insert_one(contact)
    
    # Send email notification
    send_contact_email(contact['name'], contact['email'], contact['message'])

    return jsonify({
        "success": True,
        "message": "Your message has been sent successfully",
    }), 201
