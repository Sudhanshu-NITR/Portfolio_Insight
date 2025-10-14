from langchain.agents import initialize_agent, AgentType
from langchain.prompts import ChatPromptTemplate
from .llm import make_chat_llm
from tools import ALL_TOOLS
from tools.rag_tool import search_knowledge_base
from utils.logging_utils import StepTimer
import time


# Enhanced system prompt for RAG-as-tool approach with final answer instruction
SYSTEM_PROMPT = """You are Portfolio Insight, an intelligent financial assistant for Indian markets.

You have access to several tools:
1. LIVE MARKET DATA TOOLS - For current stock prices, market data, corporate actions, etc.
2. KNOWLEDGE BASE SEARCH - For financial concepts, investment principles, and educational content

IMPORTANT DECISION MAKING:
- For questions about financial CONCEPTS, DEFINITIONS, or PRINCIPLES → Use search_knowledge_base tool first
- For questions about CURRENT PRICES, MARKET DATA, or SPECIFIC COMPANIES → Use live market data tools
- For HYBRID questions → Use both tools as needed
- For PORTFOLIO ANALYSIS → Use live data tools for current prices + knowledge base for analysis frameworks

TOOL USAGE GUIDELINES:
1. Always think about what type of information the user is asking for
2. Use search_knowledge_base when you need theoretical/educational content
3. Use live data tools when you need current market information
4. You can use multiple tools in sequence to build comprehensive answers
5. Explain your reasoning and cite sources when using knowledge base content

RESPONSE QUALITY:
- Provide detailed, well-structured answers
- Explain complex concepts clearly
- Include relevant examples and context
- Avoid personalized financial advice
- Always mention risks and limitations

When you have gathered sufficient information through tools, respond with the final answer prefixed clearly as:

Final Answer:
<your user-facing answer here>

Do not produce additional thoughts or further actions after the final answer.

Remember: You're an intelligent agent that can decide which tools to use based on the user's query. Think step by step about what information you need and which tools can provide it.
"""


class RAGToolAgent:
    def __init__(self):
        self.llm = make_chat_llm()
        
        # Combine market tools with RAG tool
        all_tools = ALL_TOOLS + [search_knowledge_base]
        print("=============Hello There, Initializing....=============")
        
        # Create the agent with all tools including RAG
        self.agent = initialize_agent(
            tools=all_tools,
            llm=self.llm,
            agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=3,  # Limit max tool uses to avoid looping
            agent_kwargs={
                "system_message": SYSTEM_PROMPT,
                "return_intermediate_steps": True,
                "max_tokens": 512,  # Reduce max tokens for quicker completion
                "temperature": 0.3,
                "stop": ["Final Answer:"],  # Stop generation when final answer starts
            }
        )
    
    def query(self, user_question: str, holdings: list = None) -> dict:
        """
        Process query using RAG as a tool approach
        """
        tm = StepTimer("RAG_TOOL_AGENT")
        tm.start(f"processing: {user_question[:60]}...")
        
        try:
            # Prepare enhanced input with holdings context
            holdings_context = f"User's current holdings: {', '.join(holdings)}" if holdings else ""
            
            enhanced_input = f"""
User Question: {user_question}
{holdings_context}


Instructions: Analyze what type of information is needed to answer this question. Use the appropriate tools:
- search_knowledge_base for concepts, definitions, principles, and educational content
- Live market data tools for current prices, market information, and real-time data
- Multiple tools if needed for comprehensive answers

Please give your final answer starting with \"Final Answer:\" once complete. Do not add anything after that.
            """
            
            tm.step("executing agent with tools")
            
            # Execute the agent
            response = self.agent.invoke({"input": enhanced_input})
            
            tm.step("agent response generated")
            
            # Extract tool usage information
            intermediate_steps = response.get("intermediate_steps", [])
            tools_used = []
            knowledge_base_used = False
            
            for step in intermediate_steps:
                if len(step) >= 2:
                    action, observation = step[0], step[1]
                    tool_name = getattr(action, 'tool', 'unknown')
                    tools_used.append(tool_name)
                    
                    if tool_name == "search_knowledge_base":
                        knowledge_base_used = True
            
            raw_output = response.get("output", "")
            # Extract the actual final answer after "Final Answer:" if present
            final_answer = raw_output
            if "Final Answer:" in raw_output:
                final_answer = raw_output.split("Final Answer:",1)[1].strip()
            
            return {
                "answer": final_answer,
                "status": "success",
                "tools_used": tools_used,
                "knowledge_base_used": knowledge_base_used,
                "total_tool_calls": len(intermediate_steps),
                "approach": "rag_as_tool",
                "processing_time_ms": int((time.time() - tm.t0) * 1000) if tm.t0 else 0
            }
            
        except Exception as e:
            tm.error(f"failed: {e}")
            return {
                "answer": f"I apologize, but I encountered an error processing your request: {str(e)}",
                "status": "error",
                "error": str(e),
                "tools_used": [],
                "knowledge_base_used": False,
                "total_tool_calls": 0,
                "approach": "rag_as_tool"
            }


def build_rag_tool_agent():
    """Factory function to create the RAG-as-tool agent"""
    return RAGToolAgent()
