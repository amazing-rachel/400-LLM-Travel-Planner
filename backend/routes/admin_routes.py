from flask import Blueprint

from services.admin_service import (
    delete_user_account,
    get_metrics,
    list_all_saved_itineraries,
    list_registered_users,
)

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.route("/metrics", methods=["GET"])
def admin_metrics():
    return get_metrics()


@admin_bp.route("/users", methods=["GET"])
def admin_users():
    return list_registered_users()


@admin_bp.route("/saved-itineraries", methods=["GET"])
def admin_all_saved_itineraries():
    return list_all_saved_itineraries()


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
def admin_delete_user(user_id):
    return delete_user_account(user_id)
