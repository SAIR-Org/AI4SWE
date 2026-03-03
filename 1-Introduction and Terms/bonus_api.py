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
#   pip install anthropic openai
#   export ANTHROPIC_API_KEY=your_key
#   export OPENAI_API_KEY=your_key
#   python 01_the_ui_is_just_an_api_call.py
# =============================================================================

import os

QUESTION = "What is a large language model? Answer in 2 sentences."

# ── ANTHROPIC ────────────────────────────────────────────────────────────────

def call_claude():
    import anthropic

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    response = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=200,
        messages=[
            {"role": "user", "content": QUESTION}
        ]
    )

    print("── ANTHROPIC (Claude) ──────────────────────────────────")
    print(f"  Model   : {response.model}")
    print(f"  Tokens  : {response.usage.input_tokens} in / {response.usage.output_tokens} out")
    print(f"  Answer  : {response.content[0].text}")


# ── OPENAI ───────────────────────────────────────────────────────────────────

def call_gpt():
    import openai

    client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=200,
        messages=[
            {"role": "user", "content": QUESTION}
        ]
    )

    print("── OPENAI (GPT) ────────────────────────────────────────")
    print(f"  Model   : {response.model}")
    print(f"  Tokens  : {response.usage.prompt_tokens} in / {response.usage.completion_tokens} out")
    print(f"  Answer  : {response.choices[0].message.content}")


# ── MAIN ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"\n  Question: {QUESTION}\n")
    call_claude()
    print()
    call_gpt()
    print()
    print("── WHAT JUST HAPPENED ──────────────────────────────────")
    print("  You just did exactly what Claude.ai and ChatGPT do.")
    print("  The UI sends this same request. You are now one layer deeper.")
    print("  Same model. Same response. No browser required.")