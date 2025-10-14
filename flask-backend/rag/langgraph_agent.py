from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain.tools import tool
import json
import time
from utils.logging_utils import StepTimer
from .llm import make_chat_llm
from tools import ALL_TOOLS
from tools.rag_tool import search_knowledge_base


# System message for the agent
SYSTEM_MESSAGE = """You are Portfolio Insight, an intelligent financial assistant for Indian markets.

You have access to several tools:
1. LIVE MARKET DATA TOOLS - For current stock prices, market data, corporate actions, etc.
2. KNOWLEDGE BASE SEARCH - For financial concepts, investment principles, and educational content

DECISION MAKING:
- For questions about financial CONCEPTS, DEFINITIONS, or PRINCIPLES → Use search_knowledge_base tool
- For questions about CURRENT PRICES, MARKET DATA, or SPECIFIC COMPANIES → Use live market data tools
- For HYBRID questions → Use both tools as needed
- For PORTFOLIO ANALYSIS → Use live data tools for current prices + knowledge base for analysis frameworks

RESPONSE GUIDELINES:
- Provide detailed, well-structured answers
- Explain complex concepts clearly
- Include relevant examples and context
- Avoid personalized financial advice
- Always mention risks and limitations

Think step by step about what information you need and which tools can provide it.
"""


# Define the agent state
class AgentState(TypedDict):
    messages: Annotated[List, "The conversation messages"]
    user_question: str
    holdings: List[str]
    tools_used: List[str]
    knowledge_base_used: bool
    processing_start: float


def should_continue(state: AgentState):
    """Decide whether to continue with tools or end"""
    messages = state["messages"]
    last_message = messages[-1]
    
    # Check if the last message contains tool calls information
    # Adapt this based on how your LLM attaches tool_calls metadata
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    # Alternative check: if last_message is AIMessage and output shows tool call JSON
    if isinstance(last_message, AIMessage):
        output = last_message.content
        if output and '"action"' in output.lower():
            # Found tool call in output string, trigger tools
            return "tools"

    # Otherwise, we're done
    return END

def call_model(state: AgentState):
    """Call the LLM to generate response or tool calls"""
    messages = state["messages"]
    
    # Add system message at the start if not present
    if not messages or not isinstance(messages[0], SystemMessage):
        system_msg = SystemMessage(content=SYSTEM_MESSAGE)
        messages = [system_msg] + messages
    
    # Get LLM response
    llm = make_chat_llm()
    
    # Bind tools to the model
    all_tools = ALL_TOOLS
    if search_knowledge_base not in all_tools:
        all_tools.append(search_knowledge_base)
    llm_with_tools = llm.bind_tools(all_tools)
    
    print("Verbose: Invoking LLM with tools and messages:")
    for msg in messages:
        print(f"- {type(msg).__name__}: {msg.content[:100]}...")  # Print partial content for brevity
    
    response = llm_with_tools.invoke(messages)
    
    print(f"Verbose: LLM responded. Tool calls: {getattr(response, 'tool_calls', None)}")
    
    # Track tool usage
    tools_used = state.get("tools_used", [])
    knowledge_base_used = state.get("knowledge_base_used", False)
    
    if hasattr(response, 'tool_calls') and response.tool_calls:
        for tool_call in response.tool_calls:
            tool_name = tool_call.get("name", "unknown")
            print(f"Verbose: Tool used - {tool_name}")
            tools_used.append(tool_name)
            if tool_name == "search_knowledge_base":
                knowledge_base_used = True
    
    return {
        "messages": messages + [response],
        "tools_used": tools_used,
        "knowledge_base_used": knowledge_base_used
    }


def handle_tool_response(state: AgentState):
    """Process tool responses and add them to messages"""
    messages = state["messages"]
    last_message = messages[-1]
    
    # The ToolNode will handle the tool execution
    # This function mainly updates the state
    print("Verbose: Handling tool response. No changes to state done here.")
    return state


class LangGraphRAGAgent:
    def __init__(self):
        self.graph = self._build_graph()
        self.compiled_graph = self.graph.compile()
    
    def _build_graph(self):
        """Build the LangGraph workflow"""
        # Create the graph
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("agent", call_model)
        
        # Create tool node with all tools
        all_tools = ALL_TOOLS
        if search_knowledge_base not in all_tools:
            all_tools.append(search_knowledge_base)
        tool_node = ToolNode(all_tools)
        workflow.add_node("tools", tool_node)
        
        # Add edges
        workflow.add_edge(START, "agent")
        workflow.add_conditional_edges(
            "agent",
            should_continue,
            {
                "tools": "tools",
                END: END
            }
        )
        workflow.add_edge("tools", "agent")
        
        return workflow
    
    def query(self, user_question: str, holdings: list = None) -> dict:
        """
        Process query using LangGraph RAG agent
        """
        tm = StepTimer("LANGGRAPH_AGENT")
        tm.start(f"processing: {user_question[:60]}...")
        
        try:
            holdings = holdings or []
            holdings_context = f"User's current holdings: {', '.join(holdings)}" if holdings else ""
            
            # Prepare the input message
            user_message = f"""
User Question: {user_question}
{holdings_context}

Please analyze what information is needed and use appropriate tools to provide a comprehensive answer.
            """
            
            # Initial state
            initial_state = {
                "messages": [HumanMessage(content=user_message)],
                "user_question": user_question,
                "holdings": holdings,
                "tools_used": [],
                "knowledge_base_used": False,
                "processing_start": time.time()
            }
            
            tm.step("executing LangGraph workflow")
            
            # Execute the graph
            final_state = self.compiled_graph.invoke(initial_state)
            
            tm.step("workflow completed")
            
            # Extract the final answer
            messages = final_state["messages"]
            final_answer = ""
            
            # Find the last AI message without tool calls
            for message in reversed(messages):
                if isinstance(message, AIMessage) and not hasattr(message, 'tool_calls'):
                    final_answer = message.content
                    break
                elif isinstance(message, AIMessage) and message.content:
                    final_answer = message.content
                    break
            
            print(f"Verbose: Final answer extracted: {final_answer[:200]}...")
            print(f"Verbose: Tools used: {final_state.get('tools_used')}")
            print(f"Verbose: Knowledge base used: {final_state.get('knowledge_base_used')}")
            
            return {
                "answer": final_answer,
                "status": "success",
                "tools_used": final_state.get("tools_used", []),
                "knowledge_base_used": final_state.get("knowledge_base_used", False),
                "total_tool_calls": len(final_state.get("tools_used", [])),
                "approach": "langgraph",
                "processing_time_ms": int((time.time() - final_state["processing_start"]) * 1000)
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
                "approach": "langgraph"
            }


def build_langgraph_agent():
    """Factory function to create the LangGraph agent"""
    return LangGraphRAGAgent()
