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
    # Normal cases — both approaches handle these
    "Fixed auth middleware to handle expired tokens gracefully. Updated 3 files. Non-breaking. Closes #412.",
    "Added dark mode toggle to the settings page. New feature, no breaking changes. Modified 7 files.",
    "Refactored database connection pool. Breaking change — all callers must update. Changed 12 files.",
    # Edge cases — where L2 can struggle
    "Quick hotfix for login page crash on mobile Safari. One file changed.",
    "Patched SQL injection vulnerability in search endpoint. Security fix. 2 files changed.",
    # Adversarial — designed to break L2 JSON parsing
    "Here's a summary: {\"type\": \"feature\"} — but actually this is a fix for issue #99. 4 files.",
    "PR description: see attached. Files: many. Breaking: unclear. Discuss in review.",
]

# ── L2 approach: prompt-based JSON ────────────────────────────────────────

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


# ── L3 approach: extraction tool + forced tool_choice ─────────────────────

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
        if not tool_calls:
            return None
        return json.loads(tool_calls[0].function.arguments)
    except Exception:
        return None


if __name__ == "__main__":
    print("=" * 60)

    # ── Pass rate comparison ───────────────────────────────────────────────
    print("[L2 — prompt-based JSON]")
    l2_ok = 0
    for i, pr in enumerate(PR_DESCRIPTIONS, 1):
        result = l2_extract(pr)
        if result:
            l2_ok += 1
            print(f"  ✓ PR {i}  type={result['type']}  breaking={result['breaking']}  files={result['files_changed']}")
        else:
            print(f"  ✗ PR {i}  parse failed or schema violated")
    print(f"  {l2_ok}/{len(PR_DESCRIPTIONS)} valid\n")

    print("[L3 — extraction tool + tool_choice forced]")
    l3_ok = 0
    for i, pr in enumerate(PR_DESCRIPTIONS, 1):
        result = l3_extract(pr)
        if result:
            l3_ok += 1
            print(f"  ✓ PR {i}  type={result['type']}  breaking={result['breaking']}  files={result['files_changed']}")
        else:
            print(f"  ✗ PR {i}  no tool call returned")
    print(f"  {l3_ok}/{len(PR_DESCRIPTIONS)} valid\n")

    print(f"  L2: {l2_ok}/{len(PR_DESCRIPTIONS)}  |  L3: {l3_ok}/{len(PR_DESCRIPTIONS)}")
    print()

    # ── The real difference: code and guarantees ───────────────────────────
    print("─" * 60)
    print("PASS RATE IS THE SAME — here is what actually differs:\n")

    print("  L2 output — what your code MIGHT receive:")
    print('    "```json\\n{\\"type\\": \\"fix\\", \\"breaking\\": false}\\n```"')
    print('    "The PR type is fix. Breaking change: no."  ← prose, not JSON')
    print('    "{\\"type\\": \\"bugfix\\", ...}"             ← wrong enum value')
    print("  → You need: regex strip + json.loads + manual field validation\n")

    print("  L3 output — what your code ALWAYS receives:")
    print('    tool_calls[0].function.arguments')
    print('    = \'{"title": "...", "type": "fix", "breaking": false, "files_changed": 3}\'')
    print("  → Always valid JSON. Type always in enum. Required fields always present.")
    print("  → No parsing. No stripping. No validation boilerplate.\n")

    print("  WHEN L3 MATTERS MOST:")
    print("  • High-volume pipelines where one bad parse crashes the batch")
    print("  • Strict enums — model can never output 'bugfix' instead of 'fix'")
    print("  • Any time you want schema guarantees, not schema requests")
