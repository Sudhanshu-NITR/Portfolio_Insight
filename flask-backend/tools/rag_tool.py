from langchain.tools import tool
from pydantic import BaseModel, Field
from rag.retriever import get_retriever
import json

class KnowledgeBaseSearchInput(BaseModel):
    """Input for searching the financial knowledge base"""
    query: str = Field(
        description="The search query for financial concepts, definitions, or principles. "
                   "Use this when you need theoretical knowledge, investment principles, "
                   "financial concepts, or educational content from books and literature."
    )
    num_results: int = Field(
        default=4,
        description="Number of relevant documents to retrieve (1-10)"
    )

@tool("search_knowledge_base", args_schema=KnowledgeBaseSearchInput)
def search_knowledge_base(query: str, num_results: int = 4) -> str:
    """
    Search the financial knowledge base for concepts, principles, and educational content.
    
    Use this tool when you need:
    - Financial definitions and concepts (P/E ratio, diversification, etc.)
    - Investment principles and strategies
    - Educational content from financial books
    - Theoretical knowledge about markets and finance
    - Historical examples and case studies
    
    DO NOT use this for:
    - Current stock prices or market data
    - Live company information
    - Real-time news or updates
    - Portfolio analysis requiring current data
    """
    try:
        retriever = get_retriever()
        
        # Retrieve relevant documents
        docs = retriever.invoke(query)
        
        if not docs:
            return json.dumps({
                "status": "no_results",
                "message": "No relevant information found in knowledge base",
                "query": query
            })
        
        # Limit results
        docs = docs[:min(num_results, len(docs))]
        
        # Format results
        results = []
        for i, doc in enumerate(docs, 1):
            source = doc.metadata.get('source', 'Unknown')
            content = doc.page_content[:1000]  # Limit content length
            
            results.append({
                "result_number": i,
                "source": source,
                "content": content,
                "relevance_score": getattr(doc, 'score', None)
            })
        
        response = {
            "status": "success",
            "query": query,
            "total_results": len(results),
            "results": results,
            "usage_note": "This content is from financial literature and books. Combine with current market data if needed."
        }
        
        return json.dumps(response)
        
    except Exception as e:
        return json.dumps({
            "status": "error",
            "error": str(e),
            "message": "Failed to search knowledge base"
        })