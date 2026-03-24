import json
import os
import re
from datetime import datetime, timedelta
from types import SimpleNamespace

from database.db import get_connection
from utils.response import success_response, error_response
from utils.validators import validate_trip_dates


def _try_gemini_itinerary_text(
    destination, start_date, end_date, estimated_price, activities
):
    """
    Call teammate `llmService.generate_itinerary` (Gemini). Only import when
    GEMINI_API_KEY is set. Returns plain text or None on failure / missing key.
    """
    if not (os.getenv("GEMINI_API_KEY") or "").strip():
        return None
    try:
        from llmService import generate_itinerary

        data = SimpleNamespace(
            destination=destination,
            startDate=start_date,
            endDate=end_date,
            budget=int(float(estimated_price or 0)),
            activities=str(activities or ""),
        )
        text = generate_itinerary(data)
        if not text or not str(text).strip():
            return None
        return str(text).strip()
    except Exception as exc:
        print("Gemini itinerary error:", exc)
        return None


def _parse_gemini_text_to_day_blocks(text, start_date):
    """
    Split Gemini plain-text (Day 1 — date (title) / Morning / …) into the same
    structure the React ItineraryResult page expects. Falls back to one block if
    parsing finds no day sections.
    """
    text = (text or "").strip()
    text = re.sub(r"^\s*:\s*", "", text).strip()
    if not text:
        return None

    parts = re.split(r"(?m)^Day\s+\d+\s*[—–-]\s*", text)
    parts = [p.strip() for p in parts if p.strip()]
    if not parts:
        return None
    if (
        len(parts) > 1
        and not re.search(r"\d{4}-\d{2}-\d{2}", parts[0])
        and "Morning" not in parts[0]
        and re.search(r"\d{4}-\d{2}-\d{2}", parts[1])
    ):
        parts = parts[1:]

    headings = [
        "Morning",
        "Afternoon",
        "Lunch",
        "Evening",
        "Dinner",
        "Daily total estimate",
    ]
    day_blocks = []

    for index, block in enumerate(parts):
        dt_m = re.search(r"(\d{4}-\d{2}-\d{2})\s*\(([^)]*)\)", block)
        if dt_m:
            date_str = dt_m.group(1)
            day_title = dt_m.group(2).strip()
        else:
            date_str = start_date
            day_title = ""

        activities = []
        for i, heading in enumerate(headings):
            next_h = headings[i + 1] if i + 1 < len(headings) else None
            if next_h:
                pat = (
                    rf"{re.escape(heading)}\s*\r?\n"
                    rf"([\s\S]*?)(?=\s*{re.escape(next_h)}|\Z)"
                )
            else:
                pat = rf"{re.escape(heading)}\s*\r?\n([\s\S]*)"
            mm = re.search(pat, block)
            if mm:
                activities.append(
                    {"time": heading, "activity": mm.group(1).strip()}
                )

        if not activities:
            activities.append({"time": "Itinerary", "activity": block})

        day_blocks.append(
            {
                "day": index + 1,
                "date": date_str,
                "title": day_title or f"Day {index + 1}",
                "activities": activities,
            }
        )

    return day_blocks


def _wrap_llm_text_as_itinerary(
    text, destination, start_date, end_date, estimated_price
):
    """Map Gemini plain-text output to the JSON shape used by DB and frontend."""
    day_by_day_info = _parse_gemini_text_to_day_blocks(text, start_date)
    if not day_by_day_info:
        day_by_day_info = [
            {
                "day": 1,
                "date": start_date,
                "title": f"Itinerary — {destination}",
                "activities": [{"time": "", "activity": (text or "").strip()}],
            }
        ]
    return {
        "destination": destination,
        "startDate": start_date,
        "endDate": end_date,
        "budget": float(estimated_price or 0),
        "day_by_day_info": day_by_day_info,
    }


def build_itinerary(destination, start_date, end_date, estimated_price, activities):
    """Prefer Gemini (`llmService` + GEMINI_API_KEY); otherwise mock data."""
    llm_text = _try_gemini_itinerary_text(
        destination, start_date, end_date, estimated_price, activities
    )
    if llm_text:
        return _wrap_llm_text_as_itinerary(
            llm_text, destination, start_date, end_date, estimated_price
        )
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
    new_activities = payload.get("activities", "")

    date_error = validate_trip_dates(start_date, end_date)
    if date_error:
        return error_response(date_error, 400)


    # Merge Activities (History + new)
    combined_activities = []

    if user_id:
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT saved_activities, consent_given FROM accounts WHERE id = ?",
                (user_id,)
            )
            row = cursor.fetchone()

            if row:
                consent = bool(row["consent_given"])
                try:
                    saved_activities = json.loads(row["saved_activities"] or "[]")
                    if not isinstance(saved_activities, list):
                        saved_activities = []
                except Exception:
                    saved_activities = []

                # Clear history if consent removed
                if not consent:
                    cursor.execute(
                        "UPDATE accounts SET saved_activities = json('[]'), updated_at = ? WHERE id = ?",
                        (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), user_id)
                    )
                    conn.commit()
                    # Only use new activities
                    if isinstance(new_activities, str):
                        combined_activities = [a.strip() for a in new_activities.split(",") if a.strip()]
                    elif isinstance(new_activities, list):
                        combined_activities = new_activities
                    else:
                        combined_activities = []
                else:
                    # Merge new + saved activities
                    if isinstance(new_activities, str):
                        new_list = [a.strip() for a in new_activities.split(",") if a.strip()]
                    elif isinstance(new_activities, list):
                        new_list = new_activities
                    else:
                        new_list = []

                    combined_list = list(dict.fromkeys(saved_activities + new_list))
                    combined_activities = combined_list

                    # Save merged list back to DB
                    cursor.execute(
                        "UPDATE accounts SET saved_activities = ?, updated_at = ? WHERE id = ?",
                        (json.dumps(combined_list), datetime.now().strftime("%Y-%m-%d %H:%M:%S"), user_id)
                    )
                    conn.commit()
            else:
                # No row found, just use new activities
                if isinstance(new_activities, str):
                    combined_activities = [a.strip() for a in new_activities.split(",") if a.strip()]
                elif isinstance(new_activities, list):
                    combined_activities = new_activities
                else:
                    combined_activities = []
        finally:
            conn.close()
    else:
        # Guest user → only use new activities
        if isinstance(new_activities, str):
            combined_activities = [a.strip() for a in new_activities.split(",") if a.strip()]
        elif isinstance(new_activities, list):
            combined_activities = new_activities
        else:
            combined_activities = []

    # Generate itinerary using combined activities
    itinerary = build_itinerary(
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        estimated_price=estimated_price,
        activities=combined_activities,
    )

    if is_guest:
        return success_response(
            "Itinerary generated successfully.",
            200,
            itinerary=itinerary,
        )

    if not user_id:
        return error_response("User ID is required.", 400)

    # Save itinerary
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

        activities = payload.get("activities", [])
        if isinstance(activities, str):
            activities = [a.strip() for a in activities.split(",") if a.strip()]

        new_itinerary = build_itinerary(
            destination=destination,
            start_date=start_date,
            end_date=end_date,
            estimated_price=estimated_price,
            activities=activities
        )
        day_by_day_info = json.dumps(new_itinerary["day_by_day_info"], ensure_ascii=False)


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

        return success_response("Itinerary updated successfully.", 200, itinerary=new_itinerary)
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