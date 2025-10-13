def normalize_ticker(ticker: str) -> str:
    t = ticker.strip().upper()
    if t.startswith("^"):
        return t
    if "." in t:
        return t
    return f"{t}.NS"

def batch_normalize(tickers: list[str]) -> list[str]:
    return list(dict.fromkeys([normalize_ticker(t) for t in tickers]))

def add_benchmarks(tickers: list[str]) -> list[str]:
    out = batch_normalize(tickers)
    for idx in ["^NSEI", "^BSESN"]:
        if idx not in out:
            out.append(idx)
    return out
