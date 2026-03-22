import json
from datetime import datetime, timedelta

from database.db import get_connection
from utils.response import success_response, error_response
from utils.validators import validate_trip_dates


def build_itinerary(destination, start_date, end_date, estimated_price, activities):
    """Mock itinerary until LLM branch is merged and wired in."""
    return build_mock_itinerary(
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        estimated_price=estimated_price,
        activities=activities,
    )


def generate_and_save_itinerary(payload):
    is_guest = bool(payload.get("guest"))
    user_id = payload.get("user_id") or payload.get("userId") or payload.get("parent_id")
    destination = first_non_empty(
        payload.get("destination"),
        payload.get("location"),
        payload.get("city"),
        "Unknown Destination"
    )
    start_date = first_non_empty(
        payload.get("startDate"),
        payload.get("start_date")
    )
    end_date = first_non_empty(
        payload.get("endDate"),
        payload.get("end_date")
    )
    estimated_price = payload.get("budget", payload.get("estimated_price", 0))
    activities = payload.get("activities", "")

    date_error = validate_trip_dates(start_date, end_date)
    if date_error:
        return error_response(date_error, 400)

    itinerary = build_itinerary(
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        estimated_price=estimated_price,
        activities=activities,
    )

    if is_guest:
        return success_response(
            "Itinerary generated successfully.",
            200,
            itinerary=itinerary,
        )

    if not user_id:
        return error_response("User ID is required.", 400)

    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO saved_itineraries (
                parent_id, destination, start_date, end_date,
                estimated_price, day_by_day_info, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                int(user_id),
                itinerary["destination"],
                itinerary["startDate"],
                itinerary["endDate"],
                float(itinerary["budget"]),
                json.dumps(itinerary["day_by_day_info"], ensure_ascii=False),
                datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            )
        )
        conn.commit()
        itinerary_id = cursor.lastrowid

        itinerary["itinerary_id"] = itinerary_id
        itinerary["parent_id"] = int(user_id)

        return success_response(
            "Itinerary generated and saved successfully.",
            200,
            itinerary=itinerary
        )
    except Exception as e:
        print("GENERATE AND SAVE ERROR:", e)
        return error_response("An error occurred while generating itinerary.", 500)
    finally:
        conn.close()


def get_saved_itineraries(user_id):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        rows = cursor.execute(
            """
            SELECT * FROM saved_itineraries
            WHERE parent_id = ?
            ORDER BY itinerary_id DESC
            """,
            (user_id,)
        ).fetchall()

        itineraries = [serialize_itinerary(row) for row in rows]

        return success_response(
            "Saved itineraries fetched successfully.",
            200,
            itineraries=itineraries
        )
    except Exception as e:
        print("GET SAVED ITINERARIES ERROR:", e)
        return error_response("An error occurred while fetching saved itineraries.", 500)
    finally:
        conn.close()


def update_itinerary(itinerary_id, payload):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        existing = cursor.execute(
            "SELECT * FROM saved_itineraries WHERE itinerary_id = ?",
            (itinerary_id,)
        ).fetchone()

        if not existing:
            return error_response("Itinerary not found.", 404)

        destination = first_non_empty(payload.get("destination"), existing["destination"])
        start_date = first_non_empty(payload.get("startDate"), payload.get("start_date"), existing["start_date"])
        end_date = first_non_empty(payload.get("endDate"), payload.get("end_date"), existing["end_date"])
        estimated_price = payload.get("budget", payload.get("estimated_price", existing["estimated_price"]))
        day_by_day_info = payload.get("day_by_day_info", existing["day_by_day_info"])

        if not isinstance(day_by_day_info, str):
            day_by_day_info = json.dumps(day_by_day_info, ensure_ascii=False)

        cursor.execute(
            """
            UPDATE saved_itineraries
            SET destination = ?, start_date = ?, end_date = ?,
                estimated_price = ?, day_by_day_info = ?, updated_at = ?
            WHERE itinerary_id = ?
            """,
            (
                destination,
                start_date,
                end_date,
                float(estimated_price),
                day_by_day_info,
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                itinerary_id
            )
        )
        conn.commit()

        return success_response("Itinerary updated successfully.", 200, itinerary_id=itinerary_id)
    except Exception as e:
        print("UPDATE ITINERARY ERROR:", e)
        return error_response("An error occurred while updating itinerary.", 500)
    finally:
        conn.close()


def delete_itinerary(itinerary_id):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        existing = cursor.execute(
            "SELECT itinerary_id FROM saved_itineraries WHERE itinerary_id = ?",
            (itinerary_id,)
        ).fetchone()

        if not existing:
            return error_response("Itinerary not found.", 404)

        cursor.execute(
            "DELETE FROM saved_itineraries WHERE itinerary_id = ?",
            (itinerary_id,)
        )
        conn.commit()

        return success_response("Itinerary deleted successfully.", 200, itinerary_id=itinerary_id)
    except Exception as e:
        print("DELETE ITINERARY ERROR:", e)
        return error_response("An error occurred while deleting itinerary.", 500)
    finally:
        conn.close()


def build_mock_itinerary(destination, start_date, end_date, estimated_price, activities):
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    if isinstance(activities, str):
        activities_list = [activities] if activities.strip() else []
    elif isinstance(activities, list):
        activities_list = activities
    else:
        activities_list = []

    interests_text = ", ".join(activities_list) if activities_list else "general sightseeing"

    days = []
    current = start
    day_number = 1

    while current <= end:
        days.append({
            "day": day_number,
            "date": current.strftime("%Y-%m-%d"),
            "title": f"Day {day_number} in {destination}",
            "activities": [
                {
                    "time": "09:00",
                    "activity": f"Morning exploration in {destination}"
                },
                {
                    "time": "13:00",
                    "activity": f"Lunch and local experiences focused on {interests_text}"
                },
                {
                    "time": "18:00",
                    "activity": f"Evening relaxation and highlights in {destination}"
                }
            ]
        })
        current += timedelta(days=1)
        day_number += 1

    return {
        "destination": destination,
        "startDate": start_date,
        "endDate": end_date,
        "budget": float(estimated_price or 0),
        "day_by_day_info": days
    }


def serialize_itinerary(row):
    raw_day_info = row["day_by_day_info"]
    try:
        day_info = json.loads(raw_day_info)
    except Exception:
        day_info = raw_day_info

    return {
        "itinerary_id": row["itinerary_id"],
        "parent_id": row["parent_id"],
        "destination": row["destination"],
        "startDate": row["start_date"],
        "endDate": row["end_date"],
        "budget": row["estimated_price"],
        "day_by_day_info": day_info,
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }


def first_non_empty(*values):
    for value in values:
        if value is not None and str(value).strip() != "":
            return str(value).strip()
    return ""