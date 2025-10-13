import requests
from config import Config
from utils.cache_utils import get_cached, set_cached

def _strip_nulls(obj):
    if isinstance(obj, dict):
        return {k: _strip_nulls(v) for k, v in obj.items() if v not in [None, '', [], {}]}
    if isinstance(obj, list):
        return [_strip_nulls(x) for x in obj if x not in [None, '', [], {}]]
    return obj

def get_trending(exchange: str = "NSE", limit: int = 3) -> dict:
    params = {"exchange": exchange, "limit": limit}
    cached = get_cached("trending", params, 300)
    if cached:
        return cached
    url = f"{Config.INDIANAPI_BASE}/trending"
    headers = {"X-Api-Key": Config.INDIANAPI_KEY}
    r = requests.get(url, headers=headers, timeout=15)
    r.raise_for_status()
    data = r.json()
    if "trending_stocks" in data:
        data["trending_stocks"]["top_gainers"] = data["trending_stocks"].get("top_gainers", [])[:limit]
        data["trending_stocks"]["top_losers"] = data["trending_stocks"].get("top_losers", [])[:limit]
    cleaned = _strip_nulls(data)
    set_cached("trending", params, cleaned, 300)
    return cleaned
