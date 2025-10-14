from langchain.tools import tool
from pydantic import BaseModel, Field
from rag.retriever import get_retriever

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
            return "No relevant information found in knowledge base."
        
        # Limit results
        docs = docs[:min(num_results, len(docs))]
        
        # Format results into a single concatenated string for tool response
        content_pieces = []
        for i, doc in enumerate(docs, 1):
            source = doc.metadata.get('source', 'Unknown')
            snippet = doc.page_content[:1000]  # Limit content length
            content_pieces.append(f"Source: {source}\n{snippet}\n")
        
        combined_content = "\n---\n".join(content_pieces)
        
        return combined_content
        
    except Exception as e:
        return f"Failed to search knowledge base due to error: {str(e)}"
