import pandas as pd
import yfinance as yf
from utils.ticker_utils import batch_normalize
from utils.cache_utils import get_cached, set_cached

def _df_to_records(df: pd.DataFrame):
    if df is None or df.empty:
        return []
    out = df.reset_index()
    if "Date" in out.columns:
        out["Date"] = pd.to_datetime(out["Date"]).dt.strftime("%Y-%m-%d")
    return out.to_dict(orient="records")

def get_analyst_summary(tickers: list[str]) -> dict:
    params = {"tickers": ",".join(sorted(tickers))}
    cached = get_cached("analyst", params, 600)
    if cached:
        return cached
    out = {}
    for t in tickers:
        nt = batch_normalize([t])[0]
        try:
            tk = yf.Ticker(nt)
            recs = getattr(tk, "recommendations", None)
            trend = getattr(tk, "recommendationTrend", None)
            out[t.upper()] = {
                "symbol": t.upper(),
                "raw_ticker": nt,
                "recommendations": _df_to_records(recs) if isinstance(recs, pd.DataFrame) else [],
                "recommendation_trend": _df_to_records(trend) if isinstance(trend, pd.DataFrame) else [],
                "price_target": {"mean": None, "high": None, "low": None, "num_analysts": None, "note": "Use paid provider for targets"},
                "estimates": {"eps_current_year": None, "eps_next_q": None, "revenue_current_year": None, "revenue_next_q": None, "note": "Use provider for structured estimates"}
            }
        except Exception as e:
            out[t.upper()] = {"symbol": t.upper(), "raw_ticker": nt, "error": str(e)}
    set_cached("analyst", params, out, 600)
    return out
