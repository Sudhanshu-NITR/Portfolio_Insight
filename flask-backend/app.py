from flask import Flask, jsonify
from flask_cors import CORS
from routes.market_routes import market_bp
from routes.tools_routes import tools_bp
from routes.rag_routes import rag_bp

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(market_bp)
    app.register_blueprint(tools_bp)
    app.register_blueprint(rag_bp)

    @app.route("/health")
    def health():
        return jsonify({"status":"ok","service":"portfolio-rag-agent"})

    return app

if __name__=="__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
