# =============================================================================
# DEMO 02 — Zero-Shot vs Few-Shot
# AI4SWE · Lecture 2
# =============================================================================
# WHAT THIS SHOWS:
#   A tone classification task run three ways:
#   zero-shot → 1-shot → 3-shot.
#   Output consistency improves with examples.
#   Token cost is printed — the quality/cost tradeoff is visible.
#
# LECTURE TIE-IN:
#   Few-shot = in-context learning.
#   Each example is live tokens the model routes from when generating.
#   More examples = better signal, but higher context cost.
#
# RUN:
#   python 02_zero_vs_few_shot.py
# =============================================================================

import os
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL = "llama-3.1-8b-instant"

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
    "Reply with ONLY one word — formal, casual, or aggressive. Nothing else.\n\n"
    "Message: \"{msg}\""
)

ONE_SHOT = (
    "Classify the tone of this message.\n"
    "Reply with ONLY one word — formal, casual, or aggressive. Nothing else.\n\n"
    "Message: \"Per our discussion, please advise at your earliest convenience.\"\n"
    "formal\n\n"
    "Message: \"{msg}\"\n"
)

THREE_SHOT = (
    "Classify the tone of this message.\n"
    "Reply with ONLY one word — formal, casual, or aggressive. Nothing else.\n\n"
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
    raw = response.choices[0].message.content.strip().lower()
    # find whichever label appears in the output
    answer = next((l for l in LABELS if l in raw), raw.split()[0] if raw.split() else "?")
    tokens_in = response.usage.prompt_tokens
    return answer, tokens_in


if __name__ == "__main__":
    variants = [
        ("ZERO-SHOT", ZERO_SHOT),
        ("1-SHOT",    ONE_SHOT),
        ("3-SHOT",    THREE_SHOT),
    ]

    print()
    print("  Tone Classification: zero-shot → 1-shot → 3-shot")
    print("=" * 66)

    for label, template in variants:
        print(f"\n  [{label}]")
        total_tokens = 0
        for msg in TEST_INPUTS:
            result, tokens = classify(template, msg)
            total_tokens += tokens
            truncated = msg[:52] + "..." if len(msg) > 52 else msg.ljust(55)
            print(f"    {truncated}  →  {result}")
        print(f"\n    Total prompt tokens across {len(TEST_INPUTS)} calls: {total_tokens}")
        print("─" * 66)

    print()
    print("── WHAT JUST HAPPENED ──────────────────────────────────────────")
    print("  With zero examples, the model infers from training alone.")
    print("  Each example is live tokens — the model routes from them.")
    print("  More examples → better consistency, but higher token cost.")
    print()
    print("  The context window is a finite budget.")
    print("  Every example you add costs tokens on every single call.")
    print("  Find the minimum number that gives you the consistency you need.")
    print()
