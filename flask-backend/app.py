from flask import Flask, jsonify
from flask_cors import CORS
from routes.market_routes import market_bp
from routes.tools_routes import tools_bp
from routes.unified_rag_routes import rag_bp

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(market_bp)
    app.register_blueprint(tools_bp)  
    app.register_blueprint(rag_bp)  # This now contains the unified endpoint

    @app.route("/health")
    def health():
        return jsonify({
            "status": "ok",
            "service": "portfolio-unified-rag-agent",
            "version": "2.0",
            "endpoints": {
                "main": "/chat",
                "legacy_rag": "/rag/query", 
                "legacy_agent": "/rag/agent",
                "ingest": "/rag/ingest",
                "health": "/health"
            }
        })

    @app.route("/")
    def root():
        return jsonify({
            "message": "Portfolio Insight - Unified RAG + Agentic AI",
            "description": "Combines financial knowledge base with real-time market data tools",
            "main_endpoint": "/chat",
            "usage": {
                "method": "POST",
                "payload": {
                    "question": "Your financial question here",
                    "holdings": ["RELIANCE", "TCS"] # optional
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
