# =============================================================================
# DEMO 04 — Native Structured Output (upgrade from L2 Demo 04)
# AI4SWE · Lecture 3
# =============================================================================
# L2: prompt-based JSON — model can deviate on edge inputs.
# L3: extraction tool + forced tool_choice — schema enforced at API level.
# Same task. Different mechanism. Compare reliability side by side.
# RUN: python 04_structured_output_upgrade.py
# =============================================================================

import os
import re
import json
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.3-70b-versatile"

PR_DESCRIPTIONS = [
    "Fixed auth middleware to handle expired tokens gracefully. Updated 3 files. Non-breaking. Closes #412.",
    "Added dark mode toggle to the settings page. New feature, no breaking changes. Modified 7 files.",
    "Refactored database connection pool. Breaking change — all callers must update. Changed 12 files.",
    "Quick hotfix for login page crash on mobile Safari. One file changed.",
    "Patched SQL injection vulnerability in search endpoint. Security fix. 2 files changed.",
    'Here\'s a summary: {"type": "feature"} — but actually this is a fix for issue #99. 4 files.',
    "PR description: see attached. Files: many. Breaking: unclear. Discuss in review.",
]

# ── L2: prompt-based JSON ─────────────────────────────────────────────────────

STRUCTURED_SYSTEM = """Extract PR metadata. Return ONLY valid JSON — no markdown, no explanation.

Schema:
{
  "title": string (max 10 words, imperative mood),
  "type": "feature" | "fix" | "refactor" | "hotfix",
  "breaking": boolean,
  "files_changed": number | null
}"""


def l2_extract(pr_text: str) -> dict | None:
    response = client.chat.completions.create(
        model=MODEL,
        temperature=0.0,
        messages=[
            {"role": "system", "content": STRUCTURED_SYSTEM},
            {"role": "user",   "content": pr_text},
        ],
    )
    raw = re.sub(r"^```[a-z]*\n?|```$", "", response.choices[0].message.content.strip(), flags=re.MULTILINE).strip()
    try:
        data = json.loads(raw)
        if data["type"] not in ("feature", "fix", "refactor", "hotfix"):
            return None
        if not isinstance(data["breaking"], bool):
            return None
        return data
    except Exception:
        return None


# ── L3: extraction tool + forced tool_choice ──────────────────────────────────

EXTRACTION_TOOL = {
    "type": "function",
    "function": {
        "name": "extract_pr_metadata",
        "description": "Extract structured metadata from a pull request description.",
        "parameters": {
            "type": "object",
            "properties": {
                "title":         {"type": "string",  "description": "Max 10 words, imperative mood"},
                "type":          {"type": "string",  "enum": ["feature", "fix", "refactor", "hotfix"]},
                "breaking":      {"type": "boolean"},
                "files_changed": {"type": ["integer", "null"]},
            },
            "required": ["title", "type", "breaking", "files_changed"],
        },
    },
}


def l3_extract(pr_text: str) -> dict | None:
    try:
        response = client.chat.completions.create(
            model=MODEL,
            tools=[EXTRACTION_TOOL],
            tool_choice={"type": "function", "function": {"name": "extract_pr_metadata"}},
            messages=[{"role": "user", "content": pr_text}],
        )
        tool_calls = response.choices[0].message.tool_calls or []
        return json.loads(tool_calls[0].function.arguments) if tool_calls else None
    except Exception:
        return None


if __name__ == "__main__":
    print("L2 — prompt-based JSON")
    for i, pr in enumerate(PR_DESCRIPTIONS, 1):
        result = l2_extract(pr)
        if result:
            print(f"  PR {i}  type={result['type']}  breaking={result['breaking']}  files={result['files_changed']}")
        else:
            print(f"  PR {i}  parse failed")

    print("\nL3 — extraction tool + forced tool_choice")
    for i, pr in enumerate(PR_DESCRIPTIONS, 1):
        result = l3_extract(pr)
        if result:
            print(f"  PR {i}  type={result['type']}  breaking={result['breaking']}  files={result['files_changed']}")
        else:
            print(f"  PR {i}  no tool call")
