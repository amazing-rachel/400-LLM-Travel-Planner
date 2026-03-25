from datetime import datetime

from database.db import get_connection
from utils.response import success_response, error_response


def get_consent_status(user_id):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        user = cursor.execute(
            "SELECT id, consent_given FROM accounts WHERE id = ?",
            (user_id,)
        ).fetchone()

        if not user:
            return error_response("User not found.", 404)

        return success_response(
            "Consent status fetched successfully.",
            200,
            consent_given=bool(user["consent_given"]),
            user_id=user["id"]
        )
    except Exception as e:
        print("GET CONSENT ERROR:", e)
        return error_response("An error occurred while fetching consent status.", 500)
    finally:
        conn.close()


def update_consent_status(user_id, payload):
    consent_value = payload.get("consent_given", payload.get("consentGiven"))

    if consent_value is None:
        return error_response("consent_given is required.", 400)

    normalized_value = normalize_boolean(consent_value)
    if normalized_value is None:
        return error_response("Invalid consent value.", 400)

    conn = get_connection()
    try:
        cursor = conn.cursor()

        existing_user = cursor.execute(
            "SELECT id FROM accounts WHERE id = ?",
            (user_id,)
        ).fetchone()

        if not existing_user:
            return error_response("User not found.", 404)

        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute(
            """
            UPDATE accounts
            SET consent_given = ?, updated_at = ?
            WHERE id = ?
            """,
            (1 if normalized_value else 0, now, user_id)
        )
        conn.commit()

        return success_response(
            "Consent updated successfully.",
            200,
            user_id=user_id,
            consent_given=normalized_value
        )
    except Exception as e:
        print("UPDATE CONSENT ERROR:", e)
        return error_response("An error occurred while updating consent.", 500)
    finally:
        conn.close()


def normalize_boolean(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, int):
        return value in (0, 1) and bool(value)
    if isinstance(value, str):
        v = value.strip().lower()
        if v in ("true", "1", "yes", "y"):
            return True
        if v in ("false", "0", "no", "n"):
            return False
    return None