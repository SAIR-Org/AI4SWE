# =============================================================================
# DEMO 01 — The First Tool Call
# AI4SWE · Lecture 3
# =============================================================================
# Before: ask about weather → confident hallucination.
# After:  define a tool → loop → model answers with real (mock) data.
# The full cycle: definition → detection → execution → result → answer.
# RUN: python 01_first_tool_call.py
# =============================================================================

import os
import json
import requests
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.1-8b-instant"   # fast + low token cost — swap to llama-3.3-70b-versatile for best quality

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

# City coordinates for Open-Meteo (free, no API key needed)
CITY_COORDS = {
    "Addis Ababa": (9.03, 38.74),
    "London":      (51.51, -0.13),
    "Cairo":       (30.06, 31.25),
}

WMO_CONDITIONS = {
    0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
    45: "foggy", 48: "foggy", 51: "light drizzle", 61: "light rain",
    63: "moderate rain", 65: "heavy rain", 71: "light snow", 80: "rain showers",
    95: "thunderstorm",
}

# TOOL_MAP — dispatch by name. Add new tools here, not in the loop.
def get_weather(location: str) -> dict:
    coords = CITY_COORDS.get(location)
    if not coords:
        return {"error": f"unknown location: {location}"}

    lat, lon = coords
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,weathercode"
        f"&forecast_days=1"
    )
    data    = requests.get(url, timeout=5).json()["current"]
    code    = data["weathercode"]
    return {
        "location":  location,
        "temp_c":    data["temperature_2m"],
        "humidity":  data["relative_humidity_2m"],
        "condition": WMO_CONDITIONS.get(code, f"code {code}"),
    }

TOOL_MAP = {
    "get_weather": get_weather,
}


def execute_tool(name: str, args: dict) -> dict:
    fn = TOOL_MAP.get(name)
    if fn is None:
        raise ValueError(f"unknown tool: {name}")
    return fn(**args)


SYSTEM = "You are a helpful weather assistant. When you receive tool results, use them to answer the user's question directly and concisely."

def run_tool_loop(messages: list, max_iterations: int = 10) -> str:
    for iteration in range(max_iterations):
        response = client.chat.completions.create(
            model=MODEL,
            tools=TOOLS,
            messages=[{"role": "system", "content": SYSTEM}] + messages,
        )

        choice = response.choices[0]

        # Model finished — return the text answer
        if choice.finish_reason == "stop":
            return choice.message.content

        # Collect all tool calls from this response
        tool_calls = choice.message.tool_calls or []
        if not tool_calls:
            return choice.message.content

        # Append assistant message (contains tool_calls)
        messages = messages + [choice.message]

        # Execute each tool and collect results
        for tool_call in tool_calls:
            name   = tool_call.function.name
            args   = json.loads(tool_call.function.arguments)
            print(f"  [iter {iteration + 1}] tool called: {name}({args})")
            result = execute_tool(name, args)
            print(f"  [iter {iteration + 1}] tool result: {result}")

            messages = messages + [{
                "role":         "tool",
                "tool_call_id": tool_call.id,
                "content":      json.dumps(result),
            }]

    raise RuntimeError(f"tool loop exceeded {max_iterations} iterations")


if __name__ == "__main__":
    print("=" * 60)
    print(f"Question: {QUESTION}\n")

    # BEFORE — no tools, model hallucinates
    print("[BEFORE — no tools]")
    raw = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": QUESTION}],
    )
    print(f"  → {raw.choices[0].message.content}\n")

    # AFTER — tool defined, loop runs
    print("[AFTER — get_weather tool defined]")
    answer = run_tool_loop([{"role": "user", "content": QUESTION}])
    print(f"  → {answer}")
