import os

from database.db import get_connection
from utils.response import error_response, success_response


def _admin_user_from_header():
    """Validate X-User-Id header refers to an admin account."""
    from flask import request

    raw = request.headers.get("X-User-Id") or request.headers.get("x-user-id")
    if not raw:
        return None, error_response("Authentication required. Send X-User-Id header.", 401)
    try:
        uid = int(raw)
    except (TypeError, ValueError):
        return None, error_response("Invalid user id.", 400)

    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM accounts WHERE id = ?", (uid,)).fetchone()
        if not row:
            return None, error_response("User not found.", 404)
        if row["role"] != "admin":
            return None, error_response("Admin access required.", 403)
        return row, None
    finally:
        conn.close()


def get_metrics():
    _user, err = _admin_user_from_header()
    if err is not None:
        return err
    try:
        import psutil

        vm = psutil.virtual_memory()
        cpu = psutil.cpu_percent(interval=0.15)
        proc = psutil.Process(os.getpid())
        rss_mb = proc.memory_info().rss / (1024 * 1024)
    except Exception as exc:
        print("metrics psutil fallback:", exc)
        vm = None
        cpu = None
        rss_mb = None

    gemini = bool((os.getenv("GEMINI_API_KEY") or "").strip())
    llm_status = "Connected" if gemini else "Not configured"

    return success_response(
        "Metrics loaded.",
        200,
        serverThroughput=(
            f"{cpu:.1f}% CPU" if cpu is not None else "N/A"
        ),
        activeConcurrentRequests=0,
        memoryLatency=(
            f"{vm.percent:.0f}% RAM used" if vm is not None else "N/A"
        ),
        memoryOverhead=(
            f"{rss_mb:.1f} MB (app)" if rss_mb is not None else "N/A"
        ),
        llmUsage=llm_status,
    )


def list_registered_users():
    _user, err = _admin_user_from_header()
    if err is not None:
        return err

    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT
                a.id,
                a.username,
                a.email,
                a.first_name,
                a.last_name,
                a.role,
                a.consent_given,
                (SELECT COUNT(*) FROM saved_itineraries s WHERE s.parent_id = a.id) AS trip_count
            FROM accounts a
            WHERE a.role = 'user'
            ORDER BY a.id ASC
            """
        ).fetchall()

        users = []
        for row in rows:
            fn = (row["first_name"] or "").strip()
            ln = (row["last_name"] or "").strip()
            name = f"{fn} {ln}".strip() or row["username"]
            status = "Active" if row["consent_given"] else "Suspended"
            users.append(
                {
                    "id": str(row["id"]),
                    "name": name,
                    "email": row["email"],
                    "savedTrips": int(row["trip_count"] or 0),
                    "status": status,
                }
            )

        return success_response(
            "Users loaded.",
            200,
            users=users,
        )
    finally:
        conn.close()


def list_all_saved_itineraries():
    """Admin only: all saved itineraries with owner account info."""
    from services.itinerary_service import serialize_itinerary

    _user, err = _admin_user_from_header()
    if err is not None:
        return err

    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT s.*, a.username AS owner_username, a.email AS owner_email,
                   a.first_name AS owner_first_name, a.last_name AS owner_last_name
            FROM saved_itineraries s
            JOIN accounts a ON a.id = s.parent_id
            ORDER BY s.itinerary_id DESC
            """
        ).fetchall()

        itineraries = []
        for row in rows:
            base = serialize_itinerary(row)
            fn = (row["owner_first_name"] or "").strip()
            ln = (row["owner_last_name"] or "").strip()
            display = f"{fn} {ln}".strip() or row["owner_username"]
            base["owner_username"] = row["owner_username"]
            base["owner_email"] = row["owner_email"]
            base["owner_display_name"] = display
            itineraries.append(base)

        return success_response(
            "All saved itineraries loaded.",
            200,
            itineraries=itineraries,
        )
    except Exception as e:
        print("LIST ALL SAVED ITINERARIES ERROR:", e)
        return error_response("Could not load itineraries.", 500)
    finally:
        conn.close()


def delete_user_account(target_user_id):
    _user, err = _admin_user_from_header()
    if err is not None:
        return err

    try:
        tid = int(target_user_id)
    except (TypeError, ValueError):
        return error_response("Invalid user id.", 400)

    conn = get_connection()
    try:
        target = conn.execute(
            "SELECT id, role FROM accounts WHERE id = ?", (tid,)
        ).fetchone()
        if not target:
            return error_response("User not found.", 404)
        if target["role"] == "admin":
            return error_response("Cannot delete an administrator account.", 403)

        conn.execute("DELETE FROM saved_itineraries WHERE parent_id = ?", (tid,))
        conn.execute("DELETE FROM accounts WHERE id = ?", (tid,))
        conn.commit()

        return success_response("User removed.", 200, deleted_id=tid)
    except Exception as e:
        print("DELETE USER ERROR:", e)
        return error_response("Could not delete user.", 500)
    finally:
        conn.close()
