# =============================================================================
# DEMO 02 — The Model as Dispatcher
# AI4SWE · Lecture 3
# =============================================================================
# Three tools defined. Each query routes to the right one — or to no tool.
# No if/else dispatch in your code — the model reads descriptions and routes.
# RUN: python 02_tool_dispatch.py
# =============================================================================

import os
import json
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.1-8b-instant"

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

ORDERS = {
    "4421": {"status": "shipped",    "location": "Nairobi sorting facility", "eta": "2026-05-16"},
    "4422": {"status": "processing", "location": "warehouse",                "eta": "2026-05-18"},
    "4423": {"status": "delivered",  "location": "customer address",         "eta": "delivered"},
}

USERS = {
    "4421": {"name": "Abebe Girma",  "email": "abebe@example.com", "tier": "gold"},
    "4422": {"name": "Sara Tesfaye", "email": "sara@example.com",  "tier": "standard"},
    "4423": {"name": "Yonas Haile",  "email": "yonas@example.com", "tier": "standard"},
}

DOCS = {
    "return policy": "Items can be returned within 30 days of delivery. Original packaging required. Refund issued within 5-7 business days after inspection.",
    "shipping":      "Standard shipping takes 3-5 business days. Express shipping (1-2 days) available at checkout. Free shipping on orders over 500 ETB.",
    "warranty":      "All electronics carry a 12-month manufacturer warranty. Accessories are covered for 6 months.",
}


def get_order_status(order_id: str) -> dict:
    order = ORDERS.get(order_id)
    return {"order_id": order_id, **order} if order else {"error": f"order {order_id!r} not found"}


def get_user_profile(order_id: str) -> dict:
    user = USERS.get(order_id)
    return {"order_id": order_id, **user} if user else {"error": f"no user found for order {order_id!r}"}


def search_docs(query: str) -> dict:
    for keyword, content in DOCS.items():
        if keyword in query.lower():
            return {"topic": keyword, "content": content}
    return {"topic": query, "content": "No documentation found for this query."}


TOOL_MAP = {
    "get_order_status": get_order_status,
    "get_user_profile": get_user_profile,
    "search_docs":      search_docs,
}

SYSTEM = (
    "You are a customer support assistant. "
    "Use tools to look up order status, user profiles, or documentation. "
    "For questions that don't need a tool, answer directly."
)


def run(query: str) -> str:
    messages = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": query}]
    response = client.chat.completions.create(
        model=MODEL, tools=TOOLS, parallel_tool_calls=False, messages=messages
    )
    choice = response.choices[0]

    if not choice.message.tool_calls:
        return choice.message.content

    messages.append(choice.message)
    for tc in choice.message.tool_calls:
        args   = json.loads(tc.function.arguments)
        result = TOOL_MAP[tc.function.name](**args)
        messages.append({"role": "tool", "tool_call_id": tc.id, "content": json.dumps(result)})

    return client.chat.completions.create(model=MODEL, messages=messages).choices[0].message.content


if __name__ == "__main__":
    queries = [
        "What's the status of order #4421?",
        "How does the return policy work?",
        "What's the capital of France?",
    ]

    for query in queries:
        print(f"Q: {query}")
        print(f"A: {run(query)}\n")
