# =============================================================================
# DEMO 02 — API Parameters Are Product Controls
# AI4SWE · Lecture 1
# =============================================================================
# WHAT THIS SHOWS:
#   Part 3 of the lecture: L2 control surface.
#   Same model, different parameters, different behavior.
#
# LECTURE TIE-IN:
#   Layer L2 exposes the knobs the UI hides.
#   This is where behavior becomes engineering work.
#
# RUN:
#   uv add groq python-dotenv
#   python 02_api_parms.py
# =============================================================================

import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

QUESTION = "Explain the hoisting in JS"

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
        max_tokens=250,           # hard stop — answer must be short
        temperature=1.5,         # deterministic — same answer every run
        messages=[
            {"role": "system",  "content": "You are a principle engineer."},
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
    print("  The UI hides the knobs. The API exposes them.")
    print("  That is why model behavior becomes product behavior.")
