from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager

from app.config import Config

# Global extensions — initialized once, shared across the app
mongo = PyMongo()
jwt = JWTManager()


def create_app(config_class=Config):
    """Application factory."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # ---------- Extensions ----------
    mongo.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

    # ---------- JWT error handlers ----------
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {"success": False, "message": "Token has expired"}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {"success": False, "message": "Invalid token"}, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {"success": False, "message": "Authorization token is missing"}, 401

    # ---------- Blueprints ----------
    from app.routes.auth import auth_bp
    from app.routes.courses import courses_bp
    from app.routes.teachers import teachers_bp
    from app.routes.enrollments import enrollments_bp
    from app.routes.contact import contact_bp
    from app.routes.admin import admin_bp
    from app.routes.teacher_dash import teacher_bp2
    from app.routes.student_dash import student_bp, meetings_bp, reviews_bp, sessions_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(courses_bp)
    app.register_blueprint(teachers_bp)
    app.register_blueprint(enrollments_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(teacher_bp2)
    app.register_blueprint(student_bp)
    app.register_blueprint(meetings_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(sessions_bp)

    # ---------- Health-check ----------
    @app.route('/api/health')
    def health():
        return {"success": True, "message": "Fosselat Academy API is running"}

    return app
