# =============================================================================
# DEMO 03 — Parallel Tool Calls
# AI4SWE · Lecture 3
# =============================================================================
# Model requests 3 tool calls in one response — execute them in parallel.
# Sequential:  3 real HTTP calls one after another  → ~900ms
# Parallel:    3 real HTTP calls simultaneously     → ~300ms  (3× faster)
# Real Open-Meteo API, real network latency, real speedup.
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

QUERY = "What's the weather right now in London, Cairo, and Addis Ababa?"

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

CITY_COORDS = {
    "London":      (51.51, -0.13),
    "Cairo":       (30.06, 31.25),
    "Addis Ababa": (9.03,  38.74),
}

WMO = {
    0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
    45: "foggy", 51: "light drizzle", 61: "light rain", 63: "moderate rain",
    80: "rain showers", 95: "thunderstorm",
}


session = requests.Session()  # reuse connections across parallel calls


def get_weather(location: str) -> dict:
    coords = CITY_COORDS.get(location)
    if not coords:
        return {"error": f"unknown location: {location}"}
    lat, lon = coords
    url  = (f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,weathercode&forecast_days=1")
    data = session.get(url, timeout=10).json()["current"]
    return {
        "location":  location,
        "temp_c":    data["temperature_2m"],
        "humidity":  data["relative_humidity_2m"],
        "condition": WMO.get(data["weathercode"], f"code {data['weathercode']}"),
    }


def execute_sequential(tool_calls: list) -> tuple[list, float]:
    t0 = time.time()
    results = []
    for tc in tool_calls:
        args   = json.loads(tc.function.arguments)
        result = get_weather(**args)
        results.append({"role": "tool", "tool_call_id": tc.id, "content": json.dumps(result)})
    return results, time.time() - t0


def execute_parallel(tool_calls: list) -> tuple[list, float]:
    def fetch(tc):
        args = json.loads(tc.function.arguments)
        return tc.id, get_weather(**args)

    t0 = time.time()
    results = []
    with ThreadPoolExecutor(max_workers=len(tool_calls)) as pool:
        for tool_id, result in pool.map(fetch, tool_calls):
            print(f"  ✓ {result['location']}: {result['temp_c']}°C, {result['condition']}, {result['humidity']}% humidity")
            results.append({"role": "tool", "tool_call_id": tool_id, "content": json.dumps(result)})
    return results, time.time() - t0


if __name__ == "__main__":
    print("=" * 60)
    print(f"Query: {QUERY}\n")

    # Step 1 — model decides what tools to call
    response   = client.chat.completions.create(
        model=MODEL, tools=TOOLS,
        messages=[{"role": "user", "content": QUERY}]
    )
    tool_calls = response.choices[0].message.tool_calls or []

    print(f"[model returned {len(tool_calls)} tool call(s)]")
    for tc in tool_calls:
        print(f"  → {tc.function.name}({tc.function.arguments})")
    print()

    # Step 2a — sequential (baseline)
    print("[SEQUENTIAL — one at a time]")
    _, seq_time = execute_sequential(tool_calls)
    print(f"  {seq_time:.2f}s\n")

    # Step 2b — parallel (production pattern)
    print("[PARALLEL — ThreadPoolExecutor]")
    par_results, par_time = execute_parallel(tool_calls)
    print(f"  {par_time:.2f}s — speedup: {seq_time / par_time:.1f}×\n")

    # Step 3 — inject results, get final answer
    messages = [
        {"role": "user",      "content": QUERY},
        response.choices[0].message,
    ] + par_results

    final = client.chat.completions.create(model=MODEL, tools=TOOLS, messages=messages)
    print("[final answer]")
    print(f"  → {final.choices[0].message.content}")
