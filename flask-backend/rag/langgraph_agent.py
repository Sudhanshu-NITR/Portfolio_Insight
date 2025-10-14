from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
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
    """Decide whether to continue with tools or end - FIXED VERSION"""
    messages = state["messages"]
    last_message = messages[-1]
    
    # FIXED: Check for tool calls in AIMessage
    if isinstance(last_message, AIMessage):
        # Check if the message has tool_calls attribute and it's not empty
        if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
            print(f"🔧 Tool calls detected: {len(last_message.tool_calls)} tools")
            return "tools"
        
        # Fallback: check additional_kwargs for tool calls
        if hasattr(last_message, 'additional_kwargs'):
            tool_calls = last_message.additional_kwargs.get('tool_calls', [])
            if tool_calls:
                print(f"🔧 Tool calls found in additional_kwargs: {len(tool_calls)} tools")
                return "tools"
    
    # If no tool calls found, end the conversation
    print("✅ No tool calls detected, ending conversation")
    return END

def filter_messages_for_gemini(messages):
    """
    CRITICAL FIX: Filter and format messages for Gemini compatibility
    """
    filtered_messages = []
    
    for message in messages:
        # Skip empty messages
        if not hasattr(message, 'content') or not message.content:
            if not isinstance(message, ToolMessage):
                continue
        
        # Handle different message types
        if isinstance(message, SystemMessage):
            # Keep system message as-is
            filtered_messages.append(message)
            
        elif isinstance(message, HumanMessage):
            # Keep human message as-is
            filtered_messages.append(message)
            
        elif isinstance(message, AIMessage):
            # For AI messages, ensure content exists
            if hasattr(message, 'content') and message.content:
                filtered_messages.append(message)
            elif hasattr(message, 'tool_calls') and message.tool_calls:
                # If AI message has tool calls but no content, add placeholder content
                new_message = AIMessage(
                    content="I'll use tools to help answer your question.",
                    tool_calls=message.tool_calls
                )
                filtered_messages.append(new_message)
                
        elif isinstance(message, ToolMessage):
            # Convert ToolMessage to HumanMessage for Gemini compatibility
            if hasattr(message, 'content') and message.content:
                tool_response = HumanMessage(
                    content=f"Tool response: {message.content}"
                )
                filtered_messages.append(tool_response)
    
    return filtered_messages

def call_model(state: AgentState):
    """Call the LLM to generate response or tool calls - GEMINI FIXED VERSION"""
    messages = state["messages"]
    
    # Add system message at the start if not present
    if not messages or not isinstance(messages, SystemMessage):
        system_msg = SystemMessage(content=SYSTEM_MESSAGE)
        messages = [system_msg] + messages
    
    # CRITICAL FIX: Filter messages for Gemini compatibility
    filtered_messages = filter_messages_for_gemini(messages)
    
    if not filtered_messages:
        # Fallback if no valid messages
        filtered_messages = [
            SystemMessage(content=SYSTEM_MESSAGE),
            HumanMessage(content=state.get("user_question", "Please help me with financial analysis."))
        ]
    
    # Get LLM response
    llm = make_chat_llm()
    
    # Ensure all tools are available including search_knowledge_base
    all_tools = ALL_TOOLS.copy()
    tool_names = [tool.name for tool in all_tools]
    if "search_knowledge_base" not in tool_names:
        all_tools.append(search_knowledge_base)
        print("✅ Added search_knowledge_base to tools list")
    
    print(f"🔧 Available tools: {[tool.name for tool in all_tools]}")
    
    # Bind tools to the model
    llm_with_tools = llm.bind_tools(all_tools)
    
    print("🤖 Invoking LLM with tools...")
    print(f"📝 Sending {len(filtered_messages)} filtered messages to Gemini")
    
    try:
        response = llm_with_tools.invoke(filtered_messages)
    except Exception as e:
        print(f"❌ LLM invocation failed: {str(e)}")
        # Create fallback response
        response = AIMessage(content=f"I apologize, but I encountered an error: {str(e)}")
    
    # Track tool usage
    tools_used = state.get("tools_used", [])
    knowledge_base_used = state.get("knowledge_base_used", False)
    
    # Check for tool calls in response
    if hasattr(response, 'tool_calls') and response.tool_calls:
        print(f"🔧 LLM wants to use {len(response.tool_calls)} tools")
        for tool_call in response.tool_calls:
            tool_name = tool_call.get("name", "unknown")
            print(f"  - Tool: {tool_name}")
            tools_used.append(tool_name)
            if tool_name == "search_knowledge_base":
                knowledge_base_used = True
    else:
        print("💬 LLM provided direct response (no tool calls)")
    
    return {
        "messages": messages + [response],
        "tools_used": tools_used,
        "knowledge_base_used": knowledge_base_used
    }

class LangGraphRAGAgent:
    def __init__(self):
        self.graph = self._build_graph()
        self.compiled_graph = self.graph.compile()
        print("✅ LangGraph RAG Agent initialized successfully (Gemini-compatible)")
    
    def _build_graph(self):
        """Build the LangGraph workflow - GEMINI FIXED VERSION"""
        # Create the graph
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("agent", call_model)
        
        # Create tool node with ALL available tools
        all_tools = ALL_TOOLS.copy()
        tool_names = [tool.name for tool in all_tools]
        if "search_knowledge_base" not in tool_names:
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
        
        print(f"🔧 LangGraph workflow built with {len(all_tools)} tools (Gemini-compatible)")
        return workflow
    
    def query(self, user_question: str, holdings: list = None) -> dict:
        """Process query using LangGraph RAG agent - GEMINI FIXED VERSION"""
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
            
            # Find the last AI message with content
            for message in reversed(messages):
                if isinstance(message, AIMessage):
                    # Skip messages that only contain tool calls
                    if hasattr(message, 'tool_calls') and message.tool_calls and not message.content:
                        continue
                    if message.content and message.content.strip():
                        final_answer = message.content
                        break
            
            if not final_answer:
                final_answer = "I apologize, but I couldn't generate a response. Please try rephrasing your question."
            
            print(f"✅ Final answer generated: {len(final_answer)} characters")
            print(f"🔧 Tools used: {final_state.get('tools_used', [])}")
            
            return {
                "answer": final_answer,
                "status": "success",
                "tools_used": final_state.get("tools_used", []),
                "knowledge_base_used": final_state.get("knowledge_base_used", False),
                "total_tool_calls": len(final_state.get("tools_used", [])),
                "approach": "langgraph-gemini-fixed",
                "processing_time_ms": int((time.time() - final_state["processing_start"]) * 1000)
            }
            
        except Exception as e:
            tm.error(f"failed: {e}")
            print(f"❌ LangGraph Agent Error: {str(e)}")
            return {
                "answer": f"I apologize, but I encountered an error processing your request: {str(e)}",
                "status": "error",
                "error": str(e),
                "tools_used": [],
                "knowledge_base_used": False,
                "total_tool_calls": 0,
                "approach": "langgraph-gemini-fixed"
            }

def build_langgraph_agent():
    """Factory function to create the LangGraph agent"""
    return LangGraphRAGAgent()
