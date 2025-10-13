import pandas as pd
import yfinance as yf
from utils.ticker_utils import batch_normalize
from utils.cache_utils import get_cached, set_cached
from utils.validation import validate_fields, clamp_window_days, validate_interval, validate_period
from config import Config
from utils.logging_utils import StepTimer

def _extract(df, ticker):
    if df is None or df.empty:
        return pd.DataFrame()
    if isinstance(df.columns, pd.MultiIndex):
        if ticker in df.columns.levels[1]:
            return df.xs(ticker, axis=1, level=1).dropna()
        return pd.DataFrame()
    return df

def get_quotes(tickers: list[str], fields: list[str] | None = None) -> dict:
    tm = StepTimer("QUOTES")
    tm.start(f"tickers={tickers} fields={fields}")
    fields = fields or ["close","previousClose","volume"]
    fields = validate_fields(fields)
    params = {"tickers": ",".join(sorted(tickers)), "fields": ",".join(sorted(fields))}
    cached = get_cached("quotes", params, Config.CACHE_TTL_QUOTES)
    if cached:
        return cached
    norm = batch_normalize(tickers)
    out: dict = {}
    df = yf.download(norm, period="5d", interval="1d", threads=True, auto_adjust=True, progress=False)
    tm.step(f"yf.download done rows={len(df)}")
    mapping = {"close":"Close","previousClose":"Close","open":"Open","high":"High","low":"Low","volume":"Volume"}
    for orig in tickers:
        nt = batch_normalize([orig])[0]
        tdf = _extract(df, nt)
        if tdf.empty:
            out[orig.upper()] = {f: None for f in fields}
            continue
        last = tdf.iloc[-1]
        row = {}
        for f in fields:
            col = mapping.get(f)
            row[f] = float(last.get(col)) if col in tdf.columns else None
        out[orig.upper()] = row
    set_cached("quotes", params, out, Config.CACHE_TTL_QUOTES)
    tm.step("format done")
    return out

def get_price_ranges(tickers: list[str], window_days: int = 252) -> dict:
    window_days = clamp_window_days(window_days)
    params = {"tickers": ",".join(sorted(tickers)), "window": window_days}
    cached = get_cached("ranges", params, Config.CACHE_TTL_QUOTES)
    if cached:
        return cached
    norm = batch_normalize(tickers)
    period = "1y" if window_days > 180 else "6mo"
    df = yf.download(norm, period=period, interval="1d", threads=True, auto_adjust=True, progress=False)
    out = {}
    for orig in tickers:
        nt = batch_normalize([orig])[0]
        tdf = _extract(df, nt)
        if tdf.empty:
            out[orig.upper()] = {"high": None, "low": None, "current": None, "window_days": 0}
            continue
        recent = tdf.tail(window_days)
        out[orig.upper()] = {
            "high": float(recent["High"].max()),
            "low": float(recent["Low"].min()),
            "current": float(recent["Close"].iloc[-1]),
            "window_days": len(recent)
        }
    set_cached("ranges", params, out, Config.CACHE_TTL_QUOTES)
    return out

def get_intraday(tickers: list[str], interval: str = "5m", period: str = "5d") -> dict:
    interval = validate_interval(interval)
    period = validate_period(period)
    params = {"tickers": ",".join(sorted(tickers)), "interval": interval, "period": period}
    cached = get_cached("intraday", params, Config.CACHE_TTL_QUOTES)
    if cached:
        return cached
    norm = batch_normalize(tickers)
    df = yf.download(norm, period=period, interval=interval, threads=True, auto_adjust=True, progress=False)
    out = {}
    for orig in tickers:
        nt = batch_normalize([orig])[0]
        tdf = _extract(df, nt)
        out[orig.upper()] = {
            "interval": interval, "period": period,
            "data": tdf.reset_index().to_dict(orient="records")
        }
    set_cached("intraday", params, out, Config.CACHE_TTL_QUOTES)
    return out
