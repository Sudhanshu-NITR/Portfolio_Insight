from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import time

app = Flask(__name__)

_price_cache = {} 
CACHE_TTL = 60

CORS(app)

def normalize_ticker(ticker: str) -> str:
    """
    Normalizing tickers. If no suffix provided, assume .NS for NSE (India).
    """
    t = ticker.strip().upper()
    if "." in t:
        return t
    return f"{t}.NS"

@app.route("/test")
def test():
    return jsonify({"status": "ok"})


@app.route("/market/quotes", methods=["POST"])
def market_quotes():
    data = request.get_json(force=True)
    tickers = data.get("tickers", [])
    if not tickers or not isinstance(tickers, list):
        return jsonify({"error": "Invalid payload"}), 400

    unique = list(dict.fromkeys(tickers))
    yf_tickers = [normalize_ticker(t) for t in unique]

    now = time.time()
    result = {}
    to_fetch = []

    for orig, yf_t in zip(unique, yf_tickers):
        cached = _price_cache.get(yf_t)
        if cached and now - cached["ts"] < CACHE_TTL:
            result[orig.upper()] = cached["data"]  # Return full cached dataset
        else:
            to_fetch.append(yf_t)

    # Fetch missing tickers from yfinance
    if to_fetch:
        try:
            df = yf.download(
                to_fetch, period="1mo", threads=True, auto_adjust=True, progress=False
            )

            close_df = df["Close"] if "Close" in df else df
            if isinstance(close_df, pd.Series):
                close_df = close_df.to_frame()

            # Convert full dataset to JSON for each ticker
            for yf_t in to_fetch:
                ticker_data = {}
                if yf_t in close_df.columns:
                    # Get last closing price
                    series = close_df[yf_t].dropna()
                    last_price = float(series.iloc[-1]) if not series.empty else None
                else:
                    last_price = None

                # Extract all OHLCV data for this ticker
                if isinstance(df, pd.DataFrame) and yf_t in df.columns.levels[1]:
                    ticker_df = df.xs(yf_t, axis=1, level=1).dropna()
                else:
                    ticker_df = df if isinstance(df, pd.DataFrame) else pd.DataFrame()

                ticker_data = {
                    "raw_ticker": yf_t,
                    "currency": "INR",
                    "last_price": last_price,
                    "ohlcv": ticker_df.reset_index().to_dict(orient="records"),
                }

                # Cache full dataset
                _price_cache[yf_t] = {"data": ticker_data, "ts": time.time()}

                # Map back to original ticker
                for orig, normalized in zip(unique, yf_tickers):
                    if normalized == yf_t:
                        result[orig.upper()] = ticker_data

        except Exception as e:
            return jsonify({"error": f"yfinance error: {str(e)}"}), 500

    # Ensure every ticker has an entry
    for orig in unique:
        result.setdefault(
            orig.upper(),
            {
                "raw_ticker": normalize_ticker(orig),
                "currency": "INR",
                "last_price": None,
                "ohlcv": [],
            },
        )

    return jsonify(result)



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
