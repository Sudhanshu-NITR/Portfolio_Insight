import json
from services.corporate_actions_service import get_dividends_and_splits as _corp
from services.trending_service import get_trending as _trend
from services.stock_forecasts_service import get_stock_forecasts as _fore

def tool_get_corporate_actions(params_json: str) -> str:
    p = json.loads(params_json or "{}")
    data = _corp(p.get("tickers", []))
    if not p.get("include_dividends", True):
        for k in data:
            data[k].pop("dividends", None)
            data[k].pop("summary", None)
    if not p.get("include_splits", True):
        for k in data:
            data[k].pop("splits", None)
    return json.dumps(data)

def tool_get_trending(params_json: str) -> str:
    p = json.loads(params_json or "{}")
    return json.dumps(_trend(p.get("exchange", "NSE"), p.get("limit", 3)))

def tool_get_stock_forecasts(params_json: str) -> str:
    p = json.loads(params_json or "{}")
    return json.dumps(_fore(
        p.get("stock_id",""),
        p.get("measure_code","EPS"),
        p.get("period_type","Annual"),
        p.get("data_type","Estimates"),
        p.get("age","Current"),
    ))
