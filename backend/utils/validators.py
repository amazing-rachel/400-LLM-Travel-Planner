from datetime import datetime
import re


def validate_username(username):
    if not username:
        return "Username is required."
    if len(username) < 3 or len(username) > 20:
        return "Invalid username (Username must be between 3 and 20 characters long)."
    if not re.match(r"^[a-zA-Z]", username):
        return "Invalid username (Username must start with a letter)."
    if not re.match(r"^[a-zA-Z0-9\-_]+$", username):
        return "Invalid username (Username can only contain letters, numbers, hyphens, and underscores, no spaces)."
    return None


def validate_email(email):
    if not email:
        return "Email is required."
    if "@" not in email:
        return "Invalid email (Email must contain @)."
    if not re.search(r"\.[a-zA-Z]+$", email):
        return "Invalid email (Email must contain a domain name such as .com or .net)."
    if re.search(r"\s", email):
        return "Invalid email (Email cannot contain spaces)."
    return None


def validate_password(password):
    if not password:
        return "Password is required."
    if len(password) < 4:
        return "Password must be at least 4 characters."
    return None


def validate_trip_dates(start_date, end_date):
    if not start_date:
        return "Start date is required."
    if not end_date:
        return "End date is required."

    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        return "Dates must use YYYY-MM-DD format."

    if end < start:
        return "End date must be on or after start date."

    return None