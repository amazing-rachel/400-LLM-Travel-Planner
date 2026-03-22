from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from database.db import init_db
from routes.auth_routes import auth_bp
from routes.consent_routes import consent_bp
from routes.itinerary_routes import itinerary_bp
from routes.admin_routes import admin_bp

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "allow_headers": ["Content-Type", "Authorization", "X-User-Id"],
        }
    },
    supports_credentials=True,
)

app.register_blueprint(auth_bp)
app.register_blueprint(consent_bp)
app.register_blueprint(itinerary_bp)
app.register_blueprint(admin_bp)

PORT = int(os.getenv("PORT", 5000))
DEBUG = os.getenv("FLASK_ENV", "development") == "development"


@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "success": True,
        "status": "ok",
        "message": "Backend is running"
    }), 200


if __name__ == "__main__":
    init_db()
    app.run(debug=DEBUG, port=PORT)