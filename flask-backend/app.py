from flask import Flask, jsonify
from flask_cors import CORS
from routes.market_routes import market_bp
from routes.corp_actions_routes import corp_bp
from routes.analyst_routes import analyst_bp
from routes.trending_routes import trending_bp
from routes.forecasts_routes import stock_forecasts_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(corp_bp)
app.register_blueprint(market_bp)
app.register_blueprint(analyst_bp)
app.register_blueprint(trending_bp)
app.register_blueprint(stock_forecasts_bp)

@app.route("/test")
def test():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
