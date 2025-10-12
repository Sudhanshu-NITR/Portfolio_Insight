import http.client
import json

conn = http.client.HTTPSConnection("stock.indianapi.in")

headers = { 'X-Api-Key': "sk-live-bk10DLtYqebh3E6M9Suxq0KG9igXAJQp9B9dVRJY" }

conn.request("GET", "/stock?name=Tata+Steel", headers=headers)

res = conn.getresponse()
data = res.read()

print(json.dumps(data.decode("utf-8"), indent=4))  