# =============================================================================
# DEMO 05 — Error Handling in the Loop
# AI4SWE · Lecture 3
# =============================================================================
# Tools fail. External APIs time out. Invalid inputs get passed.
# Return the error in the tool message — the model adapts gracefully.
# Never swallow errors silently. The model adapts if you tell it what happened.
# RUN: python 05_error_handling.py
# =============================================================================

import os
import json
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.1-8b-instant"

QUERY  = "What's the balance on account ACC-9921?"
SYSTEM = (
    "You are a banking assistant. When a tool returns an error, "
    "apologize to the user and explain the service is temporarily unavailable. "
    "Do not attempt to retry the tool call."
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
                    "account_id": {"type": "string", "description": "The account identifier"}
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
    full_messages = [{"role": "system", "content": SYSTEM}] + messages
    response = client.chat.completions.create(
        model=MODEL, tools=TOOLS, messages=full_messages
    )

    choice     = response.choices[0]
    tool_calls = choice.message.tool_calls or []

    if not tool_calls:
        return choice.message.content

    tool_call  = tool_calls[0]
    account_id = json.loads(tool_call.function.arguments)["account_id"]
    print(f"  [tool called]  {tool_call.function.name}(account_id={account_id!r})")

    is_error = False
    try:
        result   = get_account_balance(account_id, fail=fail)
        content  = json.dumps(result)
        print(f"  [tool result]  {result}")
    except Exception as e:
        content  = f"Error: {e}"
        is_error = True
        print(f"  [tool error]   {e}")

    messages = messages + [
        choice.message,
        {
            "role":         "tool",
            "tool_call_id": tool_call.id,
            "content":      content,
        },
    ]

    full_messages = [{"role": "system", "content": SYSTEM}] + messages
    final = client.chat.completions.create(
        model=MODEL,
        tools=TOOLS,
        messages=full_messages,
    )
    return final.choices[0].message.content


if __name__ == "__main__":
    print("=" * 60)
    print(f"Query: {QUERY}\n")

    print("[SUCCESS — tool works normally]")
    answer = run([{"role": "user", "content": QUERY}], fail=False)
    print(f"  → {answer}\n")

    print("[FAILURE — tool raises an exception]")
    answer = run([{"role": "user", "content": QUERY}], fail=True)
    print(f"  → {answer}\n")

    print("The loop never crashed. The model adapted to what it was told.")
    print("Return the error string as content — the model handles recovery.")
