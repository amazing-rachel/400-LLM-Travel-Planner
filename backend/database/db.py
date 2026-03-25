import sqlite3
from pathlib import Path
from datetime import datetime
import bcrypt

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "app.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    try:
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            conn.executescript(f.read())
        conn.commit()
        seed_default_admins(conn)
    finally:
        conn.close()


def seed_default_admins(conn):
    cursor = conn.cursor()

    existing_admin = cursor.execute(
        "SELECT id FROM accounts WHERE role = 'admin' LIMIT 1"
    ).fetchone()

    if existing_admin:
        return

    admins = [
        {
            "username": "admin1",
            "email": "admin1@admin.com",
            "first_name": "John",
            "last_name": "Admin",
            "password": "Admin123!",
            "role": "admin"
        },
        {
            "username": "admin2",
            "email": "admin2@admin.com",
            "first_name": "Jane",
            "last_name": "Admin",
            "password": "Admin234!",
            "role": "admin"
        }
    ]

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for admin in admins:
        hashed_password = bcrypt.hashpw(
            admin["password"].encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        cursor.execute(
            """
            INSERT INTO accounts (
                username, email, first_name, last_name, password,
                saved_activities, role, consent_given, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                admin["username"],
                admin["email"],
                admin["first_name"],
                admin["last_name"],
                hashed_password,
                "[]",
                admin["role"],
                0,
                now,
                now
            )
        )

    conn.commit()