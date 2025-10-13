import requests
from enum import Enum
from datetime import datetime
from config import Config

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
    EPS="EPS"; CPS="CPS"; CPX="CPX"; DPS="DPS"; EBI="EBI"; EBT="EBT"; GPS="GPS"; GRM="GRM"
    NAV="NAV"; NDT="NDT"; NET="NET"; PRE="PRE"; ROA="ROA"; ROE="ROE"; SAL="SAL"

def get_stock_forecasts(stock_id: str, measure_code: str, period_type: str, data_type: str, age: str):
    if not stock_id:
        raise ValueError("stock_id is required")
    if measure_code not in [e.value for e in MeasureCode]: raise ValueError("invalid measure_code")
    if period_type not in [e.value for e in PeriodType]: raise ValueError("invalid period_type")
    if data_type not in [e.value for e in DataType]: raise ValueError("invalid data_type")
    if age not in [e.value for e in DataAge]: raise ValueError("invalid age")
    url = f"{Config.INDIANAPI_BASE}/stock_forecasts"
    headers = {"X-Api-Key": Config.INDIANAPI_KEY}
    params = {"stock_id": stock_id, "measure_code": measure_code, "period_type": period_type, "data_type": data_type, "age": age}
    r = requests.get(url, headers=headers, params=params, timeout=20)
    if r.status_code == 404:
        return {"status": 404, "message": "No forecasts found"}
    r.raise_for_status()
    data = r.json()
    return {"query": params, "data": data.get("data", data), "meta": {"source":"stock.indianapi.in", "retrieved_at": datetime.utcnow().isoformat()+"Z"}}
