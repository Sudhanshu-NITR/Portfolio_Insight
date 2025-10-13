from langchain.agents import initialize_agent, AgentType
from .llm import make_chat_llm
from tools import ALL_TOOLS

SYSTEM = """You are Portfolio Insight, an agentic assistant for Indian markets.
Use tools for live data (quotes, ranges, intraday, corporate actions, forecasts, trending).
Combine with retrieved knowledge to explain what numbers mean.
Include risks and benchmarks; avoid individualized tax/legal advice."""

def build_agent():
    llm = make_chat_llm()
    agent = initialize_agent(
        tools=ALL_TOOLS,
        llm=llm,
        agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
        verbose=False,
        handle_parsing_errors=True,
        agent_kwargs={"system_message": SYSTEM}
    )
    return agent
