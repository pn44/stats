from flask import jsonify

from app.api.errors.exceptions import APIError
from app.api import bp

@bp.errorhandler(APIError)
def http_error(e):
    return jsonify({"type": e.__class__.__name__,
        "message": str(e)}), e.code