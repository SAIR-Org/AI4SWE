# =============================================================================
# BONUS — LangChain Introduction
# AI4SWE · Lecture 3
# =============================================================================
# LangChain wraps tool calling in a higher-level API.
# This demo shows: what LangChain does, what it hides, and why we go raw.
#
# Part 1: bind_tools        — tool calling, loop still yours (Groq)
# Part 2: create_react_agent — full loop hidden inside LangGraph
# Part 3: provider swap      — same code, one line → Anthropic works too
# Part 4: side-by-side       — what raw SDK exposes that LangChain hides
#
# REQUIRES: uv add langchain-openai langchain-anthropic langchain-core langchain
# RUN:      python bonus_langchain_intro.py
# =============================================================================

import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

try:
    from langchain_openai import ChatOpenAI
    from langchain_anthropic import ChatAnthropic
    from langchain_core.tools import tool
    from langchain_core.messages import HumanMessage, ToolMessage
    from langgraph.prebuilt import create_react_agent
except ImportError:
    print("Missing dependencies.")
    print("Run: uv add langchain-openai langchain-anthropic langchain-core langchain")
    raise SystemExit(1)

QUESTION = "What's the weather in Addis Ababa?"

# Groq via OpenAI-compatible endpoint — free, key already in .env
GROQ_MODEL = ChatOpenAI(
    api_key=os.environ["GROQ_API_KEY"],
    base_url="https://api.groq.com/openai/v1",
    model="llama-3.3-70b-versatile",
)
ANTHROPIC_MODEL = ChatAnthropic(model="claude-haiku-4-5-20251001")

MOCK_WEATHER = {
    "Addis Ababa": "22°C, sunny, humidity 45%",
    "London":      "12°C, cloudy, humidity 80%",
    "Cairo":       "31°C, clear, humidity 22%",
}


# ── @tool — schema built from docstring + type hints automatically ─────────

@tool
def get_weather(location: str) -> str:
    """Get the current weather for a city. Call when the user asks about
    weather, temperature, or conditions in a specific location."""
    return MOCK_WEATHER.get(location, "20°C, unknown conditions")


# ── Part 1: bind_tools — loop still yours ─────────────────────────────────

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


# ── Part 2: create_react_agent — loop fully hidden ────────────────────────

def run_react_agent(model):
    agent  = create_react_agent(model, [get_weather])
    result = agent.invoke({"messages": [{"role": "user", "content": QUESTION}]})
    print(f"  → {result['messages'][-1].content}")


if __name__ == "__main__":
    print("=" * 60)
    print(f"Question: {QUESTION}\n")

    # Part 1
    print("[PART 1 — bind_tools (Groq, loop still yours)]")
    run_bind_tools(GROQ_MODEL)
    print()

    # Part 2
    print("[PART 2 — create_react_agent (Groq, loop fully hidden)]")
    run_react_agent(GROQ_MODEL)
    print("  tool detection, result injection, loop — all inside LangGraph\n")

    # Part 3
    print("[PART 3 — SAME CODE, ANTHROPIC MODEL (one line changed)]")
    run_react_agent(ANTHROPIC_MODEL)
    print()

    # Part 4
    print("[PART 4 — LANGCHAIN vs RAW SDK]")
    print()
    print("  LANGCHAIN                          RAW SDK")
    print("  ─────────────────────────────────  ──────────────────────────────────────")
    print("  @tool (docstring → schema)         Manual JSON schema — you write it")
    print("  bind_tools([get_weather])          tools=[{name, description, ...}]")
    print("  response.tool_calls                finish_reason == 'tool_calls' check")
    print("  ToolMessage(content, id)           {role: 'tool', tool_call_id, content}")
    print("  create_react_agent loops for you   while finish_reason == 'tool_calls':")
    print("  ChatOpenAI / ChatAnthropic         provider-specific client + base_url")
    print()
    print("  LangChain advantage: provider-agnostic. Swap one line, same code runs.")
    print("  Raw SDK advantage:   every step visible. Debuggable. No magic.")
    print()
    print("  This course teaches raw SDK so the framework is obvious — not magic.")
