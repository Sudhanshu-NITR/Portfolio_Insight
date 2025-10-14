from flask import Flask, jsonify
from flask_cors import CORS
from routes.market_routes import market_bp
from routes.tools_routes import tools_bp
# ONLY import the LangGraph routes - remove other rag_bp imports
from routes.langgraph_routes import rag_bp
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
    app.register_blueprint(rag_bp)  # Only register once

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
                    "holdings": ["RELIANCE", "TCS"]  # optional
                },
                "example": "What is the current PE ratio of Reliance and how does it compare to industry averages?"
            }
        })

    return app

if __name__ == "__main__":
    app = create_app()
    if app is None:
        print("❌ App creation failed due to configuration errors")
        exit(1)
        
    print("🚀 Starting Portfolio Insight FIXED LangGraph Server...")
    print("📊 Main endpoint: POST /chat")
    print("📚 Knowledge base ready with embedded financial books")
    print("🔧 Live market data tools available")
    print("✅ ALL FIXES APPLIED")
    app.run(host="0.0.0.0", port=5000, debug=True)
