# =============================================================================
# DEMO 01 — The UI Is Just an API Call
# AI4SWE · Lecture 1
# =============================================================================
# WHAT THIS SHOWS:
#   Part 3 of the lecture: L1 -> L2.
#   ChatGPT and Claude.ai are frontends.
#   The API is the same basic request path, minus the wrapper.
#
# LECTURE TIE-IN:
#   Layer L1 (Product UI)  ->  Layer L2 (Model API)
#   The audience sees the product surface, then the request beneath it.
#
# RUN:
#   uv add groq python-dotenv
#   python 01_the_ui_is_just_an_api_call.py
# =============================================================================

import os
from dotenv import load_dotenv

load_dotenv()

QUESTION = "What is a large language model? Answer in 2 precise sentences for software engineers."


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
    print("  You just reproduced the request sitting behind a chat product.")
    print("  The interface changes, but the request pattern is the same.")
    print("  That is your entry point into the modern AI stack.")
