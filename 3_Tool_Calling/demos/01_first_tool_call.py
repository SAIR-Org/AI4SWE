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
MODEL  = "llama-3.1-8b-instant"

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
                    "location": {"type": "string", "description": "City name, e.g. 'Addis Ababa'"}
                },
                "required": ["location"],
            },
        },
    }
]


def get_weather(location: str) -> dict:
    coords = CITY_COORDS.get(location)
    if not coords:
        return {"error": f"unknown location: {location}"}
    lat, lon = coords
    url  = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,weathercode&forecast_days=1"
    )
    data = requests.get(url, timeout=5).json()["current"]
    return {
        "location":  location,
        "temp_c":    data["temperature_2m"],
        "humidity":  data["relative_humidity_2m"],
        "condition": WMO_CONDITIONS.get(data["weathercode"], f"code {data['weathercode']}"),
    }


TOOL_MAP = {"get_weather": get_weather}

SYSTEM = "You are a helpful weather assistant. Use tool results to answer concisely."


def run(messages: list) -> str:
    for _ in range(10):
        response = client.chat.completions.create(
            model=MODEL,
            tools=TOOLS,
            messages=[{"role": "system", "content": SYSTEM}] + messages,
        )
        choice = response.choices[0]

        if choice.finish_reason == "stop" or not choice.message.tool_calls:
            return choice.message.content

        messages = messages + [choice.message]
        for tc in choice.message.tool_calls:
            args   = json.loads(tc.function.arguments)
            result = TOOL_MAP[tc.function.name](**args)
            messages = messages + [{"role": "tool", "tool_call_id": tc.id, "content": json.dumps(result)}]

    raise RuntimeError("tool loop exceeded max iterations")


if __name__ == "__main__":
    question = "What's the weather like in Addis Ababa right now?"

    # Without tools — model guesses
    raw = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": question}],
    )
    print("Without tools:", raw.choices[0].message.content)
    print()

    # With tools — model calls get_weather, gets real data
    print("With tools:", run([{"role": "user", "content": question}]))
