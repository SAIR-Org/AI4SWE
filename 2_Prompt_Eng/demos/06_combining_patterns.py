# =============================================================================
# DEMO 06 — Combining Patterns: The Production Pipeline
# AI4SWE · Lecture 2
# =============================================================================
# Bug report triage — all 5 patterns in one pipeline:
#   Role/Persona   → system message as triage contract
#   Few-shot       → 1 example anchors format + severity reasoning
#   Hidden CoT     → model reasons in <thinking> tags, caller sees clean JSON
#   Structured Out → strict schema with markers
#   Validation     → server-side check before returning to caller
# RUN: python 06_combining_patterns.py
# =============================================================================

import os
import re
import json
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are a senior engineering triage assistant.
Parse bug report emails into structured incident records.

Produce TWO parts in this exact order:
1. Step-by-step reasoning inside <thinking>...</thinking> tags.
2. The final JSON record outside the tags — no other text.

Rules:
- reasoning: think about severity, affected scope, and ambiguities.
- JSON: follow the schema exactly. Use null for unknown fields.
- Never include the <thinking> block in the final output."""

OUTPUT_FORMAT = """
## INCIDENT_START
{
  "title": string,          // max 8 words, imperative verb
  "severity": "P1" | "P2" | "P3",
  "component": string,
  "affected_users": "all" | "subset" | "single" | null,
  "error_type": string | null,
  "steps_to_reproduce": boolean,
  "suggested_owner": string | null
}
## INCIDENT_END
""".strip()

FEW_SHOT_EXAMPLE = """
EXAMPLE INPUT:
Subject: Production down - checkout broken for everyone
Body: Getting 500 errors on all checkout attempts since 14:03 UTC.
All payment methods affected. Revenue stopped. Confirmed on staging too.

EXAMPLE OUTPUT:
<thinking>
Full production outage on payments. 'All payment methods' + 'Revenue stopped' → P1.
Scope: all users. Error: HTTP 500. Steps to reproduce: any checkout attempt.
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

BUG_REPORTS = [
    {
        "label": "P1 — Full outage",
        "email": (
            "Subject: URGENT - Login broken, no one can access the app\n"
            "Body: Since the 09:15 deployment, all users get a white screen after "
            "entering credentials. Auth logs show JWT validation failing. "
            "Tried reverting the config flag — no improvement. Support queue is exploding."
        ),
    },
    {
        "label": "P2 — Subset affected",
        "email": (
            "Subject: Dashboard charts not loading for enterprise accounts\n"
            "Body: Multiple enterprise customers reporting empty charts on the analytics dashboard. "
            "Free tier seems fine. Started around yesterday evening. "
            "No error in browser console, just blank panels. Reproduced on Chrome and Firefox."
        ),
    },
    {
        "label": "P3 — Single user, vague",
        "email": (
            "Subject: Something's off with my exports\n"
            "Body: Hey, when I try to download my report it just spins. "
            "Happened twice today. Not sure if it's me or a wider issue. Using Safari on Mac."
        ),
    },
]


def extract_reasoning(raw: str) -> tuple[str, str]:
    match   = re.search(r"<thinking>(.*?)</thinking>", raw, re.DOTALL)
    reason  = match.group(1).strip() if match else ""
    clean   = re.sub(r"<thinking>.*?</thinking>", "", raw, flags=re.DOTALL).strip()
    return reason, clean


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
        f"Now parse this bug report:\n\nINPUT:\n{email}\n\nOUTPUT FORMAT:\n{OUTPUT_FORMAT}"
    )
    r       = client.chat.completions.create(
        model=MODEL, max_tokens=700, temperature=0.1,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
    )
    raw             = r.choices[0].message.content.strip()
    reasoning, clean = extract_reasoning(raw)
    data            = json.loads(extract_json(clean))
    validate(data)
    return data, reasoning, r.usage.prompt_tokens, r.usage.completion_tokens


if __name__ == "__main__":
    passed = 0
    for report in BUG_REPORTS:
        print(f"[{report['label']}]")
        try:
            data, reasoning, t_in, t_out = parse_bug_report(report["email"])
            passed += 1
            print(f"  CoT  : {reasoning[:120].strip()}")
            print(f"  title: {data['title']}")
            print(f"  →  severity={data['severity']}  component={data['component']}  affected={data['affected_users']}  ({t_in}/{t_out} tokens)  ✓")
        except (json.JSONDecodeError, AssertionError, KeyError, AttributeError) as e:
            print(f"  ✗  {e}")
        print()
    print(f"{passed}/{len(BUG_REPORTS)} parsed and validated")
