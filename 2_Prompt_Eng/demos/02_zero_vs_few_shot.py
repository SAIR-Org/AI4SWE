# =============================================================================
# DEMO 02 — Zero-Shot vs Few-Shot
# AI4SWE · Lecture 2
# =============================================================================
# Tone classification: zero-shot → 1-shot → 3-shot.
# Consistency improves with examples. Token cost grows with each one.
# In-context learning: the model routes from examples, no weight updates.
# RUN: python 02_zero_vs_few_shot.py
# =============================================================================

import os
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.1-8b-instant"

LABELS = ("formal", "casual", "aggressive")

TEST_INPUTS = [
    "We need this delivered by tomorrow or there will be consequences.",
    "Hey, any chance you can take a look when you get a sec?",
    "As per my previous email, please action this immediately.",
    "lol no worries, just ping me when it's ready :)",
    "This delay is completely unacceptable. I expect a response within the hour.",
]

ZERO_SHOT = (
    "Classify the tone of this message.\n"
    "Reply with ONLY one word — formal, casual, or aggressive.\n\n"
    "Message: \"{msg}\""
)

ONE_SHOT = (
    "Classify the tone of this message.\n"
    "Reply with ONLY one word — formal, casual, or aggressive.\n\n"
    "Message: \"Per our discussion, please advise at your earliest convenience.\"\n"
    "formal\n\n"
    "Message: \"{msg}\"\n"
)

THREE_SHOT = (
    "Classify the tone of this message.\n"
    "Reply with ONLY one word — formal, casual, or aggressive.\n\n"
    "Message: \"Per our discussion, please advise at your earliest convenience.\"\n"
    "formal\n\n"
    "Message: \"Hey can u fix this real quick? thx\"\n"
    "casual\n\n"
    "Message: \"This is unacceptable. Fix it now or face consequences.\"\n"
    "aggressive\n\n"
    "Message: \"{msg}\"\n"
)


def classify(prompt_template: str, msg: str) -> tuple[str, int]:
    prompt = prompt_template.format(msg=msg)
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=5,
        temperature=0.0,
        messages=[{"role": "user", "content": prompt}],
    )
    raw    = response.choices[0].message.content.strip().lower()
    answer = next((l for l in LABELS if l in raw), raw.split()[0] if raw.split() else "?")
    return answer, response.usage.prompt_tokens


if __name__ == "__main__":
    variants = [
        ("ZERO-SHOT", ZERO_SHOT),
        ("1-SHOT",    ONE_SHOT),
        ("3-SHOT",    THREE_SHOT),
    ]
    for label, template in variants:
        total = 0
        print(f"[{label}]")
        for msg in TEST_INPUTS:
            result, tokens = classify(template, msg)
            total += tokens
            print(f"  {msg[:54]:54}  →  {result}")
        print(f"  prompt tokens: {total}\n")
