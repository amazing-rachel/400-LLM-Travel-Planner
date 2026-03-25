from flask import Blueprint, request
from services.itinerary_service import (
    generate_and_save_itinerary,
    get_saved_itineraries,
    delete_itinerary,
    update_itinerary
)

itinerary_bp = Blueprint("itinerary", __name__)


@itinerary_bp.route("/trip-input", methods=["POST"])
def trip_input():
    payload = request.get_json(silent=True) or {}
    return generate_and_save_itinerary(payload)


@itinerary_bp.route("/saved-itineraries/<int:user_id>", methods=["GET"])
def get_saved(user_id):
    return get_saved_itineraries(user_id)


@itinerary_bp.route("/delete-itinerary/<int:itinerary_id>", methods=["DELETE"])
def delete_saved(itinerary_id):
    return delete_itinerary(itinerary_id)


@itinerary_bp.route("/update-itinerary/<int:itinerary_id>", methods=["PUT"])
def update_saved(itinerary_id):
    payload = request.get_json(silent=True) or {}
    return update_itinerary(itinerary_id, payload)