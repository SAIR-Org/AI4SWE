# =============================================================================
# BONUS — Gemini Drop-in Test
# AI4SWE · Lecture 3
# =============================================================================
# Google Gemini has a FREE tier — no credit card, no payment needed.
# It exposes an OpenAI-compatible endpoint, so the code is identical
# to the Groq demos. Only 3 lines change.
#
# FREE TIER LIMITS (Gemini 2.0 Flash):
#   15 requests/min · 1M tokens/min · 1500 requests/day
#
# SETUP:
#   1. Go to aistudio.google.com
#   2. Click "Get API Key" — sign in with Google account
#   3. Add to .env:  GEMINI_API_KEY=your_key_here
#   4. uv run bonus_gemini_test.py
#
# NO extra package needed — uses openai SDK already installed.
# =============================================================================

import os
import json
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# ── The only 3 lines that differ from the Groq demos ──────────────────────
client = OpenAI(
    api_key=os.environ["GEMINI_API_KEY"],
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)
MODEL = "gemini-2.0-flash"
# ── Everything below is identical to 01_first_tool_call.py ────────────────

QUESTION = "What's the weather like in Addis Ababa right now?"

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": (
                "Get the current weather conditions for a city. "
                "Call this when the user asks about weather, temperature, or conditions in a location."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name, e.g. 'Addis Ababa'",
                    }
                },
                "required": ["location"],
            },
        },
    }
]

MOCK_WEATHER = {
    "Addis Ababa": {"temp_c": 22, "condition": "sunny",  "humidity": 45},
    "London":      {"temp_c": 12, "condition": "cloudy", "humidity": 80},
    "Cairo":       {"temp_c": 31, "condition": "clear",  "humidity": 25},
}


def get_weather(location: str) -> dict:
    return MOCK_WEATHER.get(location, {"temp_c": 20, "condition": "unknown", "humidity": 60})


TOOL_MAP = {"get_weather": get_weather}


def execute_tool(name: str, args: dict) -> dict:
    fn = TOOL_MAP.get(name)
    if fn is None:
        raise ValueError(f"unknown tool: {name}")
    return fn(**args)


def run_tool_loop(messages: list, max_iterations: int = 10) -> str:
    for iteration in range(max_iterations):
        response = client.chat.completions.create(
            model=MODEL,
            tools=TOOLS,
            messages=messages,
        )

        choice     = response.choices[0]
        tool_calls = choice.message.tool_calls or []

        if not tool_calls:
            return choice.message.content

        messages = messages + [choice.message]

        for tc in tool_calls:
            name   = tc.function.name
            args   = json.loads(tc.function.arguments)
            print(f"  [iter {iteration + 1}] tool called: {name}({args})")
            result = execute_tool(name, args)
            print(f"  [iter {iteration + 1}] tool result: {result}")
            messages = messages + [{
                "role":         "tool",
                "tool_call_id": tc.id,
                "content":      json.dumps(result),
            }]

    raise RuntimeError(f"tool loop exceeded {max_iterations} iterations")


if __name__ == "__main__":
    print("=" * 60)
    print(f"Provider: Google Gemini ({MODEL}) — FREE tier")
    print(f"Question: {QUESTION}\n")

    print("[BEFORE — no tools]")
    raw = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": QUESTION}],
    )
    print(f"  → {raw.choices[0].message.content}\n")

    print("[AFTER — get_weather tool defined]")
    answer = run_tool_loop([{"role": "user", "content": QUESTION}])
    print(f"  → {answer}")
    print()
    print("Same output as 01_first_tool_call.py — only the provider changed.")
    print("Groq · Gemini · DeepSeek — same 3 lines, same result.")
