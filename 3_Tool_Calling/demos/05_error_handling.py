# =============================================================================
# DEMO 05 — Error Handling in the Loop
# AI4SWE · Lecture 3
# =============================================================================
# Tools fail. External APIs time out. Invalid inputs get passed.
# Return the error in the tool message — the model adapts gracefully.
# RUN: python 05_error_handling.py
# =============================================================================

import os
import json
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.1-8b-instant"

SYSTEM = (
    "You are a banking assistant. When a tool returns an error, "
    "apologize and explain the service is temporarily unavailable. "
    "Do not retry the tool call."
)

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_account_balance",
            "description": "Get the current balance of a bank account by account ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "account_id": {"type": "string"}
                },
                "required": ["account_id"],
            },
        },
    }
]


def get_account_balance(account_id: str, fail: bool = False) -> dict:
    if fail:
        raise TimeoutError("upstream banking service unavailable")
    return {"account_id": account_id, "balance": 12450.75, "currency": "ETB"}


def run(messages: list, fail: bool) -> str:
    response   = client.chat.completions.create(
        model=MODEL, tools=TOOLS,
        messages=[{"role": "system", "content": SYSTEM}] + messages,
    )
    choice     = response.choices[0]
    tool_calls = choice.message.tool_calls or []

    if not tool_calls:
        return choice.message.content

    tc         = tool_calls[0]
    account_id = json.loads(tc.function.arguments)["account_id"]

    try:
        content = json.dumps(get_account_balance(account_id, fail=fail))
    except Exception as e:
        content = f"Error: {e}"

    messages = messages + [
        choice.message,
        {"role": "tool", "tool_call_id": tc.id, "content": content},
    ]
    final = client.chat.completions.create(
        model=MODEL, tools=TOOLS,
        messages=[{"role": "system", "content": SYSTEM}] + messages,
    )
    return final.choices[0].message.content


if __name__ == "__main__":
    query = [{"role": "user", "content": "What's the balance on account ACC-9921?"}]

    print("Success:", run(query, fail=False))
    print()
    print("Failure:", run(query, fail=True))
