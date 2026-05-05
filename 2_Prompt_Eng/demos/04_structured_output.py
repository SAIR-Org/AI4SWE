# =============================================================================
# DEMO 04 — Structured Output
# AI4SWE · Lecture 2
# =============================================================================
# PR metadata extraction: prose (unparseable) → JSON schema → validated.
# A schema collapses the output space. temperature=0 + server-side validation
# is the production pattern. Never trust model output blindly.
# RUN: python 04_structured_output.py
# =============================================================================

import os
import json
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.3-70b-versatile"

PR_DESCRIPTIONS = [
    "Fixed auth middleware to handle expired tokens gracefully. Updated 3 files. Non-breaking. Closes #412.",
    "Added dark mode toggle to the settings page. New feature, no breaking changes. Modified 7 files.",
    "Refactored database connection pool to use async/await. Breaking change — callers must now await all db calls. Changed 12 files.",
    "Quick hotfix for the login page crash on mobile Safari. One file changed.",
]

UNSTRUCTURED_SYSTEM = "You are a helpful assistant. Summarize this pull request."

STRUCTURED_SYSTEM = """Extract pull request metadata. Return ONLY valid JSON — no markdown, no explanation.

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
    print("[UNSTRUCTURED — prose output]")
    for i, pr in enumerate(PR_DESCRIPTIONS[:2], 1):
        print(f"  PR {i}: {call(UNSTRUCTURED_SYSTEM, pr)[:120]}")
    print()

    print("[STRUCTURED — JSON schema + server-side validation]")
    passed = 0
    for i, pr in enumerate(PR_DESCRIPTIONS, 1):
        raw = call(STRUCTURED_SYSTEM, pr)
        try:
            data   = validate(raw)
            passed += 1
            print(f"  ✓ PR {i}  {data['title']!r}  type={data['type']}  breaking={data['breaking']}  files={data['files_changed']}")
        except (json.JSONDecodeError, AssertionError, KeyError) as e:
            print(f"  ✗ PR {i}  {e}")
    print(f"\n  {passed}/{len(PR_DESCRIPTIONS)} valid")
