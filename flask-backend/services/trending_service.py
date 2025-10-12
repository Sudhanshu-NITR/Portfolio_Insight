import requests
import os

def strip_nulls(d):
    if isinstance(d, dict):
        return {k: strip_nulls(v) for k, v in d.items() if v not in [None, '', [], {}]}
    if isinstance(d, list):
        return [strip_nulls(x) for x in d if x not in [None, '', [], {}]]
    return d

def map_stock(stock):
    # Map the source fields to output schema and coerce to string
    def s(val): return str(val) if val is not None else ''
    return {
        "ticker_id": s(stock.get('ticker_id') or stock.get('symbol')),
        "company_name": s(stock.get('company_name') or stock.get('name')),
        "price": s(stock.get('price')),
        "percent_change": s(stock.get('percent_change') or stock.get('change_percent')),
        "net_change": s(stock.get('net_change') or stock.get('change')),
        "bid": s(stock.get('bid')),
        "ask": s(stock.get('ask')),
        "high": s(stock.get('high')),
        "low": s(stock.get('low')),
        "open": s(stock.get('open')),
        "low_circuit_limit": s(stock.get('low_circuit_limit')),
        "up_circuit_limit": s(stock.get('up_circuit_limit')),
        "volume": s(stock.get('volume')),
        "date": s(stock.get('date')),
        "time": s(stock.get('time')),
        "close": s(stock.get('close')),
        "bid_size": s(stock.get('bid_size')),
        "ask_size": s(stock.get('ask_size')),
        "average_price": s(stock.get('average_price')),
        "exchange_type": s(stock.get('exchange_type')),
        "lot_size": s(stock.get('lot_size')),
        "average_volume": s(stock.get('average_volume')),
        "deviation": s(stock.get('deviation')),
        "actual_deviation": s(stock.get('actual_deviation')),
        "no_of_days_for_average": s(stock.get('no_of_days_for_average')),
        "overall_rating": s(stock.get('overall_rating')),
        "short_term_trends": s(stock.get('short_term_trends')),
        "long_term_trends": s(stock.get('long_term_trends')),
        "year_low": s(stock.get('year_low')),
        "year_high": s(stock.get('year_high')),
        "ric": s(stock.get('ric')),
    }

def get_trending_stocks():
    api_key = os.environ.get("INDIANAPI_KEY")
    url = "https://stock.indianapi.in/trending"
    headers = { "X-Api-Key": api_key }
    resp = requests.get(url, headers=headers, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    
    if not isinstance(data, dict) or "trending_stocks" not in data:
        raise RuntimeError('Unexpected API response format')
    
    top_gainers = data["trending_stocks"].get("top_gainers", [])[:3]
    top_losers = data["trending_stocks"].get("top_losers", [])[:3]
    gainers = [map_stock(s) for s in top_gainers]
    losers = [map_stock(s) for s in top_losers]
    return strip_nulls({
        "trending_stocks": {
            "top_gainers": gainers,
            "top_losers": losers
        }
    })
