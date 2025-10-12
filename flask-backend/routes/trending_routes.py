from flask import Blueprint, jsonify
from services.trending_service import get_trending_stocks

trending_bp = Blueprint('trending', __name__)

@trending_bp.route("/market/trending", methods=["GET"])
def trending():
    try:
        out = get_trending_stocks()
        return jsonify(out)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
