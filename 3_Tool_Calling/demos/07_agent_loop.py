# =============================================================================
# DEMO 07 — The Agent Loop (ReAct Preview)
# AI4SWE · Lecture 3
# =============================================================================
# A single tool call answers one question.
# An agent loop lets the model keep calling tools until it has enough to answer.
# Reason → Act → Observe → Reason → Act → ...  that's the ReAct pattern.
# RUN: python 07_agent_loop.py
# =============================================================================

import os
import json
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.1-8b-instant"

MAX_ITERATIONS = 10

PRODUCTS = {
    "keyboard":     {"name": "Mechanical Keyboard", "in_stock": True,  "qty": 12, "price": 1_800.00},
    "monitor":      {"name": "USB-C Monitor",       "in_stock": True,  "qty": 3,  "price": 12_500.00},
    "laptop stand": {"name": "Laptop Stand",        "in_stock": False, "qty": 0,  "price": 650.00},
    "mouse":        {"name": "Wireless Mouse",      "in_stock": True,  "qty": 45, "price": 890.00},
}

DISCOUNT_CODES = {
    "SAVE10": 0.10,
    "SAVE20": 0.20,
    "VIP30":  0.30,
}


def _find_product(name: str):
    name_lower = name.lower().strip()
    if name_lower in PRODUCTS:
        return name_lower, PRODUCTS[name_lower]
    for key, data in PRODUCTS.items():
        if name_lower in key or name_lower in data["name"].lower():
            return key, data
    return None, None


def get_product_info(name: str) -> dict:
    key, item = _find_product(name)
    if not item:
        return {"error": f"product {name!r} not found", "available": list(PRODUCTS.keys())}
    return {"product": item["name"], "in_stock": item["in_stock"], "qty": item["qty"], "price_etb": item["price"]}


def apply_discount(name: str, code: str) -> dict:
    key, item = _find_product(name)
    if not item:
        return {"error": f"product {name!r} not found", "available": list(PRODUCTS.keys())}
    rate = DISCOUNT_CODES.get(code.upper())
    if rate is None:
        return {"error": f"invalid code {code!r}", "valid_codes": list(DISCOUNT_CODES)}
    price      = item["price"]
    discounted = round(price * (1 - rate), 2)
    return {
        "product":        item["name"],
        "original_price": price,
        "discount":       f"{int(rate * 100)}%",
        "final_price":    discounted,
        "savings":        round(price - discounted, 2),
    }


TOOL_MAP = {
    "get_product_info": get_product_info,
    "apply_discount":   apply_discount,
}

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_product_info",
            "description": "Get stock status and price for a product by name.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Product name: keyboard, mouse, monitor, or laptop stand"},
                },
                "required": ["name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "apply_discount",
            "description": "Apply a discount code to a product and return the final price.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "code": {"type": "string", "description": "Discount code: SAVE10, SAVE20, or VIP30"},
                },
                "required": ["name", "code"],
            },
        },
    },
]

SYSTEM = (
    "You are a shopping assistant. "
    "Available products: keyboard, mouse, monitor, laptop stand. "
    "Use tools to look up real stock and price data — never guess."
)


def agent(query: str) -> str:
    messages = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": query}]

    for _ in range(MAX_ITERATIONS):
        response   = client.chat.completions.create(model=MODEL, tools=TOOLS, messages=messages)
        choice     = response.choices[0]
        tool_calls = choice.message.tool_calls or []

        if not tool_calls:
            return choice.message.content

        messages.append(choice.message)
        for tc in tool_calls:
            args   = json.loads(tc.function.arguments or "{}") or {}
            result = TOOL_MAP[tc.function.name](**args)
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": json.dumps(result)})

    return "[agent stopped — hit MAX_ITERATIONS]"


if __name__ == "__main__":
    print(agent("Is the keyboard in stock?"))
    print()
    print(agent("Is the monitor available? If yes, what's the price with discount code SAVE20?"))
    print()
    print(agent("Check the price of the keyboard and mouse. Which is cheaper? Apply VIP30 to the cheaper one."))
