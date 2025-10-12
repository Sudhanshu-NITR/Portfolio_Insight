from flask import Blueprint, request, jsonify
from services.forecasts_service import (
    get_stock_forecasts, PeriodType, DataType, DataAge, MeasureCode
)
import requests

stock_forecasts_bp = Blueprint('stock_forecasts', __name__)

@stock_forecasts_bp.route("/market/stock_forecasts", methods=["GET"])
def stock_forecasts():
    stock_id = (request.args.get("stock_id") or "").strip()
    measure_code = (request.args.get("measure_code") or "").strip()
    period_type = (request.args.get("period_type") or "").strip()
    data_type = (request.args.get("data_type") or "").strip()
    age = (request.args.get("age") or "").strip()

    # Early validation mirrors enums
    if not stock_id:
        return jsonify({"error": "stock_id is required"}), 400
    if measure_code not in [e.value for e in MeasureCode]:
        return jsonify({"error": f"measure_code invalid. Allowed: {[e.value for e in MeasureCode]}"}), 400
    if period_type not in [e.value for e in PeriodType]:
        return jsonify({"error": f"period_type invalid. Allowed: {[e.value for e in PeriodType]}"}), 400
    if data_type not in [e.value for e in DataType]:
        return jsonify({"error": f"data_type invalid. Allowed: {[e.value for e in DataType]}"}), 400
    if age not in [e.value for e in DataAge]:
        return jsonify({"error": f"age invalid. Allowed: {[e.value for e in DataAge]}"}), 400

    try:
        out = get_stock_forecasts(stock_id, measure_code, period_type, data_type, age)
        if isinstance(out, dict) and out.get("status") == 404:
            return jsonify({"error": out.get("message", "Not found")}), 404
        return jsonify(out), 200
    except requests.HTTPError as http_err:
        return jsonify({"error": str(http_err)}), 502
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal error: {str(e)}"}), 500
