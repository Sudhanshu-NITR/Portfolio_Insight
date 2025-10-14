from flask import Blueprint, request, jsonify
from rag.ingestion import ingest
from rag.rag_tool_agent import build_rag_tool_agent
from config import Config
from utils.logging_utils import StepTimer
import time

rag_bp = Blueprint("rag", __name__)
rag_tool_agent = None

def ensure_rag_tool_agent():
    """Initialize the RAG-as-tool agent on first use"""
    global rag_tool_agent
    if rag_tool_agent is None:
        print("🚀 Initializing RAG-as-Tool Agent...")
        rag_tool_agent = build_rag_tool_agent()
        print("✅ RAG-as-tool agent ready - LLM will decide when to use knowledge base")

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
def rag_tool_chat():
    """
    MAIN CHAT ENDPOINT - RAG as a Tool Approach
    
    This endpoint:
    1. Sends the query directly to an LLM agent
    2. LLM decides whether to use knowledge base search tool or not
    3. LLM can use multiple tools in sequence as needed
    4. Provides intelligent, context-aware responses
    
    Benefits:
    - LLM decides tool usage intelligently
    - No upfront classification overhead
    - Natural conversation flow
    - Flexible tool combination
    """
    
    ensure_rag_tool_agent()
    
    payload = request.get_json(force=True)
    question = payload.get("question", "").strip()
    holdings = payload.get("holdings", [])
    
    if not question:
        return jsonify({"error": "question required"}), 400
    
    # Overall request timer
    tm = StepTimer("RAG_TOOL_CHAT")
    tm.start(f"q='{question[:50]}...' holdings={len(holdings)}")
    
    try:
        # Use the RAG-as-tool agent
        response = rag_tool_agent.query(question, holdings)
        
        tm.step("RAG-as-tool response generated")
        
        # Enhanced response with tool usage metadata
        api_response = {
            "answer": response["answer"],
            "status": response.get("status", "success"),
            "error": response.get("error", None),
            
            # Tool usage analytics
            "tool_usage": {
                "approach": "rag_as_tool",
                "tools_used": response.get("tools_used", []),
                "knowledge_base_used": response.get("knowledge_base_used", False),
                "total_tool_calls": response.get("total_tool_calls", 0),
                "llm_decided_tools": True  # Key benefit!
            },
            
            # Performance metrics
            "performance": {
                "total_time_ms": response.get("processing_time_ms", 0),
                "approach_benefit": "LLM intelligently decides when to use knowledge base"
            }
        }
        
        return jsonify(api_response)
        
    except Exception as e:
        tm.error(f"failed: {e}")
        return jsonify({"error": str(e)}), 500

# Legacy endpoints for backward compatibility
@rag_bp.route("/rag/query", methods=["POST"])
def rag_query_legacy():
    """Legacy RAG endpoint - now uses RAG-as-tool agent"""
    return rag_tool_chat()

@rag_bp.route("/rag/agent", methods=["POST"])
def rag_agent_legacy():
    """Legacy agent endpoint - now uses RAG-as-tool agent"""
    return rag_tool_chat()

# System information endpoints
@rag_bp.route("/rag/tools", methods=["GET"])
def list_available_tools():
    """List all available tools including RAG search"""
    ensure_rag_tool_agent()
    
    try:
        tools_info = []
        
        # Get all tools from the agent
        for tool in rag_tool_agent.agent.tools:
            tool_info = {
                "name": tool.name,
                "description": tool.description,
                "type": "knowledge_base" if tool.name == "search_knowledge_base" else "market_data"
            }
            tools_info.append(tool_info)
        
        return jsonify({
            "total_tools": len(tools_info),
            "tools": tools_info,
            "approach": "rag_as_tool",
            "benefit": "LLM decides which tools to use based on query context"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route("/rag/debug/tool-decision", methods=["POST"])
def debug_tool_decision():
    """Debug endpoint to see which tools LLM would choose for a query"""
    ensure_rag_tool_agent()
    
    payload = request.get_json(force=True)
    query = payload.get("query", "").strip()
    
    if not query:
        return jsonify({"error": "query required"}), 400
    
    try:
        # Run the agent and capture intermediate steps
        response = rag_tool_agent.query(query)
        
        return jsonify({
            "query": query,
            "tools_decided_by_llm": response.get("tools_used", []),
            "knowledge_base_used": response.get("knowledge_base_used", False),
            "total_tool_calls": response.get("total_tool_calls", 0),
            "answer_preview": response["answer"][:200] + "..." if len(response["answer"]) > 200 else response["answer"],
            "debug": True
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route("/rag/stats", methods=["GET"])
def rag_tool_stats():
    """Get system statistics for RAG-as-tool approach"""
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
            "approach": "rag_as_tool",
            "knowledge_base": "connected",
            "agent_ready": rag_tool_agent is not None,
            "benefits": [
                "LLM intelligently decides when to use knowledge base",
                "No upfront query classification needed",
                "Natural conversation flow",
                "Flexible tool combination",
                "Reduced latency for simple queries"
            ],
            "tools": {
                "knowledge_base_search": "available",
                "market_data_tools": "available",
                "total_tools": len(rag_tool_agent.agent.tools) if rag_tool_agent else 0
            }
        })
        
    except Exception as e:
        return jsonify({
            "status": "error", 
            "error": str(e)
        }), 500