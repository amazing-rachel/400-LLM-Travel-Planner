from datetime import datetime
import bcrypt

from database.db import get_connection
from utils.response import success_response, error_response
from utils.validators import validate_username, validate_email, validate_password


def register_user(payload):
    username = str(payload.get("username", "")).strip()
    email = str(payload.get("email", "")).strip()
    password = str(payload.get("password", ""))
    first_name = str(payload.get("first_name", payload.get("firstName", ""))).strip()
    last_name = str(payload.get("last_name", payload.get("lastName", ""))).strip()

    username_error = validate_username(username)
    email_error = validate_email(email)
    password_error = validate_password(password)

    if username_error:
        return error_response(username_error, 400)
    if email_error:
        return error_response(email_error, 400)
    if password_error:
        return error_response(password_error, 400)

    conn = get_connection()
    try:
        cursor = conn.cursor()

        existing_email = cursor.execute(
            "SELECT id FROM accounts WHERE email = ?",
            (email,)
        ).fetchone()

        if existing_email:
            return error_response("Email already exists.", 409)

        hashed_password = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute(
            """
            INSERT INTO accounts (
                username, email, first_name, last_name, password,
                saved_activities, role, consent_given, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                username,
                email,
                first_name,
                last_name,
                hashed_password,
                "[]",
                "user",
                0,
                now,
                now
            )
        )
        conn.commit()

        user_id = cursor.lastrowid

        return success_response(
            "Registration successful.",
            201,
            user={
                "id": user_id,
                "username": username,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "role": "user",
                "consent_given": 0
            }
        )
    except Exception as e:
        print("REGISTER ERROR:", e)
        return error_response("An error occurred during registration.", 500)
    finally:
        conn.close()


def login_user(payload):
    return _login(payload, admin_only=False)


def admin_login_user(payload):
    return _login(payload, admin_only=True)


def _login(payload, admin_only=False):
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))

    if not username:
        return error_response("Username is required.", 400)
    if not password:
        return error_response("Password is required.", 400)

    conn = get_connection()
    try:
        cursor = conn.cursor()

        user = cursor.execute(
            "SELECT * FROM accounts WHERE username = ?",
            (username,)
        ).fetchone()

        if not user:
            return error_response("Invalid username or password.", 401)

        if not bcrypt.checkpw(password.encode(), user["password"].encode()):
            return error_response("Invalid username or password.", 401)

        return success_response(
            "Login successful.",
            200,
            user={
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
                "consent_given": user["consent_given"]
            }
        )

    finally:
        conn.close()