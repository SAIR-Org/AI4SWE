# =============================================================================
# DEMO 03 — Parallel Tool Calls
# AI4SWE · Lecture 3
# =============================================================================
# Model requests 3 tool calls in one response — execute them in parallel.
# Sequential: 3 HTTP calls one after another  → ~900ms
# Parallel:   3 HTTP calls simultaneously     → ~300ms  (3× faster)
# RUN: python 03_parallel_calls.py
# =============================================================================

import os
import json
import time
import requests
from groq import Groq
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.3-70b-versatile"

CITY_COORDS = {
    "Riyadh":      (24.71, 46.67),
    "Cairo":       (30.06, 31.25),
    "Addis Ababa": (9.03,  38.74),
}

WMO = {
    0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
    45: "foggy", 51: "light drizzle", 61: "light rain", 63: "moderate rain",
    80: "rain showers", 95: "thunderstorm",
}

TOOLS = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current weather for a city.",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {"type": "string", "description": "City name"}
            },
            "required": ["location"],
        },
    },
}]

session = requests.Session()


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
    data = session.get(url, timeout=10).json()["current"]
    return {
        "location":  location,
        "temp_c":    data["temperature_2m"],
        "humidity":  data["relative_humidity_2m"],
        "condition": WMO.get(data["weathercode"], f"code {data['weathercode']}"),
    }


def execute_parallel(tool_calls: list) -> tuple[list, float]:
    def fetch(tc):
        return tc.id, get_weather(**json.loads(tc.function.arguments))

    t0 = time.time()
    with ThreadPoolExecutor(max_workers=len(tool_calls)) as pool:
        results = [
            {"role": "tool", "tool_call_id": tid, "content": json.dumps(result)}
            for tid, result in pool.map(fetch, tool_calls)
        ]
    return results, time.time() - t0


if __name__ == "__main__":
    query = "What's the weather right now in Riyadh, Istanbul, and Addis Ababa?"

    response   = client.chat.completions.create(
        model=MODEL, tools=TOOLS, messages=[{"role": "user", "content": query}]
    )
    tool_calls = response.choices[0].message.tool_calls or []

    par_results, elapsed = execute_parallel(tool_calls)
    print(f"Fetched {len(tool_calls)} cities in {elapsed:.2f}s (parallel)\n")

    messages = [{"role": "user", "content": query}, response.choices[0].message] + par_results
    final    = client.chat.completions.create(model=MODEL, tools=TOOLS, messages=messages)
    print(final.choices[0].message.content)
