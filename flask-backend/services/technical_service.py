import pandas as pd
from typing import List, Dict, Any, Optional
from services.market_data_service import MarketDataService
from utils.cache_utils import get_cached_data, set_cached_data
import math
import logging

logger = logging.getLogger(__name__)


class TechnicalService:
    @staticmethod
    def _normalize_df(df: pd.DataFrame) -> pd.DataFrame:
        """Ensure columns are numeric and drop rows without a Close."""
        # Make a copy to avoid mutating outside
        df = df.copy()
        # Normalize column names (Common variations: 'Close' or 'close')
        df.columns = [col.capitalize() for col in df.columns]
        # Convert relevant columns to numeric, coerce errors to NaN
        for col in ("Open", "High", "Low", "Close", "Volume"):
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
        # Drop rows with NaN Close
        df = df.dropna(subset=["Close"])
        return df

    @staticmethod
    def get_price_ranges(tickers: List[str]) -> Dict[str, Any]:
        """Get 52-week high/low and other price ranges for given tickers."""
        tickers_up = [t.upper() for t in tickers]
        cache_key = f"price_ranges_{'-'.join(sorted(tickers_up))}"
        cached = get_cached_data(cache_key)
        if cached:
            return cached

        try:
            historical_data = MarketDataService.get_historical_data(tickers_up, period="1y", interval="1d")
        except Exception as e:
            logger.exception("MarketDataService.get_historical_data failed")
            return {t: {"error": f"Market data fetch failed: {e}"} for t in tickers_up}

        result: Dict[str, Any] = {}

        for ticker in tickers_up:
            if ticker in historical_data and "data" in historical_data[ticker]:
                raw = pd.DataFrame(historical_data[ticker]["data"])
                data = TechnicalService._normalize_df(raw)

                if data.empty or "High" not in data.columns or "Low" not in data.columns or "Close" not in data.columns:
                    result[ticker] = {"error": "Insufficient data for price ranges"}
                    continue

                # ensure enough rows
                if len(data) < 1:
                    result[ticker] = {"error": "No price rows available"}
                    continue

                current_price = float(data["Close"].iloc[-1])
                high_52 = float(data["High"].max())
                low_52 = float(data["Low"].min())

                # tail(30) might return fewer rows if not enough history; handle gracefully
                last_30 = data.tail(30)
                thirty_high = float(last_30["High"].max()) if not last_30.empty else None
                thirty_low = float(last_30["Low"].min()) if not last_30.empty else None

                # distances: guard division by zero
                def perc_distance(current: float, reference: Optional[float]) -> Optional[float]:
                    if reference is None or reference == 0 or math.isnan(reference):
                        return None
                    return (current - reference) / reference * 100.0

                result[ticker] = {
                    "symbol": ticker,
                    "data_points": int(len(data)),
                    "current_price": current_price,
                    "fifty_two_week_high": high_52,
                    "fifty_two_week_low": low_52,
                    "thirty_day_high": thirty_high,
                    "thirty_day_low": thirty_low,
                    "distance_from_52w_high_pct": perc_distance(current_price, high_52),
                    "distance_from_52w_low_pct": perc_distance(current_price, low_52),
                }
            else:
                result[ticker] = {"error": "No historical data available"}

        set_cached_data(cache_key, result)
        return result

    @staticmethod
    def get_moving_averages(tickers: List[str], periods: List[int] = [20, 50, 200]) -> Dict[str, Any]:
        """Calculate simple moving averages (SMA) for given periods and tickers."""
        tickers_up = [t.upper() for t in tickers]
        cache_key = f"sma_{'-'.join(sorted(tickers_up))}_{'-'.join(map(str, periods))}"
        cached = get_cached_data(cache_key)
        if cached:
            return cached

        try:
            historical_data = MarketDataService.get_historical_data(tickers_up, period="1y", interval="1d")
        except Exception as e:
            logger.exception("MarketDataService.get_historical_data failed")
            return {t: {"error": f"Market data fetch failed: {e}"} for t in tickers_up}

        result: Dict[str, Any] = {}

        for ticker in tickers_up:
            if ticker in historical_data and "data" in historical_data[ticker]:
                raw = pd.DataFrame(historical_data[ticker]["data"])
                data = TechnicalService._normalize_df(raw)

                if data.empty or "Close" not in data.columns:
                    result[ticker] = {"error": "Insufficient data for moving averages"}
                    continue

                closes = data["Close"]
                current_price = float(closes.iloc[-1])
                sma_data: Dict[str, Any] = {"symbol": ticker, "data_points": int(len(closes)), "current_price": current_price}

                for period in periods:
                    key_sma = f"sma_{period}"
                    key_sig = f"sma_{period}_signal"

                    if len(closes) >= period:
                        sma_val = float(closes.rolling(window=period).mean().iloc[-1])
                        # signal: above/below/equal
                        if current_price > sma_val:
                            sig = "above"
                        elif current_price < sma_val:
                            sig = "below"
                        else:
                            sig = "equal"

                        sma_data[key_sma] = sma_val
                        sma_data[key_sig] = sig
                    else:
                        sma_data[key_sma] = None
                        sma_data[key_sig] = None

                result[ticker] = sma_data
            else:
                result[ticker] = {"error": "No historical data available"}

        set_cached_data(cache_key, result)
        return result

    @staticmethod
    def get_volatility_metrics(tickers: List[str]) -> Dict[str, Any]:
        """Calculate volatility and risk metrics for tickers."""
        tickers_up = [t.upper() for t in tickers]
        cache_key = f"volatility_{'-'.join(sorted(tickers_up))}"
        cached = get_cached_data(cache_key)
        if cached:
            return cached

        try:
            historical_data = MarketDataService.get_historical_data(tickers_up, period="1y", interval="1d")
        except Exception as e:
            logger.exception("MarketDataService.get_historical_data failed")
            return {t: {"error": f"Market data fetch failed: {e}"} for t in tickers_up}

        result: Dict[str, Any] = {}

        for ticker in tickers_up:
            if ticker in historical_data and "data" in historical_data[ticker]:
                raw = pd.DataFrame(historical_data[ticker]["data"])
                data = TechnicalService._normalize_df(raw)

                if data.empty or "Close" not in data.columns:
                    result[ticker] = {"error": "Insufficient data for volatility metrics"}
                    continue

                closes = data["Close"]
                # daily returns, dropna
                returns = closes.pct_change().dropna()
                if returns.empty:
                    result[ticker] = {"error": "Not enough data to compute returns"}
                    continue

                daily_vol = float(returns.std())
                annualized_vol = float(daily_vol * (252 ** 0.5))
                vol_30d = float(returns.tail(30).std()) if len(returns) >= 1 else None

                # max drawdown
                max_dd = TechnicalService._calculate_max_drawdown(closes)
                # sharpe: provide both daily and annualized (assumes risk_free_rate is annual)
                sharpe_daily, sharpe_annual = TechnicalService._calculate_sharpe_ratio(returns)

                result[ticker] = {
                    "symbol": ticker,
                    "data_points": int(len(closes)),
                    "daily_volatility": daily_vol,
                    "annualized_volatility": annualized_vol,
                    "volatility_30d": vol_30d,
                    "max_drawdown": max_dd,
                    "sharpe_ratio_daily": sharpe_daily,
                    "sharpe_ratio_annual": sharpe_annual,
                    "var_95": float(returns.quantile(0.05)),
                }
            else:
                result[ticker] = {"error": "No historical data available"}

        set_cached_data(cache_key, result)
        return result

    @staticmethod
    def _calculate_max_drawdown(prices: pd.Series) -> Optional[float]:
        """Calculate maximum drawdown (as negative fraction). Returns a float (e.g. -0.25) or None."""
        try:
            # ensure numeric and drop NaN
            prices = pd.to_numeric(prices, errors="coerce").dropna()
            if prices.empty:
                return None
            peak = prices.cummax()
            drawdown = (prices - peak) / peak
            min_dd = float(drawdown.min())
            return min_dd  # negative number
        except Exception:
            logger.exception("Error calculating max drawdown")
            return None

    @staticmethod
    def _calculate_sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.06) -> tuple[Optional[float], Optional[float]]:
        """
        Calculate daily and annualized Sharpe ratio.
        risk_free_rate: annual risk-free rate (e.g. 0.06 for 6%).
        Returns (sharpe_daily, sharpe_annual)
        """
        try:
            # ensure numeric
            returns = pd.to_numeric(returns, errors="coerce").dropna()
            if returns.empty:
                return None, None
            # daily risk-free
            rf_daily = risk_free_rate / 252.0
            excess = returns - rf_daily
            std = excess.std()
            if std == 0 or pd.isna(std):
                return None, None
            sharpe_daily = float(excess.mean() / std)
            sharpe_annual = float(sharpe_daily * (252 ** 0.5))
            return sharpe_daily, sharpe_annual
        except Exception:
            logger.exception("Error calculating Sharpe ratio")
            return None, None
