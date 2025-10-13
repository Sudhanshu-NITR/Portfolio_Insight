from langchain.tools import tool
import json
from .market_tools import tool_get_quotes, tool_get_price_ranges, tool_get_intraday
from .analysis_tools import tool_get_corporate_actions, tool_get_trending, tool_get_stock_forecasts
from .schemas import QuotesInput, RangesInput, IntradayInput, CorporateInput, TrendingInput, ForecastsInput

@tool("get_current_quotes", args_schema=QuotesInput)
def get_current_quotes(tickers: list[str], fields: list[str] | None = None) -> str:
    """Get current stock quotes for given tickers."""
    return tool_get_quotes(json.dumps({"tickers": tickers, "fields": fields}))

@tool("get_price_ranges", args_schema=RangesInput)
def get_price_ranges(tickers: list[str], window_days: int = 252) -> str:
    """Get high/low/current for a window of days."""
    return tool_get_price_ranges(json.dumps({"tickers": tickers, "window_days": window_days}))

@tool("get_intraday_data", args_schema=IntradayInput)
def get_intraday_data(tickers: list[str], interval: str = "5m", period: str = "5d") -> str:
    """Get intraday candles for tickers."""
    return tool_get_intraday(json.dumps({"tickers": tickers, "interval": interval, "period": period}))

@tool("get_corporate_actions", args_schema=CorporateInput)
def get_corporate_actions(tickers: list[str], include_dividends: bool = True, include_splits: bool = True) -> str:
    """Get dividends and splits for tickers."""
    return tool_get_corporate_actions(json.dumps({"tickers": tickers, "include_dividends": include_dividends, "include_splits": include_splits}))

@tool("get_trending_stocks", args_schema=TrendingInput)
def get_trending_stocks(exchange: str = "NSE", limit: int = 3) -> str:
    """Get top gainers/losers for an exchange."""
    return tool_get_trending(json.dumps({"exchange": exchange, "limit": limit}))

@tool("get_stock_forecasts", args_schema=ForecastsInput)
def get_stock_forecasts(stock_id: str, measure_code: str = "EPS", period_type: str = "Annual", data_type: str = "Estimates", age: str = "Current") -> str:
    """Get forecasts/estimates for a stock."""
    return tool_get_stock_forecasts(json.dumps({
        "stock_id": stock_id,
        "measure_code": measure_code,
        "period_type": period_type,
        "data_type": data_type,
        "age": age
    }))

ALL_TOOLS = [
    get_current_quotes,
    get_price_ranges,
    get_intraday_data,
    get_corporate_actions,
    get_trending_stocks,
    get_stock_forecasts,
]
