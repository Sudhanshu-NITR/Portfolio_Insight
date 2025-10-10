import time
from services.market_data_service import MarketDataService
from services.fundamental_service import FundamentalService
from services.technical_service import TechnicalService
from services.benchmark_service import BenchmarkService

class ComprehensiveMarketService:
    
    @staticmethod
    def get_full_analysis(tickers: list, include_intraday: bool = True, include_fundamentals: bool = True) -> dict:
        """Get comprehensive analysis combining all services"""
        result = {
            "tickers": tickers,
            "quotes": {},
            "historical": {},
            "intraday": {},
            "fundamentals": {},
            "technical": {},
            "benchmarks": {},
            "timestamp": time.time()
        }
        
        try:
            # 1. Current quotes
            result["quotes"] = MarketDataService.get_current_quotes(tickers)
            
            # 2. Historical data
            result["historical"] = MarketDataService.get_historical_data(tickers, period="1y")
            
            # 3. Intraday data (if requested)
            if include_intraday:
                result["intraday"] = {
                    "5m": MarketDataService.get_intraday_data(tickers, period="5d", interval="5m"),
                    "1m": MarketDataService.get_intraday_data(tickers, period="2d", interval="1m")
                }
            
            # 4. Fundamental data (if requested)
            if include_fundamentals:
                result["fundamentals"] = {
                    "company_info": FundamentalService.get_company_info(tickers),
                    "ratios": FundamentalService.get_financial_ratios(tickers),
                    "dividends": FundamentalService.get_dividend_info(tickers)
                }
            
            # 5. Technical analysis
            result["technical"] = {
                "price_ranges": TechnicalService.get_price_ranges(tickers),
                "moving_averages": TechnicalService.get_moving_averages(tickers),
                "volatility": TechnicalService.get_volatility_metrics(tickers)
            }
            
            # 6. Benchmark comparison
            result["benchmarks"] = {
                "data": BenchmarkService.get_benchmark_data(),
                "comparison": BenchmarkService.compare_with_benchmarks(result["quotes"])
            }
            
        except Exception as e:
            result["error"] = str(e)
        
        return result