# =============================================================================
# DEMO 07 — The Ceiling
# AI4SWE · Lecture 2
# =============================================================================
# WHAT THIS SHOWS:
#   Prompting works inside the model's knowledge boundary.
#   When you hit the ceiling, better prompting doesn't help.
#   Part 1: model answers confidently about things it cannot know.
#   Part 2: simulated RAG — inject the real context, get the right answer.
#   Part 3: the architectural decision tree.
#
# LECTURE TIE-IN:
#   Three ceilings exist:
#     - Model doesn't have the information    → RAG  (L5)
#     - Need consistent behavior at scale     → Fine-tuning
#     - Task requires multi-step + tools      → Agents (L7)
#   This demo shows ceiling #1 in action and the RAG fix.
#
# RUN:
#   python 07_the_ceiling.py
# =============================================================================

import os
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL = "llama-3.3-70b-versatile"


def call(messages: list, system: str = None, max_tokens: int = 200) -> str:
    all_messages = []
    if system:
        all_messages.append({"role": "system", "content": system})
    all_messages.extend(messages)
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        temperature=0.0,
        messages=all_messages,
    )
    return response.choices[0].message.content.strip()


def section(title: str):
    print(f"\n  {'─' * 60}")
    print(f"  {title}")
    print(f"  {'─' * 60}\n")


# ── Simulated company knowledge base ─────────────────────────────────────────
# This is what a RAG pipeline would retrieve. For this demo we inject it
# directly to show the before/after — the retrieval mechanism is L5.

COMPANY_KB = """
INTERNAL KNOWLEDGE BASE — AI4SWE Platform
Last updated: 2026-04-27

Pricing:
- Starter plan: $0/month, 3 projects, community support
- Pro plan: $49/month, unlimited projects, email support, API access
- Enterprise plan: custom pricing, dedicated support, SSO, audit logs

Refund policy:
- Pro plan: full refund within 7 days of purchase, no questions asked
- Enterprise: negotiated per contract, contact sales@ai4swe.io

API rate limits:
- Starter: 60 requests/hour
- Pro: 1000 requests/hour
- Enterprise: custom, contact sales

Outage history (last 30 days):
- 2026-04-15 02:00–04:30 UTC: API gateway latency (resolved)
- 2026-04-22 14:00–14:45 UTC: Dashboard loading failures for EU region (resolved)

Current on-call engineer: Khalid Al-Rashidi (pagerduty: @khalid)
"""

QUESTIONS = [
    {
        "label": "Company-specific pricing",
        "question": "What's the price of the Pro plan for AI4SWE and does it include API access?",
        "ceiling": "private company data — model was never trained on this",
    },
    {
        "label": "Recent internal incident",
        "question": "Was there a dashboard outage in April 2026, and who is the current on-call engineer?",
        "ceiling": "post-training event + internal operational data",
    },
    {
        "label": "Internal refund policy",
        "question": "A customer bought the Pro plan 3 days ago and wants a refund. Are they eligible?",
        "ceiling": "company-specific policy document",
    },
]


if __name__ == "__main__":
    print()
    print("  The Ceiling: When Prompting Can't Help")
    print("=" * 66)

    # ── PART 1: Hitting the ceiling ───────────────────────────────────────────
    section("PART 1 — Questions the model cannot answer correctly")
    print("  These questions require private/recent company data.")
    print("  Watch what happens without that context.\n")

    hallucinations = []

    for q in QUESTIONS:
        answer = call([{"role": "user", "content": q["question"]}])
        hallucinations.append(answer)
        print(f"  [{q['label']}]")
        print(f"  Ceiling: {q['ceiling']}")
        print(f"  Question: \"{q['question']}\"")
        print(f"  Answer  : {answer[:200]}")
        print()

    print("  The model answered confidently. Every answer is fabricated.")
    print("  This is the ceiling. No prompt engineering fixes a knowledge gap.")

    # ── PART 2: Simulated RAG fix ─────────────────────────────────────────────
    section("PART 2 — Same questions. Context injected. (Simulated RAG)")
    print("  In production, a retrieval pipeline finds the relevant chunk")
    print("  and injects it into the context window before calling the model.")
    print("  Here we inject the full KB directly to show the before/after.\n")

    RAG_SYSTEM = (
        "You are a support assistant for AI4SWE. "
        "Answer ONLY using the provided knowledge base. "
        "If the information is not in the knowledge base, say so explicitly."
    )

    for i, q in enumerate(QUESTIONS):
        rag_prompt = (
            f"KNOWLEDGE BASE:\n{COMPANY_KB}\n\n"
            f"QUESTION: {q['question']}"
        )
        rag_answer = call(
            [{"role": "user", "content": rag_prompt}],
            system=RAG_SYSTEM,
            max_tokens=150,
        )
        print(f"  [{q['label']}]")
        print(f"  Without context : {hallucinations[i][:100]}...")
        print(f"  With context    : {rag_answer}")
        print()

    # ── PART 3: The decision tree ─────────────────────────────────────────────
    section("PART 3 — The architectural decision tree")

    print("  Before reaching for a more complex prompt, ask these questions:")
    print()
    print("  ┌─ Does the model have the information in its training data?")
    print("  │   NO  → RAG: retrieve and inject the relevant context  (L5)")
    print("  │   YES → try prompting harder first")
    print("  │")
    print("  ├─ Is the output inconsistent even with good prompting?")
    print("  │   YES + you have training data → Fine-tuning")
    print("  │   YES + no training data       → more examples (few-shot) or RAG")
    print("  │")
    print("  ├─ Does the task require multiple steps + external actions?")
    print("  │   YES → Agents: tools, memory, decision loops  (L7)")
    print("  │")
    print("  └─ None of the above → improve the prompt. You haven't hit the ceiling.")
    print()
    print("  Prompting is always the cheapest first attempt.")
    print("  RAG, fine-tuning, and agents are what you reach for when it's not enough.")
    print()
    print("── WHAT JUST HAPPENED ──────────────────────────────────────────")
    print("  Part 1: Model hallucinated private company data confidently.")
    print("          No prompt engineering fixes a knowledge gap.")
    print("  Part 2: Injecting the knowledge base (simulated RAG) fixed it.")
    print("          The model answered correctly from the injected context.")
    print("  Part 3: The decision tree — when to stop prompting and what to use.")
    print()
    print("  Lecture 5 (RAG) builds the real retrieval pipeline.")
    print("  This demo shows you exactly why you'll need it.")
    print()
