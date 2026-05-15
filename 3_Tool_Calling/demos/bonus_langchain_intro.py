# =============================================================================
# BONUS — LangChain Introduction
# AI4SWE · Lecture 3
# =============================================================================
# LangChain wraps tool calling in a higher-level API.
# Part 1: bind_tools        — tool calling, loop still yours
# Part 2: create_react_agent — full loop hidden inside LangGraph
# REQUIRES: uv add langchain-openai langchain-anthropic langchain-core langchain
# RUN: python bonus_langchain_intro.py
# =============================================================================

import os
import warnings
warnings.filterwarnings("ignore")
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

try:
    from langchain_openai import ChatOpenAI
    from langchain_anthropic import ChatAnthropic
    from langchain_core.tools import tool
    from langchain_core.messages import HumanMessage, ToolMessage
    from langchain.agents import create_react_agent as create_agent
except ImportError:
    try:
        from langgraph.prebuilt import create_react_agent as create_agent
    except ImportError:
        print("Missing dependencies.")
        print("Run: uv add langchain-openai langchain-anthropic langchain-core langchain langgraph")
        raise SystemExit(1)

QUESTION = "What's the weather in Addis Ababa?"

GROQ_MODEL = ChatOpenAI(
    api_key=os.environ["GROQ_API_KEY"],
    base_url="https://api.groq.com/openai/v1",
    model="llama-3.1-8b-instant",
)

ANTHROPIC_KEY   = os.environ.get("ANTHROPIC_API_KEY")
ANTHROPIC_MODEL = ChatAnthropic(model="claude-haiku-4-5-20251001") if ANTHROPIC_KEY else None

MOCK_WEATHER = {
    "Addis Ababa": "22°C, sunny, humidity 45%",
    "London":      "12°C, cloudy, humidity 80%",
    "Cairo":       "31°C, clear, humidity 22%",
}


@tool
def get_weather(location: str) -> str:
    """Get the current weather for a city. Call when the user asks about
    weather, temperature, or conditions in a specific location."""
    return MOCK_WEATHER.get(location, "20°C, unknown conditions")


# Part 1: bind_tools — tool loop still yours
def run_bind_tools(model):
    model_with_tools = model.bind_tools([get_weather])
    response = model_with_tools.invoke([HumanMessage(content=QUESTION)])

    if not response.tool_calls:
        print(f"  → {response.content}")
        return

    call   = response.tool_calls[0]
    result = get_weather.invoke(call["args"])
    print(f"  tool: {call['name']}({call['args']}) → {result}")

    messages = [
        HumanMessage(content=QUESTION),
        response,
        ToolMessage(content=result, tool_call_id=call["id"]),
    ]
    final = model_with_tools.invoke(messages)
    print(f"  → {final.content}")


# Part 2: create_react_agent — loop fully hidden inside LangGraph
def run_react_agent(model):
    react_agent = create_agent(model, [get_weather])
    result      = react_agent.invoke({"messages": [{"role": "user", "content": QUESTION}]})
    print(f"  → {result['messages'][-1].content}")


if __name__ == "__main__":
    print(f"Question: {QUESTION}\n")

    print("[Part 1 — bind_tools, loop still yours]")
    run_bind_tools(GROQ_MODEL)
    print()

    print("[Part 2 — create_react_agent, loop hidden inside LangGraph]")
    if ANTHROPIC_MODEL:
        run_react_agent(ANTHROPIC_MODEL)
    else:
        print("  Skipped — Groq Llama models are incompatible with LangGraph's system prompt.")
        print("  Add ANTHROPIC_API_KEY to .env to run this part.")
