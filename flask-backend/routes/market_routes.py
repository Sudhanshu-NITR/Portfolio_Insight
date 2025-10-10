from flask import Blueprint, request, jsonify
from services.comprehensive_service import ComprehensiveMarketService
from services.market_data_service import MarketDataService
from services.fundamental_service import FundamentalService
from services.technical_service import TechnicalService
from services.benchmark_service import BenchmarkService
from services.quotes_service import fetch_quotes_payload

market_bp = Blueprint('market', __name__)

@market_bp.route("/market/comprehensive", methods=["POST"])
def comprehensive_market_data():
    data = request.get_json(force=True)
    tickers = data.get("tickers", [])
    include_intraday = data.get("include_intraday", True)
    include_fundamentals = data.get("include_fundamentals", True)
    
    if not tickers:
        return jsonify({"error": "No tickers provided"}), 400
    
    result = ComprehensiveMarketService.get_full_analysis(
        tickers, include_intraday, include_fundamentals
    )
    
    return jsonify(result)

from flask import Blueprint, request, jsonify
from services.quotes_service import fetch_quotes_payload

market_bp = Blueprint('market', __name__)

@market_bp.route("/market/quotes", methods=["POST"])
def market_quotes():
    data = request.get_json(force=True)
    tickers = data.get("tickers", [])
    if not tickers or not isinstance(tickers, list):
        return jsonify({"error": "Invalid payload"}), 400
    return jsonify(fetch_quotes_payload(tickers))


@market_bp.route("/market/technical/ranges", methods=["POST"])
def get_price_ranges():
    data = request.get_json(force=True)
    tickers = data.get("tickers", [])
    return jsonify(TechnicalService.get_price_ranges(tickers))

@market_bp.route("/market/fundamental/ratios", methods=["POST"])
def get_ratios():
    data = request.get_json(force=True)
    tickers = data.get("tickers", [])
    return jsonify(FundamentalService.get_financial_ratios(tickers))