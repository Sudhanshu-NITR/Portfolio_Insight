from flask import Blueprint, request, jsonify
from tools.market_tools import tool_get_quotes, tool_get_price_ranges, tool_get_intraday
from tools.analysis_tools import tool_get_corporate_actions, tool_get_trending, tool_get_stock_forecasts
import json

tools_bp = Blueprint("tools", __name__)

@tools_bp.route("/tools/quotes", methods=["POST"])
def tools_quotes():
    payload = request.get_json(force=True)
    return jsonify(json.loads(tool_get_quotes(json.dumps(payload or {}))))

@tools_bp.route("/tools/ranges", methods=["POST"])
def tools_ranges():
    payload = request.get_json(force=True)
    return jsonify(json.loads(tool_get_price_ranges(json.dumps(payload or {}))))

@tools_bp.route("/tools/intraday", methods=["POST"])
def tools_intraday():
    payload = request.get_json(force=True)
    return jsonify(json.loads(tool_get_intraday(json.dumps(payload or {}))))

@tools_bp.route("/tools/corporate-actions", methods=["POST"])
def tools_corporate_actions():
    payload = request.get_json(force=True)
    return jsonify(json.loads(tool_get_corporate_actions(json.dumps(payload or {}))))

@tools_bp.route("/tools/trending", methods=["GET"])
def tools_trending():
    return jsonify(json.loads(tool_get_trending("{}")))

@tools_bp.route("/tools/stock-forecasts", methods=["GET"])
def tools_stock_forecasts():
    p = {
        "stock_id": request.args.get("stock_id",""),
        "measure_code": request.args.get("measure_code","EPS"),
        "period_type": request.args.get("period_type","Annual"),
        "data_type": request.args.get("data_type","Estimates"),
        "age": request.args.get("age","Current")
    }
    return jsonify(json.loads(tool_get_stock_forecasts(json.dumps(p))))

@tools_bp.route("/admin/cache/clear", methods=["POST"])
def admin_cache_clear():
    from utils.cache_utils import clear_cache
    clear_cache()
    return {"status": "cleared"}
