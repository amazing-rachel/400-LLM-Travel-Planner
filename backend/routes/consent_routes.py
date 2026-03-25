from flask import Blueprint, request
from services.consent_service import get_consent_status, update_consent_status

consent_bp = Blueprint("consent", __name__)


@consent_bp.route("/consent/<int:user_id>", methods=["GET"])
@consent_bp.route("/api/consent/<int:user_id>", methods=["GET"])
def get_consent(user_id):
    return get_consent_status(user_id)


@consent_bp.route("/consent/<int:user_id>", methods=["PUT"])
@consent_bp.route("/api/consent/<int:user_id>", methods=["PUT"])
def update_consent(user_id):
    payload = request.get_json(silent=True) or {}
    return update_consent_status(user_id, payload)