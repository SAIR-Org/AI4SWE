# =============================================================================
# DEMO 02 — The UI Is Just An API Call
# AI4SWE · Lecture 1
# =============================================================================
# WHAT THIS SHOWS:
#   ChatGPT and Claude.ai are frontends.
#   The API is the exact same thing — minus the wrapper.
#   The SDK handles all the HTTP, auth, and serialization for you.
#
# LECTURE TIE-IN:
#   Layer L1 (UI)  ->  Layer L2 (API)
#   You are moving one layer down the stack.
#
# RUN:
#   uv add groq python-dotenv
#   python 01_the_ui_is_just_an_api_call.py
# =============================================================================

import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

QUESTION = "What is a large language model? Answer in 2 sentences."

client = Groq(api_key=os.environ["GROQ_API_KEY"])


# ── CALL 1 — Bare minimum ────────────────────────────────────────────────────

def call_basic():
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        max_tokens=200,
        messages=[
            {"role": "user", "content": QUESTION}
        ]
    )

    print("── CALL 1 — Basic ──────────────────────────────────────")
    print(f"  Model   : {response.model}")
    print(f"  Tokens  : {response.usage.prompt_tokens} in / {response.usage.completion_tokens} out")
    print(f"  Answer  : {response.choices[0].message.content}")


# ── CALL 2 — With params ─────────────────────────────────────────────────────

def call_with_params():
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        max_tokens=50,           # hard stop — answer must be short
        temperature=0.0,         # deterministic — same answer every run
        messages=[
            {"role": "system",  "content": "You are a technical instructor. Be concise and precise."},
            {"role": "user",    "content": QUESTION}
        ]
    )

    print("── CALL 2 — With Params ────────────────────────────────")
    print(f"  Model       : {response.model}")
    print(f"  Tokens      : {response.usage.prompt_tokens} in / {response.usage.completion_tokens} out")
    print(f"  temperature : 0.0  (deterministic)")
    print(f"  max_tokens  : 50   (hard stop)")
    print(f"  system      : 'You are a technical instructor. Be concise and precise.'")
    print(f"  Answer      : {response.choices[0].message.content}")


# ── MAIN ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"\n  Question: {QUESTION}\n")

    call_basic()
    print()
    call_with_params()
    print()

    print("── WHAT JUST HAPPENED ──────────────────────────────────")
    print("  Same question. Same model. Different params = different output.")
    print("  system      -> shapes who the model is before it speaks")
    print("  temperature -> 0 means deterministic, same answer every run")
    print("  max_tokens  -> hard stop, the model cannot exceed this")
    print("  The UI hides all of this. The API gives you full control.")