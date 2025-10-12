import os
import requests
from enum import Enum
from datetime import datetime

INDIANAPI_BASE = os.environ.get("INDIANAPI_BASE", "https://stock.indianapi.in")
INDIANAPI_KEY = os.environ.get("INDIANAPI_KEY")  # set in env

class PeriodType(str, Enum):
    ANNUAL = "Annual"
    INTERIM = "Interim"

class DataType(str, Enum):
    ACTUALS = "Actuals"
    ESTIMATES = "Estimates"

class DataAge(str, Enum):
    ONE_WEEK_AGO = "OneWeekAgo"
    THIRTY_DAYS_AGO = "ThirtyDaysAgo"
    SIXTY_DAYS_AGO = "SixtyDaysAgo"
    NINETY_DAYS_AGO = "NinetyDaysAgo"
    CURRENT = "Current"

class MeasureCode(str, Enum):
    EPS = "EPS"
    CPS = "CPS"
    CPX = "CPX"
    DPS = "DPS"
    EBI = "EBI"
    EBT = "EBT"
    GPS = "GPS"
    GRM = "GRM"
    NAV = "NAV"
    NDT = "NDT"
    NET = "NET"
    PRE = "PRE"
    ROA = "ROA"
    ROE = "ROE"
    SAL = "SAL"

def _strip_nulls(d):
    if isinstance(d, dict):
        return {k: _strip_nulls(v) for k, v in d.items() if v not in [None, '', [], {}]}
    if isinstance(d, list):
        return [_strip_nulls(x) for x in d if x not in [None, '', [], {}]]
    return d

def _validate_enums(measure_code: str, period_type: str, data_type: str, age: str):
    if measure_code not in [e.value for e in MeasureCode]:
        raise ValueError(f"measure_code invalid. Allowed: {[e.value for e in MeasureCode]}")
    if period_type not in [e.value for e in PeriodType]:
        raise ValueError(f"period_type invalid. Allowed: {[e.value for e in PeriodType]}")
    if data_type not in [e.value for e in DataType]:
        raise ValueError(f"data_type invalid. Allowed: {[e.value for e in DataType]}")
    if age not in [e.value for e in DataAge]:
        raise ValueError(f"age invalid. Allowed: {[e.value for e in DataAge]}")

def get_stock_forecasts(stock_id: str, measure_code: str, period_type: str, data_type: str, age: str):
    if not stock_id or not stock_id.strip():
        raise ValueError("stock_id is required")
    _validate_enums(measure_code, period_type, data_type, age)

    if not INDIANAPI_KEY:
        raise RuntimeError("Missing INDIANAPI_KEY")

    url = f"{INDIANAPI_BASE.rstrip('/')}/stock_forecasts"
    headers = { "X-Api-Key": INDIANAPI_KEY, "Accept": "application/json" }
    params = {
        "stock_id": stock_id.strip(),
        "measure_code": measure_code,
        "period_type": period_type,
        "data_type": data_type,
        "age": age
    }

    r = requests.get(url, headers=headers, params=params, timeout=20)
    # Map upstream status codes to your contract
    if r.status_code == 404:
        return {"status": 404, "message": "No forecasts found for the given parameters."}
    if not r.ok:
        # Provide concise upstream error detail without leaking full body
        raise requests.HTTPError(f"Upstream error {r.status_code}")

    raw = r.json()
    # Provider may return either { data: [...] } or a naked list; normalize
    payload = raw.get("data", raw if isinstance(raw, list) else raw)

    normalized = {
        "query": params,
        "data": payload,
        "meta": {
            "source": "stock.indianapi.in",
            "retrieved_at": datetime.utcnow().isoformat() + "Z"
        }
    }
    return _strip_nulls(normalized)
