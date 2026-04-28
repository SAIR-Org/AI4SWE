# =============================================================================
# DEMO 04 — Structured Output
# AI4SWE · Lecture 2
# =============================================================================
# WHAT THIS SHOWS:
#   Extracting PR metadata from a plain-text description.
#   Without schema: model returns prose — unparseable.
#   With JSON schema: machine-readable on the first call.
#   With validation: the pattern your production code should follow.
#
# LECTURE TIE-IN:
#   Structured output collapses the output space.
#   The schema is a constraint on the first token — the model can't wander.
#   Always validate server-side. Never trust model output blindly.
#
# RUN:
#   python 04_structured_output.py
# =============================================================================

import os
import json
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL = "llama-3.3-70b-versatile"

PR_DESCRIPTIONS = [
    "Fixed auth middleware to handle expired tokens gracefully. "
    "Updated 3 files. Non-breaking change. "
    "Closes #412.",

    "Added dark mode toggle to the settings page. "
    "New feature, no breaking changes. Modified 7 files.",

    "Refactored the database connection pool to use async/await. "
    "This is a breaking change — callers must now await all db calls. "
    "Changed 12 files.",

    "Quick hotfix for the login page crash on mobile Safari. "
    "One file changed.",
]

UNSTRUCTURED_SYSTEM = "You are a helpful assistant. Summarize this pull request."

STRUCTURED_SYSTEM = """Extract pull request metadata from the description.
Return ONLY valid JSON — no explanation, no markdown, no code fences.

Schema:
{
  "title": string (max 10 words, imperative mood),
  "type": "feature" | "fix" | "refactor" | "hotfix",
  "breaking": boolean,
  "files_changed": number | null
}"""


def call(system: str, user: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=200,
        temperature=0.0,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user},
        ],
    )
    return response.choices[0].message.content.strip()


def validate(raw: str) -> dict:
    data = json.loads(raw)
    assert "title" in data and isinstance(data["title"], str)
    assert data["type"] in ("feature", "fix", "refactor", "hotfix")
    assert isinstance(data["breaking"], bool)
    assert data["files_changed"] is None or isinstance(data["files_changed"], int)
    return data


if __name__ == "__main__":
    print()
    print("  Structured Output: PR Metadata Extraction")
    print("=" * 66)

    # Round 1: unstructured
    print("\n  [UNSTRUCTURED] — No schema, prose output")
    print("─" * 66)
    for i, pr in enumerate(PR_DESCRIPTIONS[:2], 1):
        output = call(UNSTRUCTURED_SYSTEM, pr)
        print(f"\n  PR {i}: \"{pr[:60]}...\"")
        print(f"  Output: {output[:120]}...")

    print()
    print()

    # Round 2: structured + validation
    print("  [STRUCTURED] — JSON schema + server-side validation")
    print("─" * 66)

    passed = 0
    failed = 0

    for i, pr in enumerate(PR_DESCRIPTIONS, 1):
        raw = call(STRUCTURED_SYSTEM, pr)
        print(f"\n  PR {i}: \"{pr[:55]}...\"")
        try:
            data = validate(raw)
            passed += 1
            print(f"  ✓ VALID  →  title={data['title']!r}")
            print(f"              type={data['type']}  breaking={data['breaking']}  files={data['files_changed']}")
        except (json.JSONDecodeError, AssertionError, KeyError) as e:
            failed += 1
            print(f"  ✗ INVALID → {e}")
            print(f"    Raw: {raw[:100]}")

    print()
    print("─" * 66)
    print(f"  Results: {passed}/{len(PR_DESCRIPTIONS)} valid  |  {failed} failed")
    print()
    print("── WHAT JUST HAPPENED ──────────────────────────────────────────")
    print("  Unstructured: prose output — you can't parse that in code.")
    print("  Structured:   JSON schema collapses the output space.")
    print("                The model's first token is already constrained.")
    print()
    print("  The pattern for production:")
    print("    1. System prompt with explicit JSON schema")
    print("    2. temperature=0 for maximum consistency")
    print("    3. Always validate server-side — models can still deviate")
    print("    4. On failure: retry with stricter prompt or raise for review")
    print()
