import yfinance as yf
import pandas as pd
import time
from utils.ticker_utils import normalize_ticker, extract_ticker_data
from utils.cache_utils import get_cached_data, set_cached_data

class MarketDataService:
    
    @staticmethod
    def get_current_quotes(tickers: list) -> dict:
        """Get current price quotes for tickers"""
        cache_key = f"quotes_{'-'.join(sorted(tickers))}"
        cached = get_cached_data(cache_key)
        if cached:
            return cached
        
        yf_tickers = [normalize_ticker(t) for t in tickers]
        result = {}
        
        try:
            # Get recent data for current prices
            data = yf.download(yf_tickers, period="5d", interval="1d", 
                             threads=True, auto_adjust=True, progress=False)
            
            for orig_ticker in tickers:
                yf_ticker = normalize_ticker(orig_ticker)
                ticker_data = extract_ticker_data(data, yf_ticker)
                
                if not ticker_data.empty:
                    current_price = float(ticker_data['Close'].iloc[-1])
                    prev_close = float(ticker_data['Close'].iloc[-2]) if len(ticker_data) > 1 else current_price
                    change = current_price - prev_close
                    change_pct = (change / prev_close * 100) if prev_close != 0 else 0
                    
                    result[orig_ticker.upper()] = {
                        "symbol": orig_ticker.upper(),
                        "current_price": current_price,
                        "previous_close": prev_close,
                        "change": change,
                        "change_percent": change_pct,
                        "volume": float(ticker_data['Volume'].iloc[-1]) if 'Volume' in ticker_data else None,
                        "timestamp": time.time()
                    }
                else:
                    result[orig_ticker.upper()] = {"error": "No data available"}
        
        except Exception as e:
            return {"error": f"Failed to fetch quotes: {str(e)}"}
        
        set_cached_data(cache_key, result)
        return result
    
    @staticmethod
    def get_historical_data(tickers: list, period: str = "1y", interval: str = "1d") -> dict:
        """Get historical OHLCV data"""
        cache_key = f"historical_{'-'.join(sorted(tickers))}_{period}_{interval}"
        cached = get_cached_data(cache_key)
        if cached:
            return cached
        
        yf_tickers = [normalize_ticker(t) for t in tickers]
        result = {}
        
        try:
            data = yf.download(yf_tickers, period=period, interval=interval,
                             threads=True, auto_adjust=True, progress=False)
            
            for orig_ticker in tickers:
                yf_ticker = normalize_ticker(orig_ticker)
                ticker_data = extract_ticker_data(data, yf_ticker)
                
                result[orig_ticker.upper()] = {
                    "symbol": orig_ticker.upper(),
                    "period": period,
                    "interval": interval,
                    "data": ticker_data.reset_index().to_dict(orient="records") if not ticker_data.empty else [],
                    "data_points": len(ticker_data),
                    "timestamp": time.time()
                }
        
        except Exception as e:
            return {"error": f"Failed to fetch historical data: {str(e)}"}
        
        set_cached_data(cache_key, result)
        return result
    
    @staticmethod
    def get_intraday_data(tickers: list, period: str = "1d", interval: str = "5m") -> dict:
        """Get intraday OHLCV data"""
        cache_key = f"intraday_{'-'.join(sorted(tickers))}_{period}_{interval}"
        cached = get_cached_data(cache_key)
        if cached:
            return cached
        
        yf_tickers = [normalize_ticker(t) for t in tickers]
        result = {}
        
        try:
            data = yf.download(yf_tickers, period=period, interval=interval,
                             threads=True, auto_adjust=True, progress=False)
            
            for orig_ticker in tickers:
                yf_ticker = normalize_ticker(orig_ticker)
                ticker_data = extract_ticker_data(data, yf_ticker)
                
                result[orig_ticker.upper()] = {
                    "symbol": orig_ticker.upper(),
                    "period": period,
                    "interval": interval,
                    "data": ticker_data.reset_index().to_dict(orient="records") if not ticker_data.empty else [],
                    "timestamp": time.time()
                }
        
        except Exception as e:
            return {"error": f"Failed to fetch intraday data: {str(e)}"}
        
        set_cached_data(cache_key, result)
        return result