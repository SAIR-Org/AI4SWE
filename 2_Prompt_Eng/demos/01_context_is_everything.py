# =============================================================================
# DEMO 01 — Context Is Everything
# AI4SWE · Lecture 2
# =============================================================================
# WHAT THIS SHOWS:
#   Same user question. Three different system prompts.
#   Three completely different models — same weights, same API call.
#
# LECTURE TIE-IN:
#   The system message is the product's behavioral contract.
#   It defines who the model is before it sees anything from the user.
#   Change the system message → change the product.
#
# RUN:
#   python 01_context_is_everything.py
# =============================================================================

import os
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL = "llama-3.3-70b-versatile"

QUESTION = "Explain this error: TypeError: cannot read properties of undefined (reading 'map')"

PERSONAS = [
    {
        "label": "Persona A — Concise Expert",
        "system": (
            "You are a senior software engineer. "
            "Be direct and precise. "
            "Max 3 sentences. No fluff."
        ),
    },
    {
        "label": "Persona B — Patient Teacher",
        "system": (
            "You are a coding tutor teaching complete beginners. "
            "Use a simple real-world analogy first, then explain. "
            "Be warm and encouraging."
        ),
    },
    {
        "label": "Persona C — Strict Gatekeeper",
        "system": (
            "You only answer questions that include a minimal reproducible example with actual code. "
            "If no code is provided, respond ONLY with: "
            "'Please share the code where this error occurs so I can help.' "
            "Do not explain the error without seeing the code."
        ),
    },
]


def call(system: str, question: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=200,
        temperature=0.3,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": question},
        ],
    )
    return response.choices[0].message.content.strip()


if __name__ == "__main__":
    print(f"\n  Question: {QUESTION}\n")
    print("=" * 66)

    for p in PERSONAS:
        print(f"\n  {p['label']}")
        print(f"  System  : \"{p['system'][:80]}...\"" if len(p["system"]) > 80 else f"  System  : \"{p['system']}\"")
        print()
        answer = call(p["system"], QUESTION)
        for line in answer.split("\n"):
            print(f"    {line}")
        print()
        print("─" * 66)

    print()
    print("── WHAT JUST HAPPENED ──────────────────────────────────────────")
    print("  Same model. Same question. Same API call.")
    print("  Three completely different outputs — because the context changed.")
    print()
    print("  The system message is not decoration.")
    print("  It is the behavioral contract your product depends on.")
    print("  Context is everything.")
    print()
