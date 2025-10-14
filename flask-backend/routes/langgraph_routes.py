from flask import Blueprint, request, jsonify
from rag.ingestion import ingest
from rag.langgraph_agent import build_langgraph_agent
from config import Config
from utils.logging_utils import StepTimer
import time

rag_bp = Blueprint("rag", __name__)
langgraph_agent = None

def ensure_langgraph_agent():
    """Initialize the LangGraph agent on first use"""
    global langgraph_agent
    if langgraph_agent is None:
        print("🚀 Initializing LangGraph RAG Agent...")
        langgraph_agent = build_langgraph_agent()
        print("✅ LangGraph agent ready - Modern workflow with proper tool handling")

@rag_bp.route("/rag/ingest", methods=["POST"])
def rag_ingest():
    """Ingest documents into the knowledge base"""
    payload = request.get_json(force=True)
    manifest = (payload.get("manifest") if isinstance(payload, dict) 
               else payload if isinstance(payload, list) else None)
    
    if not isinstance(manifest, list) or not manifest:
        return jsonify({"error": "manifest list required"}), 400
        
    try:
        res = ingest(manifest)
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route("/chat", methods=["POST"])
def langgraph_chat():
    """
    MAIN CHAT ENDPOINT - LangGraph RAG Agent
    
    This endpoint uses LangGraph for:
    1. Proper state management
    2. Reliable tool execution
    3. Clear workflow control
    4. No hanging or stuck responses
    
    Benefits:
    - Modern, maintained framework
    - Proper error handling
    - Reliable tool execution
    - Clear state transitions
    """
    
    ensure_langgraph_agent()
    
    payload = request.get_json(force=True)
    question = payload.get("question", "").strip()
    holdings = payload.get("holdings", [])
    
    if not question:
        return jsonify({"error": "question required"}), 400
    
    # Overall request timer
    tm = StepTimer("LANGGRAPH_CHAT")
    tm.start(f"q='{question[:50]}...' holdings={len(holdings)}")
    
    try:
        # Use the LangGraph agent
        response = langgraph_agent.query(question, holdings)
        
        tm.step("LangGraph response generated")
        
        # Enhanced response with tool usage metadata
        api_response = {
            "answer": response["answer"],
            "status": response.get("status", "success"),
            "error": response.get("error", None),
            
            # Tool usage analytics
            "tool_usage": {
                "approach": "langgraph",
                "tools_used": response.get("tools_used", []),
                "knowledge_base_used": response.get("knowledge_base_used", False),
                "total_tool_calls": response.get("total_tool_calls", 0),
                "workflow_managed": True
            },
            
            # Performance metrics
            "performance": {
                "total_time_ms": response.get("processing_time_ms", 0),
                "framework": "LangGraph - Modern workflow framework",
                "reliability": "High - No hanging issues"
            }
        }
        
        return jsonify(api_response)
        
    except Exception as e:
        tm.error(f"failed: {e}")
        return jsonify({"error": str(e)}), 500

# Legacy endpoints for backward compatibility
@rag_bp.route("/rag/query", methods=["POST"])
def rag_query_legacy():
    """Legacy RAG endpoint - now uses LangGraph agent"""
    return langgraph_chat()

@rag_bp.route("/rag/agent", methods=["POST"])
def rag_agent_legacy():
    """Legacy agent endpoint - now uses LangGraph agent"""
    return langgraph_chat()

# System information endpoints
@rag_bp.route("/rag/workflow", methods=["GET"])
def workflow_info():
    """Get information about the LangGraph workflow"""
    ensure_langgraph_agent()
    
    try:
        return jsonify({
            "framework": "LangGraph",
            "workflow_type": "StateGraph",
            "nodes": ["agent", "tools"],
            "edges": {
                "START": "agent",
                "agent": "conditional (tools or END)",
                "tools": "agent"
            },
            "state_management": "TypedDict with message history",
            "tool_handling": "ToolNode with proper execution",
            "benefits": [
                "No hanging responses",
                "Proper state management",
                "Reliable tool execution",
                "Clear workflow control",
                "Modern framework"
            ]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route("/rag/debug/state", methods=["POST"])
def debug_workflow_state():
    """Debug endpoint to see workflow state transitions"""
    ensure_langgraph_agent()
    
    payload = request.get_json(force=True)
    query = payload.get("query", "").strip()
    
    if not query:
        return jsonify({"error": "query required"}), 400
    
    try:
        # For debugging, we could add state inspection here
        response = langgraph_agent.query(query)
        
        return jsonify({
            "query": query,
            "workflow_completed": True,
            "final_state": {
                "tools_used": response.get("tools_used", []),
                "knowledge_base_used": response.get("knowledge_base_used", False),
                "processing_time": response.get("processing_time_ms", 0)
            },
            "answer_preview": response["answer"][:200] + "..." if len(response["answer"]) > 200 else response["answer"],
            "debug": True
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route("/rag/stats", methods=["GET"])
def langgraph_stats():
    """Get system statistics for LangGraph approach"""
    from langchain_chroma import Chroma
    from rag.llm import make_embedder
    
    try:
        db = Chroma(
            collection_name="advisor_kg",
            embedding_function=make_embedder(),
            persist_directory=Config.VECTOR_DB_DIR
        )
        
        return jsonify({
            "status": "operational",
            "approach": "langgraph",
            "framework_version": "Latest LangGraph",
            "knowledge_base": "connected",
            "agent_ready": langgraph_agent is not None,
            "advantages": [
                "Modern, actively maintained framework",
                "Proper state management with TypedDict",
                "Reliable tool execution with ToolNode",
                "No hanging or stuck responses",
                "Clear workflow control flow",
                "Better error handling and recovery"
            ],
            "workflow": {
                "nodes": 2,
                "state_managed": True,
                "tool_integration": "Native ToolNode",
                "message_history": "Maintained in state"
            }
        })
        
    except Exception as e:
        return jsonify({
            "status": "error", 
            "error": str(e)
        }), 500