from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app import mongo

placement_bp = Blueprint('placement', __name__, url_prefix='/api/placement')

def send_placement_email(user_info, results):
    smtp_server = os.getenv('SMTP_SERVER', 'smtp.hostinger.com')
    smtp_port = int(os.getenv('SMTP_PORT', 465))
    smtp_user = os.getenv('SMTP_USERNAME', 'info@fosselatacademy.com')
    smtp_pass = os.getenv('SMTP_PASSWORD')

    if not smtp_pass:
        print("WARNING: SMTP_PASSWORD not configured. Emails will not be sent.")
        return False

    student_email = user_info.get('email')
    student_name = user_info.get('name', 'Student')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = f"Fosselat Academy Placement Results - {student_name}"
    msg['From'] = smtp_user
    msg['To'] = f"{student_email}, {smtp_user}"

    strengths_html = "".join([f"<li>{s['skill']} ({int(s['pct']*100)}%)</li>" for s in results.get('strengths', [])])
    weaknesses_html = "".join([f"<li>{s['skill']} ({int(s['pct']*100)}%)</li>" for s in results.get('weaknesses', [])])
    
    html_content = f\"\"\"
    <html>
      <body>
        <h2>Placement Assessment Results</h2>
        <p>Dear {student_name},</p>
        <p>Thank you for taking the Fosselat Academy placement assessment.</p>
        
        <table style="width:100%; max-width:600px; border-collapse:collapse;" border="1" cellpadding="8">
          <tr style="background:#f4f4f4;"><th>Track</th><td>{results.get('trackLabel')}</td></tr>
          <tr><th>Program</th><td>{results.get('programLabel')}</td></tr>
          <tr style="background:#f4f4f4;"><th>Recommended Level</th><td><strong>{results.get('recommendedLevel')}</strong></td></tr>
          <tr><th>Overall Score</th><td>{results.get('overallScore')}%</td></tr>
        </table>
        
        <h3>Strengths:</h3>
        <ul>{strengths_html or "<li>Solid foundation.</li>"}</ul>
        
        <h3>Areas to Build:</h3>
        <ul>{weaknesses_html or "<li>No specific gaps identified.</li>"}</ul>
        
        <p><strong>Estimated Duration:</strong> {results.get('durationLabel', '')} ({results.get('durationNote', '')})</p>
        
        <p>{results.get('summary', '')}</p>
        <p>{results.get('nextStep', '')}</p>
        
        <p>Best regards,<br>Fosselat Academy</p>
      </body>
    </html>
    \"\"\"

    msg.attach(MIMEText(html_content, 'html'))

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


@placement_bp.route('/send-results', methods=['POST'])
def save_and_send_results():
    data = request.get_json(silent=True) or {}
    user_info = data.get('userInfo')
    results = data.get('results')

    if not user_info or not results or not user_info.get('email'):
        return jsonify({"success": False, "message": "Missing required data"}), 400

    record = {
        "user_info": user_info,
        "results": results,
        "created_at": datetime.now(timezone.utc)
    }

    try:
        mongo.db.placement_results.insert_one(record)
    except Exception as e:
        print(f"Error saving to DB: {e}")

    email_sent = send_placement_email(user_info, results)

    return jsonify({"success": True, "email_sent": email_sent})
