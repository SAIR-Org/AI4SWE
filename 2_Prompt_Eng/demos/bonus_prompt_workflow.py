# =============================================================================
# BONUS — The 95% Problem: Debugging Semantic Failures
# AI4SWE · Lecture 2
# =============================================================================
# A severity classifier that works on obvious inputs but fails silently
# on edge cases — valid label, wrong answer. The model is fooled by the
# reporter's language, not confused about the task.
# V1 → V2 → V3: each version diagnoses one failure mode and applies one fix.
# RUN: python bonus_prompt_workflow.py
# =============================================================================

import os
import re
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.1-8b-instant"

# (ticket, expected_severity, description_of_edge_case)
TEST_CASES = [
    ("Production API is down. All requests returning 500 errors.",                                         "P1", "clear P1"),
    ("The font on the settings page looks slightly off on Firefox.",                                       "P3", "clear P3"),
    ("Minor issue — login is broken for all users since this morning.",                                    "P1", "minimizing language, critical impact"),
    ("URGENT CRITICAL EMERGENCY: The submit button is the wrong shade of blue.",                           "P3", "urgency inflation, cosmetic issue"),
    ("Things seem mostly fine. We're seeing errors on about 60% of payment attempts since the deploy.",    "P1", "soft framing, severe revenue impact"),
    ("App is loading a little slow since the deploy. 12 seconds now vs 2 seconds before.",                 "P2", "performance regression in minimizing language"),
]

# V1: bare instruction — no definitions, model uses its own interpretation
PROMPT_V1 = (
    "Classify this bug report as P1, P2, or P3.\n"
    "Reply with ONLY the severity label — nothing else.\n\n"
    "Report: \"{ticket}\""
)

# V2: impact-first definitions — severity determined by actual impact, not language
PROMPT_V2 = (
    "Classify this bug report as P1, P2, or P3.\n"
    "Reply with ONLY the severity label — nothing else.\n\n"
    "Severity is determined by ACTUAL IMPACT, not the reporter's language:\n"
    "- P1: Full outage, revenue blocked, or all users affected.\n"
    "- P2: Feature broken or significantly degraded for a subset of users.\n"
    "- P3: Cosmetic issue, single-user edge case, or enhancement request.\n\n"
    "Report: \"{ticket}\""
)

# V3: definitions + few-shot anchors for the framing edge cases
PROMPT_V3 = (
    "Classify this bug report as P1, P2, or P3.\n"
    "Reply with ONLY the severity label — nothing else.\n\n"
    "Severity is determined by ACTUAL IMPACT, not the reporter's language:\n"
    "- P1: Full outage, revenue blocked, or all users affected.\n"
    "- P2: Feature broken or significantly degraded for a subset of users.\n"
    "- P3: Cosmetic issue, single-user edge case, or enhancement request.\n\n"
    "Examples — framing does not change the label:\n"
    "\"Just a tiny glitch — nobody can complete checkout right now.\" → P1\n"
    "\"CRITICAL ALERT: please update the dashboard background color.\" → P3\n"
    "\"Seems mostly fine but 55% of payment attempts are failing since the deploy.\" → P1\n\n"
    "Report: \"{ticket}\""
)


def call(prompt_template: str, ticket: str) -> str:
    r = client.chat.completions.create(
        model=MODEL, max_tokens=5, temperature=0.0,
        messages=[{"role": "user", "content": prompt_template.format(ticket=ticket)}],
    )
    return r.choices[0].message.content.strip()


def evaluate(output: str, expected: str) -> tuple[bool, str]:
    match = re.search(r"P[123]", output.upper())
    if not match:
        return False, f"no valid label in: '{output[:30]}'"
    found = match.group()
    return (True, "correct") if found == expected else (False, f"got {found}, expected {expected}")


def run_version(label: str, prompt: str) -> int:
    print(f"[{label}]")
    passed = 0
    for ticket, expected, description in TEST_CASES:
        output        = call(prompt, ticket)
        ok, reason    = evaluate(output, expected)
        passed       += ok
        status        = "✓" if ok else "✗"
        short_ticket  = ticket[:52] + "..." if len(ticket) > 52 else ticket.ljust(55)
        print(f"  {status}  [{expected}]  {short_ticket}")
        if not ok:
            print(f"         → {reason}  ({description})")
    print(f"  pass rate: {passed}/{len(TEST_CASES)}\n")
    return passed


if __name__ == "__main__":
    run_version("V1 — bare instruction (no definitions)",       PROMPT_V1)
    run_version("V2 — impact-first severity definitions",      PROMPT_V2)
    run_version("V3 — definitions + few-shot framing anchors", PROMPT_V3)
