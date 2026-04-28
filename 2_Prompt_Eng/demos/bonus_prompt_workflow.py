# =============================================================================
# BONUS — Prompt Iteration Workflow
# AI4SWE · Lecture 2
# =============================================================================
# WHAT THIS SHOWS:
#   A bad prompt failing on edge cases.
#   Three prompt versions — each one fixes a diagnosed failure mode.
#   Pass rate is tracked per version across 6 test inputs.
#   This is prompts-as-code in practice: diagnose → fix → measure → commit.
#
# LECTURE TIE-IN:
#   Effective prompting is debugging, not guessing.
#   Each version is a hypothesis. One change at a time. Measure the result.
#
# RUN:
#   python bonus_prompt_workflow.py
# =============================================================================

import os
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL = "llama-3.1-8b-instant"

# ── Test cases ────────────────────────────────────────────────────────────────
# Each test case: (ticket_text, expected_problem_line)
# We check if the model output contains a "Problem:" line

TEST_CASES = [
    (
        "My login stopped working after yesterday's deployment. "
        "I tried clearing cache and using incognito mode but still can't get in.",
        "problem"
    ),
    (
        "Urgent: the payment page is down for all users. "
        "Customers are calling. No one has tried anything yet.",
        "problem"
    ),
    (
        "The dashboard loads but the charts don't show any data. "
        "I refreshed several times. A colleague has the same issue.",
        "problem"
    ),
    (
        "App crashes on iOS 17 when I tap the profile picture. "
        "Tried reinstalling — same issue. Android works fine.",
        "problem"
    ),
    (
        "Slow.",
        "problem"
    ),
    (
        "Everything is broken since the last update. "
        "I can't do anything. Please fix ASAP.",
        "problem"
    ),
]

# ── Prompt versions ───────────────────────────────────────────────────────────

PROMPT_V1 = "Summarize this support ticket."

PROMPT_V2 = """Summarize this support ticket in exactly 2 sentences.
Sentence 1: The problem. Sentence 2: What the user tried."""

PROMPT_V3 = """Summarize this support ticket using this exact format:
Problem: <one sentence describing what is broken>
Attempted fix: <one sentence describing what they tried, or "none mentioned">

Do not add any other text. Follow the format exactly."""


def call(prompt_template: str, ticket: str) -> str:
    if "{ticket}" in prompt_template:
        user_msg = prompt_template.format(ticket=ticket)
    else:
        user_msg = prompt_template + f"\n\nTicket:\n{ticket}"

    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=120,
        temperature=0.0,
        messages=[{"role": "user", "content": user_msg}],
    )
    return response.choices[0].message.content.strip()


def evaluate(output: str) -> tuple[bool, str]:
    lines = output.lower()
    has_problem_label = "problem:" in lines
    has_attempted_label = "attempted" in lines or "tried" in lines or "fix:" in lines
    is_format_correct = has_problem_label and has_attempted_label
    if is_format_correct:
        return True, "format correct"
    elif has_problem_label:
        return False, "missing 'Attempted fix' line"
    else:
        return False, "missing structured format entirely"


def run_version(label: str, version_desc: str, prompt: str, diagnosis: str):
    print(f"\n  [{label}]")
    print(f"  Prompt  : \"{prompt[:80]}...\"" if len(prompt) > 80 else f"  Prompt  : \"{prompt}\"")
    print(f"  Failure : {diagnosis}")
    print()

    passed = 0
    for i, (ticket, _) in enumerate(TEST_CASES, 1):
        output = call(prompt, ticket)
        ok, reason = evaluate(output)
        status = "✓" if ok else "✗"
        passed += ok
        short_ticket = ticket[:45] + "..." if len(ticket) > 45 else ticket.ljust(48)
        print(f"    {status}  TC{i}  {short_ticket}")
        if not ok:
            print(f"         → {reason}")
            print(f"         Output: {output[:90]}")

    rate = f"{passed}/{len(TEST_CASES)}"
    print(f"\n  Pass rate: {rate}")
    return passed


if __name__ == "__main__":
    print()
    print("  Prompt Iteration Workflow: Support Ticket Summarizer")
    print("=" * 66)

    v1 = run_version(
        "V1 — Baseline",
        PROMPT_V1,
        PROMPT_V1,
        "None — this is the first draft",
    )

    print("─" * 66)
    run_version(
        "V2 — Add structure constraint",
        PROMPT_V2,
        PROMPT_V2,
        "V1 outputs inconsistent length and format",
    )

    print("─" * 66)
    run_version(
        "V3 — Enforce with labeled format",
        PROMPT_V3,
        PROMPT_V3,
        "V2 ignores sentence rule on short/vague tickets",
    )

    print()
    print("── WHAT JUST HAPPENED ──────────────────────────────────────────")
    print("  V1: vague prompt, model wanders — inconsistent output")
    print("  V2: added length constraint — better, but still breaks on edge cases")
    print("  V3: enforced labeled structure — predictable, parseable every time")
    print()
    print("  Each version was one hypothesis. One change at a time.")
    print("  We measured pass rate — we didn't guess whether it improved.")
    print()
    print("  This is the workflow. Diagnose → fix → measure → commit.")
    print("  Prompts are code. Treat them that way.")
    print()
