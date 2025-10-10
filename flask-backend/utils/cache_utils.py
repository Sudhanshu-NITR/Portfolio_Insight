import time

_cache = {}
CACHE_TTL = 300  # 5 minutes

def get_cached_data(key: str):
    """Get cached data if not expired"""
    cached = _cache.get(key)
    if cached and time.time() - cached["timestamp"] < CACHE_TTL:
        return cached["data"]
    return None

def set_cached_data(key: str, data):
    """Cache data with timestamp"""
    _cache[key] = {
        "data": data,
        "timestamp": time.time()
    }