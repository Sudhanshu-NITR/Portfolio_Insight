from flask import Blueprint, request, jsonify
from rag.ingestion import ingest
from rag.unified_agent import build_unified_agent
from config import Config
from utils.logging_utils import StepTimer

rag_bp = Blueprint("rag", __name__)
_unified_agent = None

def _ensure_agent():
    global _unified_agent
    if _unified_agent is None:
        _unified_agent = build_unified_agent()

@rag_bp.route("/rag/ingest", methods=["POST"])
def rag_ingest():
    """Ingest documents into the knowledge base"""
    payload = request.get_json(force=True)
    manifest = payload.get("manifest") if isinstance(payload, dict) else (payload if isinstance(payload, list) else None)
    if not isinstance(manifest, list) or not manifest:
        return jsonify({"error": "manifest list required"}), 400
    try:
        res = ingest(manifest)
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route("/chat", methods=["POST"])
def unified_chat():
    """
    MAIN UNIFIED ENDPOINT - Combines RAG + Agentic AI
    
    This single endpoint:
    1. Retrieves relevant context from knowledge base
    2. Analyzes if tools are needed for current data
    3. Uses LLM to decide the best approach
    4. Combines retrieval and tool results for comprehensive answers
    """
    _ensure_agent()
    
    payload = request.get_json(force=True)
    question = payload.get("question", "").strip()
    holdings = payload.get("holdings", [])
    
    if not question:
        return jsonify({"error": "question required"}), 400

    tm = StepTimer("UNIFIED_CHAT")
    tm.start(f"q='{question[:80]}...' holdings={len(holdings)}")

    try:
        # Use the unified agent that combines RAG + Tools
        response = _unified_agent.query(question, holdings)
        
        tm.step("unified response generated")
        
        return jsonify({
            "answer": response["answer"],
            "context_retrieved": response.get("context_retrieved", False),
            "tools_used": response.get("tools_used", False),
            "status": response.get("status", "success"),
            "error": response.get("error", None)
        })
        
    except Exception as e:
        tm.error(f"failed: {e}")
        return jsonify({"error": str(e)}), 500

# Legacy endpoints for backward compatibility (but they now use unified agent internally)
@rag_bp.route("/rag/query", methods=["POST"])
def rag_query_legacy():
    """Legacy RAG endpoint - now uses unified agent"""
    return unified_chat()

@rag_bp.route("/rag/agent", methods=["POST"]) 
def rag_agent_legacy():
    """Legacy agent endpoint - now uses unified agent"""
    return unified_chat()

@rag_bp.route("/rag/debug/stats", methods=["GET"])
def rag_stats():
    """Debug endpoint to check system status"""
    from langchain_chroma import Chroma
    from rag.llm import make_embedder
    
    try:
        db = Chroma(
            collection_name="advisor_kg",
            embedding_function=make_embedder(),
            persist_directory=Config.VECTOR_DB_DIR
        )
        return jsonify({
            "status": "ok",
            "knowledge_base": "connected",
            "unified_agent": "ready" if _unified_agent else "not_initialized"
        })
    except Exception as e:
        return jsonify({
            "status": "error", 
            "error": str(e)
        }), 500
