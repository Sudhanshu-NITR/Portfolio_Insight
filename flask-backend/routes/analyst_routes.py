# routes/analyst_routes.py
from flask import Blueprint, request, jsonify
from services.analyst_service import get_ratings_trend, get_price_target_stub, get_estimates_stub

analyst_bp = Blueprint('analyst', __name__)

@analyst_bp.route("/market/analyst/summary", methods=["POST"])
def analyst_summary():
    data = request.get_json(force=True)
    tickers = data.get("tickers", [])
    if not tickers or not isinstance(tickers, list):
        return jsonify({"error": "Invalid payload"}), 400

    ratings = get_ratings_trend(tickers)
    targets = get_price_target_stub(tickers)
    estimates = get_estimates_stub(tickers)
    merged = {}
    for t in tickers:
        k = t.upper()
        merged[k] = {
            **ratings.get(k, {"symbol": k}),
            **targets.get(k, {}),
            **estimates.get(k, {}),
        }
    return jsonify(merged)
