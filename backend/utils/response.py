from flask import jsonify


def success_response(message, status_code=200, **data):
    response = {
        "success": True,
        "message": message
    }
    response.update(data)
    return jsonify(response), status_code


def error_response(message, status_code=400, **data):
    response = {
        "success": False,
        "message": message
    }
    response.update(data)
    return jsonify(response), status_code