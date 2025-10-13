import json
from services.market_data_service import get_quotes as _q, get_price_ranges as _r, get_intraday as _i

def tool_get_quotes(params_json: str) -> str:
    p = json.loads(params_json or "{}")
    return json.dumps(_q(p.get("tickers", []), p.get("fields")))

def tool_get_price_ranges(params_json: str) -> str:
    p = json.loads(params_json or "{}")
    return json.dumps(_r(p.get("tickers", []), p.get("window_days", 252)))

def tool_get_intraday(params_json: str) -> str:
    p = json.loads(params_json or "{}")
    return json.dumps(_i(p.get("tickers", []), p.get("interval", "5m"), p.get("period", "5d")))
