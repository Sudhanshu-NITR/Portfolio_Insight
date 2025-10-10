from flask import Blueprint, request, jsonify
from services.corp_actions_service import get_dividends_and_splits, placeholder_corporate_events_from_news

corp_bp = Blueprint('corp', __name__)

@corp_bp.route("/market/corporate-actions", methods=["POST"])
def corporate_actions():
    data = request.get_json(force=True)
    tickers = data.get("tickers", [])
    if not tickers or not isinstance(tickers, list):
        return jsonify({"error": "Invalid payload"}), 400

    dividends_splits = get_dividends_and_splits(tickers)
    events = placeholder_corporate_events_from_news(tickers)

    merged = {}
    for t in tickers:
        key = t.upper()
        merged[key] = {
            **dividends_splits.get(key, {"symbol": key}),
            "events": events.get(key, {}).get("events", [])
        }

    return jsonify(merged)
