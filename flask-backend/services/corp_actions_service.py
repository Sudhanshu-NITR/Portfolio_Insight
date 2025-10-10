import yfinance as yf
import pandas as pd
from utils.ticker_utils import normalize_ticker
from utils.cache_utils import get_cached_data, set_cached_data
from utils.date_utils import ts_to_iso

CACHE_NS = 900  # 15 minutes cache for corp actions

def _series_to_records(series: pd.Series, value_name: str):
    if series is None or series.empty:
        return []
    df = series.reset_index()
    # yfinance gives Date index and values
    df.columns = ['date', value_name]
    # cast
    df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
    if value_name == 'dividend':
        df['dividend'] = df['dividend'].astype(float)
    return df.to_dict(orient='records')

def get_dividends_and_splits(tickers: list) -> dict:
    key = f"corp_actions_{'-'.join(sorted([t.upper() for t in tickers]))}"
    cached = get_cached_data(key)
    if cached:
        return cached

    result = {}

    for orig in tickers:
        yf_t = normalize_ticker(orig)
        try:
            tkr = yf.Ticker(yf_t)

            # Dividends history
            dividends = tkr.dividends  # Series indexed by date
            dividends_records = _series_to_records(dividends, 'dividend')

            # Splits history
            splits = tkr.splits  # Series with split ratio
            splits_records = _series_to_records(splits, 'split_ratio')

            # Basic info fields for key dates/yields
            info = {}
            try:
                info = tkr.info or {}
            except Exception:
                info = {}

            ex_div_ts = info.get('exDividendDate')
            dividend_date_ts = info.get('dividendDate')
            payout_ratio = info.get('payoutRatio')
            dividend_yield = info.get('dividendYield')
            dividend_rate = info.get('dividendRate')

            # Best-effort 'record date' and 'payment date' are not consistently available in yfinance.info
            # Many times only exDividendDate (and sometimes dividendDate) are present.

            result[orig.upper()] = {
                "symbol": orig.upper(),
                "raw_ticker": yf_t,
                "currency": info.get('currency', 'INR'),
                "dividends": dividends_records,                 # list[{date, dividend}]
                "splits": splits_records,                       # list[{date, split_ratio}]
                "summary": {
                    "ex_dividend_date": ts_to_iso(ex_div_ts),
                    "dividend_payment_date": ts_to_iso(dividend_date_ts),
                    "dividend_yield": float(dividend_yield) if dividend_yield is not None else None,
                    "dividend_rate": float(dividend_rate) if dividend_rate is not None else None,
                    "payout_ratio": float(payout_ratio) if payout_ratio is not None else None
                },
                "notes": "Record date and rights/spinoff/merger details are not consistently available via free Yahoo endpoints."
            }

        except Exception as e:
            result[orig.upper()] = {"symbol": orig.upper(), "raw_ticker": yf_t, "error": str(e)}

    set_cached_data(key, result)
    return result

def placeholder_corporate_events_from_news(tickers: list) -> dict:
    """
    Placeholder for future: scrape or call a news/events API to detect M&A, spinoffs, rights issues.
    Returns an empty list for each ticker for now.
    """
    return {t.upper(): {"events": []} for t in tickers}
