from langchain.agents import initialize_agent, AgentType
from langchain.schema import BaseRetriever
from langchain.schema.runnable import RunnablePassthrough
from langchain.prompts import ChatPromptTemplate
from .llm import make_chat_llm
from .retriever import get_retriever
from tools import ALL_TOOLS
import json

# Enhanced system prompt that combines RAG and agentic capabilities
UNIFIED_SYSTEM_PROMPT = """
You are Portfolio Insight, an intelligent financial assistant for Indian markets.

You have access to:
1. KNOWLEDGE BASE: Embedded financial books and investment literature.
2. LIVE DATA TOOLS: Real-time market data, quotes, corporate actions, forecasts, and analysis tools.

Instructions for handling each user query:

1. Query Type Classification:
   - Purely conceptual or educational questions (e.g., financial principles, investing ideas) should be answered ONLY using your knowledge base.
     Do NOT invoke live data tools or fetch company/ticker data unless explicitly requested.
   - Questions explicitly mentioning company names, stock tickers, or requests for current data should use relevant live data tools combined with knowledge base context.
   - Hybrid questions (concept plus current data) should combine both sources coherently.

2. Retrieval Protocol:
   - Always retrieve relevant context from your knowledge base first.
   - Use only the most pertinent concepts, definitions, or examples.
   - If the retrieved context contains company examples NOT referenced by the user query, DO NOT fetch live data for those companies.

3. Tool Usage Rules:
   - Use live data tools (e.g., get_current_quotes, get_intraday_data) ONLY if the user requests specific company data or current market information.
   - Avoid tool invocation for theoretical or general queries.

4. Response Guidelines:
   - Provide detailed, multi-sentence explanations for conceptual queries, including examples from knowledge base (no live data unless requested).
   - When live data is used, interpret and explain these results in light of relevant financial principles.
   - Structure your response clearly, use accessible language, and avoid personalized financial, tax, or legal advice.
   - Cite sources from your knowledge base wherever relevant.
   - Summarize risks and limitations especially when interpreting live data.

5. Company Name to Ticker Mapping:
   - When a user mentions a company or stock name without a ticker, automatically convert it internally to the correct ticker symbol with exchange suffix (e.g., Reliance → RELIANCE.NS) before querying live data tools.
   - Do not ask the user to provide ticker symbols.

Remember: Your role is to blend deep financial knowledge with up-to-date market intelligence, providing insightful, accurate, and contextual answers.
"""


class UnifiedRAGAgent:
    def __init__(self):
        self.llm = make_chat_llm()
        self.retriever = get_retriever()
        self.tools = ALL_TOOLS
        
        # Create the unified agent that can use both retrieval and tools
        self.agent = initialize_agent(
            tools=self.tools,
            llm=self.llm,
            agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
            verbose=False,
            handle_parsing_errors=True,
            agent_kwargs={
                "system_message": UNIFIED_SYSTEM_PROMPT,
                "memory_key": "chat_history",
                "return_intermediate_steps": True
            }
        )
    
    def _get_relevant_context(self, query: str) -> str:
        """Retrieve relevant context from knowledge base"""
        try:
            docs = self.retriever.invoke(query)
            if not docs:
                return "No relevant context found in knowledge base."
            
            context = "\\n\\n".join([
                f"Source: {doc.metadata.get('source', 'Unknown')}\\n{doc.page_content[:800]}"
                for doc in docs[:4]  # Limit to top 4 most relevant documents
            ])
            return context
        except Exception as e:
            print(f"Error retrieving context: {e}")
            return "Unable to retrieve context from knowledge base."
    
    def query(self, user_question: str, holdings: list = None) -> dict:
        """
        Main query method that combines RAG retrieval with agentic tool usage
        """
        try:
            # Step 1: Get relevant context from knowledge base
            context = self._get_relevant_context(user_question)
            
            # Step 2: Prepare the enhanced input with context and holdings
            holdings_context = f"\\nUser's current holdings: {', '.join(holdings)}" if holdings else ""
            
            enhanced_input = f"""KNOWLEDGE BASE CONTEXT:
{context}

USER QUERY: {user_question}{holdings_context}

Instructions: Use the knowledge base context as foundation. If the query requires current market data, use appropriate tools. Combine both sources to provide comprehensive insights."""

            # Step 3: Execute the agent
            response = self.agent.invoke({"input": enhanced_input})
            
            return {
                "answer": response.get("output", ""),
                "context_retrieved": True,
                "tools_used": len(response.get("intermediate_steps", [])) > 0,
                "status": "success"
            }
            
        except Exception as e:
            print(f"Unified agent error: {e}")
            return {
                "answer": f"I apologize, but I encountered an error processing your request: {str(e)}",
                "context_retrieved": False,
                "tools_used": False,
                "status": "error",
                "error": str(e)
            }

def build_unified_agent():
    """Factory function to create the unified agent"""
    return UnifiedRAGAgent()
