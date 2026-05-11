# =============================================================================
# DEMO 02 — The Model as Dispatcher
# AI4SWE · Lecture 3
# =============================================================================
# Three tools defined. Query needs two of them. Model picks exactly right.
# No if/else dispatch in your code — the model reads descriptions and routes.
# Watch: search_docs is never called even though all 3 tools are available.
# RUN: python 02_tool_dispatch.py
# =============================================================================

import os
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.1-8b-instant"

QUERIES = [
    "What's the status of order #4421?",          # → get_order_status
    "How does the return policy work?",            # → search_docs
    "What's the capital of France?",               # → no tool
]

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_docs",
            "description": (
                "Search the product documentation and knowledge base for general information "
                "about features, policies, or how-to guides. Use when the user asks how something works."
            ),
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_profile",
            "description": (
                "Retrieve a customer's name, email, and account details by order ID or user ID. "
                "Use when you need to know who placed an order or who a customer is."
            ),
            "parameters": {
                "type": "object",
                "properties": {"order_id": {"type": "string"}},
                "required": ["order_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_order_status",
            "description": (
                "Get the current shipping status, location, and estimated delivery date "
                "for a specific order. Use when the user asks about an order."
            ),
            "parameters": {
                "type": "object",
                "properties": {"order_id": {"type": "string"}},
                "required": ["order_id"],
            },
        },
    },
]


def get_tool_calls(query: str) -> list:
    response = client.chat.completions.create(
        model=MODEL,
        tools=TOOLS,
        parallel_tool_calls=False,   # one tool at a time — Demo 03 shows parallel
        messages=[{"role": "user", "content": query}],
    )
    return response.choices[0].message.tool_calls or []


if __name__ == "__main__":
    print("=" * 60)
    print("3 tools available: search_docs | get_user_profile | get_order_status\n")

    for query in QUERIES:
        print(f"Query: {query}")
        calls = get_tool_calls(query)
        if calls:
            for c in calls:
                print(f"  → {c.function.name}({c.function.arguments})")
        else:
            print("  → (no tool called — model answered directly)")
        print()

    print("Each query routed to a different tool — or no tool at all.")
    print("Three tools available. Model picks the right one each time.")
    print("No if/else in your code. Descriptions are the dispatch table.")
