from flask import Blueprint, request, jsonify
from rag.ingestion import ingest
from rag.rag_chain import build_rag_chain
from rag.agent import build_agent
from config import Config

rag_bp = Blueprint("rag", __name__)
_rag_chain = None
_agent = None

def _ensure():
    global _rag_chain, _agent
    if _rag_chain is None:
        _rag_chain = build_rag_chain()
    if _agent is None:
        _agent = build_agent()

@rag_bp.route("/rag/ingest", methods=["POST"])
def rag_ingest():
    payload = request.get_json(force=True)
    manifest = payload.get("manifest") if isinstance(payload, dict) else (payload if isinstance(payload, list) else None)
    if not isinstance(manifest, list) or not manifest:
        return jsonify({"error": "manifest list required"}), 400
    try:
        res = ingest(manifest)
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


from utils.logging_utils import StepTimer

@rag_bp.route("/rag/query", methods=["POST"])
def rag_query():
    _ensure()
    payload = request.get_json(force=True)
    question = payload.get("question","").strip()
    if not question: return jsonify({"error":"question required"}), 400

    tm = StepTimer("RAG_QUERY")
    tm.start(f"q='{question[:80]}...'")

    try:
        # Force a retriever pass timing by invoking the chain with a wrapper.
        ans = _rag_chain.invoke(question)
        tm.step("generated answer")
        content = getattr(ans, "content", None)
        out = {"answer": content if content is not None else str(ans)}
        print("output-> ", out)
        tm.step("response ready")
        return jsonify(out)
    except Exception as e:
        tm.error(f"failed: {e}")
        return jsonify({"error": str(e)}), 500


@rag_bp.route("/rag/agent", methods=["POST"])
def rag_agent():
    _ensure()
    payload = request.get_json(force=True)
    question = payload.get("question","").strip()
    holdings = payload.get("holdings", [])
    if not question: return jsonify({"error":"question required"}), 400

    plan_hint = f"User holdings: {', '.join(holdings)}. Prefer holdings + benchmarks if relevant." if holdings else ""
    tm = StepTimer("AGENT")
    tm.start(f"q='{question[:80]}...' holdings={len(holdings)}")

    try:
        resp = _agent.invoke({"input": f"{plan_hint}\n\n{question}"})
        tm.step("agent output ready")
        return jsonify({"answer": resp.get("output","")})
    except Exception as e:
        tm.error(f"failed: {e}")
        return jsonify({"error": str(e)}), 500

@rag_bp.route("/rag/debug/stats", methods=["GET"])
def rag_stats():
    from langchain_chroma import Chroma  # or community import if you kept it
    from rag.llm import make_embedder
    db = Chroma(collection_name="advisor_kg", embedding_function=make_embedder(), persist_directory=Config.VECTOR_DB_DIR)
    # Chroma doesn’t expose count directly; keep a small local counter if needed during ingest
    return jsonify({"status":"ok"})