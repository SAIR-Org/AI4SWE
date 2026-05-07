# =============================================================================
# DEMO 02 — Zero-Shot vs Few-Shot
# AI4SWE · Lecture 2
# =============================================================================
# Commit message generation: zero-shot → instructions only → few-shot.
# Zero-shot: inconsistent prose, no format.
# Instructions only: format described in words — better, but types still drift.
# Few-shot: same instructions + 3 examples — format AND vocabulary locked in.
# The lesson: instructions tell the model the rules; examples show the decisions.
# RUN: python 02_zero_vs_few_shot.py
# =============================================================================

import os
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.1-8b-instant"

CHANGES = [
    "Fixed a bug where the login form crashes when the email field is left empty",
    "Added a loading spinner to the checkout button while the payment is processing",
    "Removed the deprecated getUserById function and updated all callers to use findUser",
    "Increased the database connection pool size from 10 to 50 in the production config",
    "Added unit tests for the password reset flow",
]

ZERO_SHOT = (
    "Write a git commit message for this change.\n"
    "Reply with ONLY the commit message — nothing else.\n\n"
    "Change: \"{change}\"\n"
    "Commit:"
)

INSTRUCTIONS_ONLY = (
    "Write a git commit message for this change.\n"
    "Format: type(scope): short description — one line, imperative mood, max 72 chars.\n"
    "Types: feat, fix, refactor, chore, test, docs\n"
    "Reply with ONLY the commit message — nothing else.\n\n"
    "Change: \"{change}\"\n"
    "Commit:"
)

FEW_SHOT = (
    "Write a git commit message for this change.\n"
    "Format: type(scope): short description — one line, imperative mood, max 72 chars.\n"
    "Types: feat, fix, refactor, chore, test, docs\n\n"
    "EXAMPLES\n"
    "Change: \"Add retry logic to the payment API client when it gets a 429 response\"\n"
    "Commit: fix(payments): retry on 429 from payment API\n\n"
    "Change: \"Move user validation logic out of the controller into a separate service\"\n"
    "Commit: refactor(users): extract validation into UserValidationService\n\n"
    "Change: \"Update the README with new environment variable setup instructions\"\n"
    "Commit: docs(readme): add env var setup instructions\n\n"
    "YOUR TASK\n"
    "Change: \"{change}\"\n"
    "Commit:"
)


def generate(prompt_template: str, change: str) -> tuple[str, int]:
    prompt   = prompt_template.format(change=change)
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=30,
        temperature=0.0,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content.strip(), response.usage.prompt_tokens


if __name__ == "__main__":
    variants = [
        ("ZERO-SHOT",           ZERO_SHOT),
        ("INSTRUCTIONS ONLY",   INSTRUCTIONS_ONLY),
        ("FEW-SHOT (3 examples)", FEW_SHOT),
    ]
    for label, template in variants:
        total = 0
        print(f"[{label}]")
        for change in CHANGES:
            result, tokens = generate(template, change)
            total += tokens
            print(f"  {change[:52]:52}  →  {result}")
        print(f"  prompt tokens: {total}\n")
