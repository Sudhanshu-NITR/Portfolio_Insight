from flask import Blueprint, request, jsonify
from services.market_data_service import get_quotes, get_price_ranges, get_intraday
from services.corporate_actions_service import get_dividends_and_splits
from services.analyst_service import get_analyst_summary
from services.pricemap_service import get_detailed_pricemap



market_bp = Blueprint("market", __name__)

@market_bp.route("/market/quotes/get-pricemap", methods=["POST"])
def get_pricemap_route():
    data = request.get_json(force=True)
    tickers = data.get("tickers", [])
    if not tickers or not isinstance(tickers, list):
        return jsonify({"error": "Invalid payload"}), 400
    result = get_detailed_pricemap(tickers)
    return jsonify(result)


@market_bp.route("/market/quotes", methods=["POST"])
def market_quotes():
    data = request.get_json(force=True)
    tickers = data.get("tickers", [])
    fields = data.get("fields", None)
    if not tickers: return jsonify({"error":"tickers required"}), 400
    return jsonify(get_quotes(tickers, fields))

@market_bp.route("/market/price_ranges", methods=["POST"])
def market_ranges():
    data = request.get_json(force=True)
    tickers = data.get("tickers", [])
    window_days = data.get("window_days", 252)
    return jsonify(get_price_ranges(tickers, window_days))

@market_bp.route("/market/intraday", methods=["POST"])
def market_intraday():
    data = request.get_json(force=True)
    tickers = data.get("tickers", [])
    interval = data.get("interval", "5m")
    period = data.get("period", "5d")
    return jsonify(get_intraday(tickers, interval, period))

@market_bp.route("/market/corporate-actions", methods=["POST"])
def market_corporate_actions():
    data = request.get_json(force=True)
    tickers = data.get("tickers", [])
    return jsonify(get_dividends_and_splits(tickers))

@market_bp.route("/market/analyst/summary", methods=["POST"])
def market_analyst():
    data = request.get_json(force=True)
    tickers = data.get("tickers", [])
    return jsonify(get_analyst_summary(tickers))
