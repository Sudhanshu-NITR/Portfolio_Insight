"""
Tools package for Portfolio Insight
Exports all available tools for the RAG agent
"""

# Import all individual tool functions
from .market_tools import (
    tool_get_quotes,
    tool_get_price_ranges,
    tool_get_intraday
)

from .analysis_tools import (
    tool_get_corporate_actions,
    tool_get_trending,
    tool_get_stock_forecasts
)

# Import the RAG search tool
from .rag_tool import search_knowledge_base

# Import required LangChain components
from langchain.tools import tool
from pydantic import BaseModel, Field
from typing import List, Optional
import json

# Define enhanced tool schemas
class QuotesInput(BaseModel):
    """Input schema for getting current stock quotes"""
    tickers: List[str] = Field(
        ..., 
        description="List of stock symbols (e.g., ['RELIANCE', 'TCS', '^NSEI']). Use ^NSEI for Nifty, ^BSESN for Sensex"
    )
    fields: Optional[List[str]] = Field(
        default=None,
        description="Specific fields to retrieve: 'close', 'previousClose', 'volume', 'open', 'high', 'low'"
    )

class RangesInput(BaseModel):
    """Input schema for price range analysis"""
    tickers: List[str] = Field(..., description="Stock symbols to analyze")
    window_days: int = Field(
        default=252,
        description="Number of days for range analysis (252=1 year, 126=6 months)"
    )

class IntradayInput(BaseModel):
    """Input schema for intraday price data"""
    tickers: List[str] = Field(..., description="Stock symbols for intraday data")
    interval: str = Field(
        default="5m",
        description="Price interval: '1m', '5m', '15m', or '1d'"
    )
    period: str = Field(
        default="5d",
        description="Time period: '1d', '5d', '1mo', '6mo', '1y'"
    )

class CorporateInput(BaseModel):
    """Input schema for corporate actions"""
    tickers: List[str] = Field(..., description="Stock symbols to check for corporate actions")
    include_dividends: bool = Field(default=True, description="Include dividend history")
    include_splits: bool = Field(default=True, description="Include stock split history")

class TrendingInput(BaseModel):
    """Input schema for trending stocks"""
    exchange: str = Field(default="NSE", description="Exchange: 'NSE' or 'BSE'")
    limit: int = Field(default=3, description="Number of top gainers/losers to return")

class ForecastsInput(BaseModel):
    """Input schema for stock forecasts"""
    stock_id: str = Field(..., description="Stock identifier for forecasts")
    measure_code: str = Field(default="EPS", description="Forecast measure: 'EPS', 'SAL', 'ROE', etc.")
    period_type: str = Field(default="Annual", description="'Annual' or 'Interim'")
    data_type: str = Field(default="Estimates", description="'Estimates' or 'Actuals'")
    age: str = Field(default="Current", description="Data age: 'Current', 'OneWeekAgo', etc.")

# Create enhanced tool definitions
@tool("get_current_quotes", args_schema=QuotesInput)
def get_current_quotes(tickers: List[str], fields: Optional[List[str]] = None) -> str:
    """
    Get real-time stock quotes and key metrics.
    
    Use this for:
    - Current stock prices
    - Previous day closing prices
    - Trading volumes
    - Basic OHLC data
    """
    try:
        result = tool_get_quotes(json.dumps({"tickers": tickers, "fields": fields}))
        return result
    except Exception as e:
        return json.dumps({"error": f"Failed to get quotes: {str(e)}"})

@tool("get_price_ranges", args_schema=RangesInput)
def get_price_ranges(tickers: List[str], window_days: int = 252) -> str:
    """
    Analyze price ranges over a specified time period.
    
    Use this for:
    - 52-week high/low analysis
    - Support and resistance levels
    - Price volatility assessment
    """
    try:
        result = tool_get_price_ranges(json.dumps({"tickers": tickers, "window_days": window_days}))
        return result
    except Exception as e:
        return json.dumps({"error": f"Failed to get price ranges: {str(e)}"})

@tool("get_intraday_data", args_schema=IntradayInput)
def get_intraday_data(tickers: List[str], interval: str = "5m", period: str = "5d") -> str:
    """
    Get detailed intraday price movement data.
    
    Use this for:
    - Recent price trends
    - Intraday volatility analysis
    - Short-term trading patterns
    """
    try:
        result = tool_get_intraday(json.dumps({"tickers": tickers, "interval": interval, "period": period}))
        return result
    except Exception as e:
        return json.dumps({"error": f"Failed to get intraday data: {str(e)}"})

@tool("get_corporate_actions", args_schema=CorporateInput)
def get_corporate_actions(tickers: List[str], include_dividends: bool = True, include_splits: bool = True) -> str:
    """
    Get corporate actions including dividends and stock splits.
    
    Use this for:
    - Dividend history and yields
    - Ex-dividend dates
    - Stock split history
    - Corporate event analysis
    """
    try:
        result = tool_get_corporate_actions(json.dumps({
            "tickers": tickers,
            "include_dividends": include_dividends,
            "include_splits": include_splits
        }))
        return result
    except Exception as e:
        return json.dumps({"error": f"Failed to get corporate actions: {str(e)}"})

@tool("get_trending_stocks", args_schema=TrendingInput)
def get_trending_stocks(exchange: str = "NSE", limit: int = 3) -> str:
    """
    Get top performing and worst performing stocks.
    
    Use this for:
    - Market sentiment analysis
    - Identifying top gainers/losers
    - Market trend analysis
    """
    try:
        result = tool_get_trending(json.dumps({"exchange": exchange, "limit": limit}))
        return result
    except Exception as e:
        return json.dumps({"error": f"Failed to get trending stocks: {str(e)}"})

@tool("get_stock_forecasts", args_schema=ForecastsInput)
def get_stock_forecasts(
    stock_id: str,
    measure_code: str = "EPS",
    period_type: str = "Annual",
    data_type: str = "Estimates",
    age: str = "Current"
) -> str:
    """
    Get analyst forecasts and estimates for stocks.
    
    Use this for:
    - Earnings estimates (EPS)
    - Revenue forecasts
    - Growth projections
    - Analyst consensus data
    """
    try:
        result = tool_get_stock_forecasts(json.dumps({
            "stock_id": stock_id,
            "measure_code": measure_code,
            "period_type": period_type,
            "data_type": data_type,
            "age": age
        }))
        return result
    except Exception as e:
        return json.dumps({"error": f"Failed to get stock forecasts: {str(e)}"})

# Export all tools - THIS IS CRITICAL
ALL_TOOLS = [
    # Market data tools
    get_current_quotes,
    get_price_ranges,
    get_intraday_data,
    get_corporate_actions,
    get_trending_stocks,
    get_stock_forecasts,
    # Knowledge base search tool
    search_knowledge_base,
]

# Make tools available for import
__all__ = ['ALL_TOOLS', 'search_knowledge_base']
