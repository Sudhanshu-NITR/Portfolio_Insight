import time
from typing import Any, Optional

_cache: dict[str, dict] = {}

def _key(prefix: str, params: dict) -> str:
    items = sorted(params.items())
    return prefix + ":" + "&".join([f"{k}={v}" for k, v in items])

def get_cached(prefix: str, params: dict, ttl: int) -> Optional[Any]:
    key = _key(prefix, params)
    entry = _cache.get(key)
    if not entry:
        return None
    if time.time() - entry["ts"] < ttl:
        return entry["data"]
    return None

def set_cached(prefix: str, params: dict, data: Any, ttl: int):
    key = _key(prefix, params)
    _cache[key] = {"ts": time.time(), "ttl": ttl, "data": data}

def clear_cache(prefix: str | None = None):
    if not prefix:
        _cache.clear()
        return
    for k in list(_cache.keys()):
        if k.startswith(prefix + ":"):
            _cache.pop(k, None)
