from flask import Flask, jsonify
from flask_cors import CORS
from routes.market_routes import market_bp
from routes.tools_routes import tools_bp
from routes.unified_rag_routes import rag_bp  # Using only unified routes
from config import Config

def create_app():
    app = Flask(__name__)
    CORS(app, origins="*", supports_credentials=True)
    
    # Validate configuration
    try:
        Config.validate_config()
        print("✅ Configuration validated successfully")
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        return None
    
    # Register blueprints (no duplicates)
    app.register_blueprint(market_bp)
    app.register_blueprint(tools_bp)  
    app.register_blueprint(rag_bp)

    @app.route("/health")
    def health():
        return jsonify({
            "status": "ok",
            "service": "portfolio-unified-rag-agent",
            "version": "2.1",
            "endpoints": {
                "main": "/chat",
                "ingest": "/rag/ingest",
                "health": "/health",
                "market": "/market/*",
                "tools": "/tools/*"
            }
        })

    @app.route("/")
    def root():
        return jsonify({
            "message": "Portfolio Insight - Fixed & Optimized",
            "description": "Financial portfolio management with RAG + AI",
            "main_endpoint": "/chat",
            "status": "operational",
            "usage": {
                "method": "POST",
                "payload": {
                    "question": "Your financial question here",
                    "holdings": ["RELIANCE", "TCS"]  # optional
                },
                "example": "What is the current PE ratio of Reliance and how does it compare to industry averages?"
            }
        })

    return app

if __name__ == "__main__":
    app = create_app()
    print("🚀 Starting Portfolio Insight Unified RAG + Agentic AI Server...")
    print("📊 Main endpoint: POST /chat")
    print("📚 Knowledge base ready with embedded financial books")
    print("🔧 Live market data tools available")
    app.run(host="0.0.0.0", port=5000, debug=True)
