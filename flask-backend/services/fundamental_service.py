import yfinance as yf
from utils.ticker_utils import normalize_ticker
from utils.cache_utils import get_cached_data, set_cached_data

class FundamentalService:
    
    @staticmethod
    def get_company_info(tickers: list) -> dict:
        """Get basic company information"""
        cache_key = f"company_info_{'-'.join(sorted(tickers))}"
        cached = get_cached_data(cache_key)
        if cached:
            return cached
        
        result = {}
        
        for orig_ticker in tickers:
            yf_ticker = normalize_ticker(orig_ticker)
            
            try:
                ticker_obj = yf.Ticker(yf_ticker)
                info = ticker_obj.info
                
                result[orig_ticker.upper()] = {
                    "symbol": orig_ticker.upper(),
                    "company_name": info.get('longName') or info.get('shortName'),
                    "sector": info.get('sector'),
                    "industry": info.get('industry'),
                    "exchange": info.get('exchange'),
                    "currency": info.get('currency', 'INR'),
                    "market_cap": info.get('marketCap'),
                    "employees": info.get('fullTimeEmployees'),
                    "website": info.get('website'),
                    "business_summary": info.get('businessSummary')
                }
            
            except Exception as e:
                result[orig_ticker.upper()] = {"error": f"Failed to get info: {str(e)}"}
        
        set_cached_data(cache_key, result)
        return result
    
    @staticmethod
    def get_financial_ratios(tickers: list) -> dict:
        """Get key financial ratios"""
        cache_key = f"ratios_{'-'.join(sorted(tickers))}"
        cached = get_cached_data(cache_key)
        if cached:
            return cached
        
        result = {}
        
        for orig_ticker in tickers:
            yf_ticker = normalize_ticker(orig_ticker)
            
            try:
                ticker_obj = yf.Ticker(yf_ticker)
                info = ticker_obj.info
                
                result[orig_ticker.upper()] = {
                    "symbol": orig_ticker.upper(),
                    "pe_ratio": info.get('trailingPE'),
                    "forward_pe": info.get('forwardPE'),
                    "pb_ratio": info.get('priceToBook'),
                    "debt_to_equity": info.get('debtToEquity'),
                    "roe": info.get('returnOnEquity'),
                    "roa": info.get('returnOnAssets'),
                    "profit_margin": info.get('profitMargins'),
                    "operating_margin": info.get('operatingMargins'),
                    "current_ratio": info.get('currentRatio'),
                    "quick_ratio": info.get('quickRatio')
                }
            
            except Exception as e:
                result[orig_ticker.upper()] = {"error": f"Failed to get ratios: {str(e)}"}
        
        set_cached_data(cache_key, result)
        return result
    
    @staticmethod
    def get_dividend_info(tickers: list) -> dict:
        """Get dividend information"""
        cache_key = f"dividends_{'-'.join(sorted(tickers))}"
        cached = get_cached_data(cache_key)
        if cached:
            return cached
        
        result = {}
        
        for orig_ticker in tickers:
            yf_ticker = normalize_ticker(orig_ticker)
            
            try:
                ticker_obj = yf.Ticker(yf_ticker)
                info = ticker_obj.info
                dividends = ticker_obj.dividends
                
                result[orig_ticker.upper()] = {
                    "symbol": orig_ticker.upper(),
                    "dividend_yield": info.get('dividendYield'),
                    "dividend_rate": info.get('dividendRate'),
                    "payout_ratio": info.get('payoutRatio'),
                    "ex_dividend_date": info.get('exDividendDate'),
                    "dividend_date": info.get('dividendDate'),
                    "five_year_avg_yield": info.get('fiveYearAvgDividendYield'),
                    "recent_dividends": dividends.tail(10).to_dict() if not dividends.empty else {}
                }
            
            except Exception as e:
                result[orig_ticker.upper()] = {"error": f"Failed to get dividend info: {str(e)}"}
        
        set_cached_data(cache_key, result)
        return result