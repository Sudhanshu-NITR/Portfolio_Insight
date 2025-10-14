import pandas as pd
import yfinance as yf
import time
from utils.ticker_utils import batch_normalize

_price_cache = {}
CACHE_TTL = 60  # seconds

def get_detailed_pricemap(tickers):
    unique = list(dict.fromkeys(tickers))
    yf_tickers = [batch_normalize([t])[0] for t in unique]

    # Add indices ^NSEI and ^BSESN to yf_tickers if not already present
    for idx in ["^NSEI", "^BSESN"]:
        if idx not in yf_tickers:
            yf_tickers.append(idx)

    now = time.time()
    result = {}
    to_fetch = []

    # Check cache for requested tickers
    for orig, yf_t in zip(unique, yf_tickers):
        cached = _price_cache.get(yf_t)
        if cached and now - cached["ts"] < CACHE_TTL:
            result[orig.upper()] = cached["data"]
        else:
            to_fetch.append(yf_t)

    # Check cache for indices
    for idx in ["^NSEI", "^BSESN"]:
        cached = _price_cache.get(idx)
        if not (cached and now - cached["ts"] < CACHE_TTL) and idx not in to_fetch:
            to_fetch.append(idx)

    to_fetch = list(dict.fromkeys(to_fetch))

    if to_fetch:
        try:
            df = yf.download(to_fetch, period="1mo", threads=True, auto_adjust=True, progress=False)

            close_df = df["Close"] if "Close" in df else df
            if isinstance(close_df, pd.Series):
                close_df = close_df.to_frame()

            # Prepare daily OHLCV and last price for each ticker
            for yf_t in to_fetch:
                if yf_t in close_df.columns:
                    series = close_df[yf_t].dropna()
                    last_price = float(series.iloc[-1]) if not series.empty else None
                else:
                    last_price = None

                if (
                    isinstance(df, pd.DataFrame)
                    and hasattr(df.columns, "levels")
                    and len(df.columns.levels) > 1
                    and yf_t in df.columns.levels[1]
                ):
                    ticker_df = df.xs(yf_t, axis=1, level=1).dropna()
                else:
                    ticker_df = df if isinstance(df, pd.DataFrame) else pd.DataFrame()

                ticker_data = {
                    "raw_ticker": yf_t,
                    "currency": "INR",
                    "last_price": last_price,
                    "ohlcv": ticker_df.reset_index().to_dict(orient="records"),
                }

                _price_cache[yf_t] = {"data": ticker_data, "ts": time.time()}
                for orig, normalized in zip(unique, yf_tickers):
                    if normalized == yf_t:
                        result[orig.upper()] = ticker_data

        except Exception as e:
            return {"error": f"yfinance error: {str(e)}"}

    # Add default data for any missing tickers in result
    for orig in unique:
        result.setdefault(
            orig.upper(),
            {
                "raw_ticker": batch_normalize([orig])[0],
                "currency": "INR",
                "last_price": None,
                "ohlcv": [],
            },
        )

    # Fetch 6 months daily data for monthly OHLC aggregation including indices
    try:
        monthly_syms = list({v["raw_ticker"] for v in result.values()} | {"^NSEI", "^BSESN"})
        daily6 = yf.download(monthly_syms, period="6mo", interval="1d", threads=True, auto_adjust=True, progress=False)

        # Fix MultiIndex if needed
        if isinstance(daily6, pd.DataFrame) and not isinstance(daily6.columns, pd.MultiIndex):
            sym = monthly_syms[0]
            daily6 = pd.concat({sym: daily6}, axis=1).swaplevel(axis=1)
        daily6 = daily6.sort_index()

        def to_monthly6(tdf: pd.DataFrame):
            agg = {"Open": "first", "High": "max", "Low": "min", "Close": "last", "Volume": "sum"}
            m = (
                tdf.resample("M")
                .agg(agg)
                .dropna(how="all")
                .tail(6)
            )
            return (
                m.assign(Month=lambda x: x.index.strftime("%Y-%m-%d"))
                 [["Month", "Open", "High", "Low", "Close", "Volume"]]
                 .reset_index(drop=True)
                 .to_dict(orient="records")
            )

        tickers_level = daily6.columns.levels[1] if isinstance(daily6.columns, pd.MultiIndex) else []
        for sym in monthly_syms:
            if isinstance(daily6.columns, pd.MultiIndex) and sym in tickers_level:
                tdf = daily6.xs(sym, axis=1, level=1).dropna(how="all")
                monthly_list = to_monthly6(tdf) if not tdf.empty and set(["Open", "High", "Low", "Close", "Volume"]).issubset(tdf.columns) else []
            else:
                monthly_list = []

            key = sym if sym.startswith("^") else sym.split(".")[0]
            key_upper = key.upper()
            if key_upper in result:
                result[key_upper]["monthly_ohlc"] = monthly_list
            else:
                result[key_upper] = {
                    "raw_ticker": sym,
                    "currency": "INR",
                    "last_price": None,
                    "ohlcv": [],
                    "monthly_ohlc": monthly_list,
                }
    except Exception:
        # Ignore monthly OHLC errors silently
        pass

    return result
