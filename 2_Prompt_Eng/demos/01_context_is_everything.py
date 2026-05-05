# =============================================================================
# DEMO 01 — Context Is Everything
# AI4SWE · Lecture 2
# =============================================================================
# Same user question. Three different system prompts.
# Three completely different outputs — same model, same API call.
# The system message is the product's behavioral contract.
# RUN: python 01_context_is_everything.py
# =============================================================================

import os
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.3-70b-versatile"

QUESTION = "Explain this error: TypeError: cannot read properties of undefined (reading 'map')"

PERSONAS = [
    {
        "label":  "Concise Expert",
        "system": "You are a senior software engineer. Be direct and precise. Max 3 sentences. No fluff.",
    },
    {
        "label":  "Patient Teacher",
        "system": "You are a coding tutor for beginners. Use a simple analogy first, then explain. Be warm.",
    },
    {
        "label":  "Strict Gatekeeper",
        "system": (
            "You only answer if the user provides actual code showing the error. "
            "If no code is given, respond ONLY with: "
            "'Please share the code where this error occurs so I can help.'"
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
    print(f"Question: {QUESTION}\n")
    for p in PERSONAS:
        print(f"[{p['label']}]")
        print(call(p["system"], QUESTION))
        print()
