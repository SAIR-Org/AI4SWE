# =============================================================================
# DEMO 06 — Combining Patterns: The Production Pipeline
# AI4SWE · Lecture 2
# =============================================================================
# WHAT THIS SHOWS:
#   A real engineering task — parsing a bug report email — solved with
#   all 5 patterns working together in one production-grade pipeline:
#
#   Role/Persona   → system message as behavioral contract
#   Few-shot       → 1 worked example anchors the format
#   Hidden CoT     → model reasons inside <thinking> tags, output is clean
#   Structured Out → strict JSON schema enforced in system + format spec
#   Workflow       → extract_reasoning() + validate() + retry logic
#
# LECTURE TIE-IN:
#   Real AI features don't use one technique.
#   They combine all of them. This is what a production prompt looks like.
#   Inspired by the hands-on pipeline pattern from the course reference PDF.
#
# RUN:
#   python 06_combining_patterns.py
# =============================================================================

import os
import re
import json
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL = "llama-3.3-70b-versatile"

# ── System Prompt (Role + CoT instruction + Output contract) ──────────────────
SYSTEM_PROMPT = """You are a senior engineering triage assistant.
Your job is to parse bug report emails into structured incident records.

You must produce TWO parts in this exact order:
1. Step-by-step reasoning inside <thinking>...</thinking> tags.
2. The final JSON record outside the tags — no other text.

Rules:
- reasoning: think about severity, affected scope, and ambiguities.
- JSON output: follow the schema exactly. Use null for unknown fields.
- Never include the <thinking> block in the final output."""

# ── Output Format Spec (from the PDF pattern) ─────────────────────────────────
OUTPUT_FORMAT = """
## INCIDENT_START

{
  "title": string,          // max 8 words, imperative verb
  "severity": "P1" | "P2" | "P3",
  "component": string,      // e.g. "auth", "payments", "dashboard"
  "affected_users": "all" | "subset" | "single" | null,
  "error_type": string | null,
  "steps_to_reproduce": boolean,
  "suggested_owner": string | null
}

## INCIDENT_END
""".strip()

# ── Few-shot example (1 worked example anchors the pattern) ──────────────────
FEW_SHOT_EXAMPLE = """
EXAMPLE INPUT:
Subject: Production down - checkout broken for everyone
Body: Getting 500 errors on all checkout attempts since 14:03 UTC.
All payment methods affected. Revenue stopped. Confirmed on staging too.
Rollback attempted, still failing.

EXAMPLE OUTPUT:
<thinking>
This is a full production outage on the checkout/payment component.
'All payment methods affected' and 'Revenue stopped' → P1.
Affected scope is all users. Error type is HTTP 500.
Steps to reproduce: implied (any checkout attempt). Owner: payments team.
</thinking>

## INCIDENT_START
{
  "title": "Fix checkout 500 errors blocking all payments",
  "severity": "P1",
  "component": "payments",
  "affected_users": "all",
  "error_type": "HTTP 500",
  "steps_to_reproduce": true,
  "suggested_owner": "payments-team"
}
## INCIDENT_END
""".strip()

# ── Test bug report emails ────────────────────────────────────────────────────
BUG_REPORTS = [
    {
        "label": "P1 — Full outage",
        "email": (
            "Subject: URGENT - Login broken, no one can access the app\n"
            "Body: Since the 09:15 deployment, all users get a white screen after "
            "entering credentials. Auth logs show JWT validation failing. "
            "Tried reverting the config flag — no improvement. "
            "Support queue is exploding."
        ),
    },
    {
        "label": "P2 — Subset affected",
        "email": (
            "Subject: Dashboard charts not loading for enterprise accounts\n"
            "Body: Multiple enterprise customers reporting empty charts on the "
            "analytics dashboard. Free tier seems fine. Started around yesterday "
            "evening. No error in browser console, just blank panels. "
            "Reproduced on Chrome and Firefox."
        ),
    },
    {
        "label": "P3 — Single user, vague",
        "email": (
            "Subject: Something's off with my exports\n"
            "Body: Hey, when I try to download my report it just spins. "
            "Happened twice today. Not sure if it's me or a wider issue. "
            "Using Safari on Mac."
        ),
    },
]


# ── Pipeline utilities (from PDF pattern) ────────────────────────────────────

