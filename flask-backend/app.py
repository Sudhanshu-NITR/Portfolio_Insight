from flask import Flask, jsonify
from flask_cors import CORS
import threading
import requests
from routes.market_routes import market_bp
from routes.tools_routes import tools_bp
from routes.langgraph_routes import rag_bp
from config import Config

BACKEND_URL = "https://portfolio-insight-backend.onrender.com"
PING_INTERVAL = 300  # seconds

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
    
    # Register blueprints
    app.register_blueprint(market_bp)
    app.register_blueprint(tools_bp)  
    app.register_blueprint(rag_bp)

    @app.route("/health")
    def health():
        return jsonify({
            "status": "ok",
            "service": "portfolio-langgraph-agent",
            "version": "2.2-fixed",
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
            "message": "Portfolio Insight - FIXED & Working",
            "description": "Financial portfolio management with RAG + AI",
            "main_endpoint": "/chat",
            "status": "operational",
            "approach": "LangGraph with proper tool integration",
            "usage": {
                "method": "POST",
                "payload": {
                    "question": "Your financial question here",
                    "holdings": ["RELIANCE", "TCS"]
                },
                "example": "What is the current PE ratio of Reliance and how does it compare to industry averages?"
            }
        })

    def ping_backend():
        try:
            response = requests.get(BACKEND_URL)
            print("Pinged backend successfully")
        except requests.RequestException as e:
            print(f"Ping error: {e}")
        finally:
            # Schedule next ping
            threading.Timer(PING_INTERVAL, ping_backend).start()

    # Start pinging after app creation
    if Config.ENV == "PROD":
        threading.Timer(PING_INTERVAL, ping_backend).start()

    return app

if __name__ == "__main__":
    app = create_app()
    if app is None:
        print("❌ App creation failed due to configuration errors")
        exit(1)
        
    print("🚀 Starting Portfolio Insight FIXED LangGraph Server...")
    print(f"📊 Main endpoint: POST /chat")
    print(f"📚 Backend URL: {BACKEND_URL}")
    print("📚 Knowledge base ready with embedded financial books")
    print("🔧 Live market data tools available")
    print("✅ ALL FIXES APPLIED")
    app.run(host="0.0.0.0", port=5000, debug=True)
