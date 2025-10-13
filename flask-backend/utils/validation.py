ALLOWED_FIELDS = {"close","previousClose","open","high","low","volume"}
ALLOWED_INTERVALS = {"1m","5m","15m","1d"}
ALLOWED_PERIODS = {"1d","5d","1mo","6mo","1y"}

def validate_fields(fields: list[str]) -> list[str]:
    return [f for f in fields if f in ALLOWED_FIELDS]

def clamp_window_days(n: int) -> int:
    try:
        n = int(n)
    except Exception:
        return 252
    return max(1, min(1095, n))

def validate_interval(i: str) -> str:
    return i if i in ALLOWED_INTERVALS else "5m"

def validate_period(p: str) -> str:
    return p if p in ALLOWED_PERIODS else "5d"
