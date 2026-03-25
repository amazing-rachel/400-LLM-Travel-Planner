from flask import Blueprint, request
from services.auth_service import register_user, login_user, admin_login_user

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    payload = request.get_json(silent=True) or {}
    return register_user(payload)


@auth_bp.route("/login", methods=["POST"])
@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    return login_user(payload)


@auth_bp.route("/admin-login", methods=["POST"])
@auth_bp.route("/api/auth/admin-login", methods=["POST"])
def admin_login():
    payload = request.get_json(silent=True) or {}
    return admin_login_user(payload)