from pydantic import BaseModel, Field
from typing import List, Optional

class QuotesInput(BaseModel):
    tickers: List[str] = Field(..., description="Symbols like ['RELIANCE','^NSEI']")
    fields: Optional[List[str]] = Field(default=None, description="Fields like ['close','previousClose','volume']")

class RangesInput(BaseModel):
    tickers: List[str]
    window_days: Optional[int] = 252

class IntradayInput(BaseModel):
    tickers: List[str]
    interval: Optional[str] = "5m"
    period: Optional[str] = "5d"

class CorporateInput(BaseModel):
    tickers: List[str]
    include_dividends: Optional[bool] = True
    include_splits: Optional[bool] = True

class TrendingInput(BaseModel):
    exchange: Optional[str] = "NSE"
    limit: Optional[int] = 3

class ForecastsInput(BaseModel):
    stock_id: str
    measure_code: str = "EPS"
    period_type: str = "Annual"
    data_type: str = "Estimates"
    age: str = "Current"
