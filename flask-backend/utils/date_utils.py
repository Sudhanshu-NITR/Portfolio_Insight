from datetime import datetime
import pandas as pd

def ts_to_iso(ts):
    if not ts:
        return None
    try:
        return pd.to_datetime(ts, unit='s').strftime('%Y-%m-%d')
    except Exception:
        try:
            return datetime.fromtimestamp(int(ts)).strftime('%Y-%m-%d')
        except Exception:
            return None
