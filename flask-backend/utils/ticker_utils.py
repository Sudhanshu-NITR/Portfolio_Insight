import pandas as pd

def normalize_ticker(ticker: str) -> str:
    """Normalize ticker symbols for yfinance"""
    t = ticker.strip().upper()
    if t.startswith("^"): 
        return t
    if "." in t:
        return t
    return f"{t}.NS"

def extract_ticker_data(df, ticker):
    """Extract data for a specific ticker from multi-index DataFrame"""
    if df is None or df.empty:
        return pd.DataFrame()
    
    if isinstance(df.columns, pd.MultiIndex):
        if ticker in df.columns.levels[1]:
            return df.xs(ticker, axis=1, level=1).dropna()
    elif len(df.columns) > 0:
        return df
    
    return pd.DataFrame()