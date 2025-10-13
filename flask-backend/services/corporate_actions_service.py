import yfinance as yf
import pandas as pd
from utils.ticker_utils import batch_normalize
from utils.cache_utils import get_cached, set_cached
from config import Config

def _series_to_records(series: pd.Series, value_name: str):
    if series is None or series.empty:
        return []
    df = series.reset_index()
    df.columns = ["date", value_name]
    df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
    if value_name == "dividend":
        df["dividend"] = df["dividend"].astype(float)
    return df.to_dict(orient="records")

def _to_date(ts):
    try:
        if not ts:
            return None
        return pd.to_datetime(int(ts), unit="s").strftime("%Y-%m-%d")
    except Exception:
        return None

def get_dividends_and_splits(tickers: list[str]) -> dict:
    params = {"tickers": ",".join(sorted(tickers))}
    cached = get_cached("corp", params, Config.CACHE_TTL_CORPORATE)
    if cached:
        return cached
    out = {}
    for t in tickers:
        nt = batch_normalize([t])[0]
        try:
            tk = yf.Ticker(nt)
            dividends = _series_to_records(tk.dividends, "dividend")
            splits = _series_to_records(tk.splits, "split_ratio")
            info = {}
            try:
                info = tk.info or {}
            except Exception:
                info = {}
            out[t.upper()] = {
                "symbol": t.upper(),
                "raw_ticker": nt,
                "currency": info.get("currency", "INR"),
                "dividends": dividends,
                "splits": splits,
                "summary": {
                    "ex_dividend_date": _to_date(info.get("exDividendDate")),
                    "dividend_payment_date": _to_date(info.get("dividendDate")),
                    "dividend_yield": float(info.get("dividendYield")) if info.get("dividendYield") is not None else None,
                    "dividend_rate": float(info.get("dividendRate")) if info.get("dividendRate") is not None else None,
                },
                "notes": "Record dates/spinoffs/rights often unavailable via free endpoints."
            }
        except Exception as e:
            out[t.upper()] = {"symbol": t.upper(), "raw_ticker": nt, "error": str(e)}
    set_cached("corp", params, out, Config.CACHE_TTL_CORPORATE)
    return out