def extract_reasoning(raw: str) -> tuple[str, str]:
    thinking_match = re.search(r"<thinking>(.*?)</thinking>", raw, re.DOTALL)
    reasoning = thinking_match.group(1).strip() if thinking_match else ""
    clean = re.sub(r"<thinking>.*?</thinking>", "", raw, flags=re.DOTALL).strip()
    return reasoning, clean


def extract_json(text: str) -> str:
    match = re.search(r"##\s*INCIDENT_START\s*(.*?)\s*##\s*INCIDENT_END", text, re.DOTALL)
    return match.group(1).strip() if match else text.strip()


def validate(data: dict) -> None:
    assert isinstance(data["title"], str) and len(data["title"].split()) <= 10
    assert data["severity"] in ("P1", "P2", "P3")
    assert isinstance(data["component"], str)
    assert data["affected_users"] in ("all", "subset", "single", None)
    assert isinstance(data["steps_to_reproduce"], bool)


def parse_bug_report(email: str) -> tuple[dict, str, int, int]:
    user_prompt = (
        f"{FEW_SHOT_EXAMPLE}\n\n"
        f"Now parse this bug report using the same format:\n\n"
        f"INPUT:\n{email}\n\n"
        f"OUTPUT FORMAT:\n{OUTPUT_FORMAT}"
    )

    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=700,
        temperature=0.1,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
    )

    raw = response.choices[0].message.content.strip()
    reasoning, clean = extract_reasoning(raw)
    json_str = extract_json(clean)
    data = json.loads(json_str)
    validate(data)
    return data, reasoning, response.usage.prompt_tokens, response.usage.completion_tokens


if __name__ == "__main__":
    print()
    print("  Combining Patterns: Bug Report Triage Pipeline")
    print("  Role + Few-shot + Hidden CoT + Structured Output + Validation")
    print("=" * 66)

    print("\n  PIPELINE ANATOMY:")
    print("  ┌─ system prompt ──── Role/Persona + CoT instruction + output contract")
    print("  ├─ user prompt ────── 1 few-shot example + format spec + input email")
    print("  ├─ model output ───── <thinking>...</thinking> + structured JSON")
    print("  ├─ extract_reasoning() ── strips CoT, keeps JSON (hidden CoT pattern)")
    print("  └─ validate() ─────── schema check before returning to caller")
    print()

    passed = 0
    for report in BUG_REPORTS:
        print(f"  ── {report['label']} {'─' * (44 - len(report['label']))}")
        print(f"  Email preview: \"{report['email'][:70]}...\"")
        print()
        try:
            data, reasoning, t_in, t_out = parse_bug_report(report["email"])
            passed += 1

            print(f"  CoT reasoning (hidden from user):")
            for line in reasoning.split("\n"):
                if line.strip():
                    print(f"    {line.strip()}")

            print()
            print(f"  Final record (shown to caller):  tokens {t_in} in / {t_out} out")
            print(f"    title     : {data['title']}")
            print(f"    severity  : {data['severity']}")
            print(f"    component : {data['component']}")
            print(f"    affected  : {data['affected_users']}")
            print(f"    error     : {data.get('error_type')}")
            print(f"    repro     : {data['steps_to_reproduce']}")
            print(f"    owner     : {data.get('suggested_owner')}")
            print(f"  ✓ Validated")

        except (json.JSONDecodeError, AssertionError, KeyError, AttributeError) as e:
            print(f"  ✗ Pipeline failed: {e}")
        print()

    print("─" * 66)
    print(f"  Results: {passed}/{len(BUG_REPORTS)} parsed and validated")
    print()
    print("── WHAT JUST HAPPENED ──────────────────────────────────────────")
    print("  This is what a production prompt looks like.")
    print("  Not one technique — all of them, working together:")
    print()
    print("  Role/Persona   → system prompt defined the model's job")
    print("  Few-shot       → 1 example anchored format and severity reasoning")
    print("  Hidden CoT     → model reasoned inside <thinking> tags")
    print("                   caller sees only clean structured output")
    print("  Structured Out → strict JSON schema enforced output space")
    print("  Validation     → server-side check before trusting the output")
    print()
    print("  The result: a reusable, testable, versionable mini-pipeline.")
    print("  This is the pattern. Build everything like this.")
    print()
