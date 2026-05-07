# =============================================================================
# DEMO 04 — Optional Vendor Swap
# AI4SWE · Lecture 1
# =============================================================================
# WHAT THIS SHOWS:
#   Part 3 of the lecture: the orchestration layer can swap vendors.
#   Different SDKs, same fundamental request pattern.
#
# LECTURE TIE-IN:
#   Layer L2 (Model API) -> Layer L3 (Orchestration)
#   The provider changes, but the application pattern remains.
#
# RUN:
#   pip install anthropic openai 
#   export ANTHROPIC_API_KEY=your_key
#   export OPENAI_API_KEY=your_key
#   python bonus_api.py
# =============================================================================

import os

QUESTION = "What is a large language model? Answer in 2 precise sentences for software engineers."

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
    print("  Two different vendors, one shared application pattern.")
    print("  This is the first step toward abstraction, routing, and multi-model systems.")
    print("  The backend changes. The engineering problem remains.")
