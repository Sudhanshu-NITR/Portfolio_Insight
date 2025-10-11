import yfinance as yf
import pandas as pd
from utils.ticker_utils import normalize_ticker
from utils.cache_utils import get_cached_data, set_cached_data

def _df_to_records(df: pd.DataFrame):
    if df is None or df.empty:
        return []
    out = df.reset_index()
    # normalize any date-like index col
    if 'Date' in out.columns:
        out['Date'] = pd.to_datetime(out['Date']).dt.strftime('%Y-%m-%d')
    return out.to_dict(orient='records')


def get_ratings_trend(tickers: list) -> dict:
    key = f"ratings_{'-'.join(sorted([t.upper() for t in tickers]))}"
    cached = get_cached_data(key)
    if cached: return cached

    res = {}
    for t in tickers:
        yf_t = normalize_ticker(t)
        try:
            tk = yf.Ticker(yf_t)
            # recommendations (table of broker actions) and recommendationTrend (aggregated monthly counts)
            recs = getattr(tk, 'recommendations', None)
            trend = getattr(tk, 'recommendationTrend', None)
            res[t.upper()] = {
                "symbol": t.upper(),
                "raw_ticker": yf_t,
                "recommendations": _df_to_records(recs) if isinstance(recs, pd.DataFrame) else [],
                "recommendation_trend": _df_to_records(trend) if isinstance(trend, pd.DataFrame) else []
            }
        except Exception as e:
            res[t.upper()] = {"symbol": t.upper(), "raw_ticker": yf_t, "error": str(e)}
    set_cached_data(key, res)
    return res

def get_price_target_stub(tickers: list) -> dict:
    """
    Best-effort from Yahoo via yfinance is limited; provide placeholders now.
    Upgrade later with FMP/Finnhub for consensus mean/high/low and target revisions.
    """
    res = {}
    for t in tickers:
        res[t.upper()] = {
            "symbol": t.upper(),
            "price_target": {
                "mean": None, "high": None, "low": None, "num_analysts": None,
                "note": "Populate via paid provider (FMP price target consensus) or scraping as a future enhancement."
            }
        }
    return res

def get_estimates_stub(tickers: list) -> dict:
    """
    EPS and revenue forecasts are not consistently exposed via yfinance; provide placeholders.
    """
    res = {}
    for t in tickers:
        res[t.upper()] = {
            "symbol": t.upper(),
            "estimates": {
                "eps_next_q": None, "eps_current_year": None, "revenue_next_q": None, "revenue_current_year": None,
                "note": "Populate via Finnhub/FMP estimates endpoints when keys are configured."
            }
        }
    return res