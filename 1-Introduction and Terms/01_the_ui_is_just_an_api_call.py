# =============================================================================
# DEMO 01 — The UI Is Just An API Call
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

load_dotenv()

QUESTION = "What is a large language model? Answer in 2 sentences."


def call_groq():
    from groq import Groq

    client = Groq(api_key=os.environ["GROQ_API_KEY"])

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        max_tokens=200,
        messages=[
            {"role": "user", "content": QUESTION}
        ]
    )

    print("── GROQ (Llama 3.1) ────────────────────────────────────")
    print(f"  Model   : {response.model}")
    print(f"  Tokens  : {response.usage.prompt_tokens} in / {response.usage.completion_tokens} out")
    print(f"  Answer  : {response.choices[0].message.content}")


# ── MAIN ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"\n  Question: {QUESTION}\n")
    call_groq()
    print()
    print("── WHAT JUST HAPPENED ──────────────────────────────────")
    print("  You just did exactly what ChatGPT and Claude.ai do.")
    print("  The UI sends this same request. You are now one layer deeper.")
    print("  Same model. Same response. No browser required.")