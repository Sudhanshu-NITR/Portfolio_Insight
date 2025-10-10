# import yfinance as yf
# import pandas as pd

# # 1. Define the ticker and download the last 2 months of daily data
# nifty_ticker = '^NSEI'
# nifty_data = yf.download(
#     nifty_ticker,
#     period="2mo", # Get enough data to ensure we have at least 6 Fridays
#     interval="1d"
# )['Close']

# # 2. Filter the data to get only Fridays
# # In pandas, Monday is 0 and Friday is 4
# fridays = nifty_data[nifty_data.index.dayofweek == 4]

# # 3. Get the most recent 6 Fridays from the filtered list
# last_5_fridays = fridays.tail()

# print("---- Nifty 50 Closing Prices for the Last 6 Fridays ----")
# print(last_5_fridays)



# # tcs = yf.download("TCS.NS", period="6mo", interval="1mo")

# # print(tcs)



import yfinance as yf
import pandas as pd

tcs = yf.Ticker("TCS.NS")
print(tcs.actions.tail(10)) 