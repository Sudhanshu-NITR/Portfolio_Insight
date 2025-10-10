from services.market_data_service import MarketDataService
from utils.cache_utils import get_cached_data, set_cached_data

class BenchmarkService:
    
    MAJOR_INDICES = {
        "NIFTY50": "^NSEI",
        "SENSEX": "^BSESN",
        "NIFTY_IT": "^CNXIT",
        "NIFTY_BANK": "^NSEBANK"
    }
    
    @staticmethod
    def get_benchmark_data(benchmarks: list = None) -> dict:
        """Get data for major benchmark indices"""
        if benchmarks is None:
            benchmarks = list(BenchmarkService.MAJOR_INDICES.keys())
        
        cache_key = f"benchmarks_{'-'.join(sorted(benchmarks))}"
        cached = get_cached_data(cache_key)
        if cached:
            return cached
        
        yf_symbols = [BenchmarkService.MAJOR_INDICES.get(b, b) for b in benchmarks]
        quotes = MarketDataService.get_current_quotes(yf_symbols)
        
        result = {}
        for i, benchmark in enumerate(benchmarks):
            yf_symbol = yf_symbols[i]
            if yf_symbol.upper() in quotes:
                result[benchmark] = quotes[yf_symbol.upper()]
                result[benchmark]["benchmark_name"] = benchmark
        
        set_cached_data(cache_key, result)
        return result
    
    @staticmethod
    def compare_with_benchmarks(ticker_data: dict, benchmarks: list = None) -> dict:
        """Compare ticker performance with benchmarks"""
        if benchmarks is None:
            benchmarks = ["NIFTY50", "SENSEX"]
        
        benchmark_data = BenchmarkService.get_benchmark_data(benchmarks)
        
        result = {}
        for ticker, data in ticker_data.items():
            if "change_percent" in data:
                comparisons = {}
                for benchmark in benchmarks:
                    if benchmark in benchmark_data and "change_percent" in benchmark_data[benchmark]:
                        ticker_change = data["change_percent"]
                        benchmark_change = benchmark_data[benchmark]["change_percent"]
                        comparisons[benchmark] = {
                            "outperformance": ticker_change - benchmark_change,
                            "ticker_change": ticker_change,
                            "benchmark_change": benchmark_change
                        }
                
                result[ticker] = {
                    "symbol": ticker,
                    "benchmarks": comparisons
                }
        
        return result