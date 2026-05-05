# =============================================================================
# DEMO 07 — The Ceiling
# AI4SWE · Lecture 2
# =============================================================================
# Prompting works inside the model's knowledge boundary.
# Part 1: model answers confidently about private data — every answer fabricated.
# Part 2: inject the real knowledge base (simulated RAG) — correct answers.
# Part 3: the decision tree — when to stop prompting and what to reach for.
# RUN: python 07_the_ceiling.py
# =============================================================================

import os
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.3-70b-versatile"

COMPANY_KB = """
INTERNAL KNOWLEDGE BASE — AI4SWE Platform  (updated 2026-04-27)

Pricing:
- Starter: $0/month, 3 projects, community support
- Pro: $49/month, unlimited projects, email support, API access
- Enterprise: custom pricing, dedicated support, SSO, audit logs

Refund policy:
- Pro: full refund within 7 days, no questions asked
- Enterprise: negotiated per contract, contact sales@ai4swe.io

API rate limits:
- Starter: 60 req/hour  |  Pro: 1000 req/hour  |  Enterprise: custom

Outage history (last 30 days):
- 2026-04-15 02:00–04:30 UTC: API gateway latency (resolved)
- 2026-04-22 14:00–14:45 UTC: Dashboard loading failures, EU region (resolved)

Current on-call: Khalid Al-Rashidi (pagerduty: @khalid)
"""

QUESTIONS = [
    "What's the price of the Pro plan and does it include API access?",
    "Was there a dashboard outage in April 2026, and who is the current on-call engineer?",
    "A customer bought Pro 3 days ago and wants a refund. Are they eligible?",
]

RAG_SYSTEM = (
    "You are a support assistant for AI4SWE. "
    "Answer ONLY using the provided knowledge base. "
    "If the information is not there, say so explicitly."
)


def call(messages: list, system: str = None, max_tokens: int = 200) -> str:
    msgs = ([{"role": "system", "content": system}] if system else []) + messages
    r    = client.chat.completions.create(model=MODEL, max_tokens=max_tokens, temperature=0.0, messages=msgs)
    return r.choices[0].message.content.strip()


if __name__ == "__main__":
    # Part 1 — no context: model hallucinates
    print("[Without context — fabricated answers]\n")
    hallucinations = []
    for q in QUESTIONS:
        answer = call([{"role": "user", "content": q}])
        hallucinations.append(answer)
        print(f"  Q: {q}")
        print(f"  A: {answer[:150]}\n")

    # Part 2 — context injected: correct answers
    print("[With knowledge base injected — simulated RAG]\n")
    for i, q in enumerate(QUESTIONS):
        rag_prompt = f"KNOWLEDGE BASE:\n{COMPANY_KB}\n\nQUESTION: {q}"
        answer     = call([{"role": "user", "content": rag_prompt}], system=RAG_SYSTEM, max_tokens=150)
        print(f"  Q:      {q}")
        print(f"  Before: {hallucinations[i][:80]}...")
        print(f"  After:  {answer}\n")

    # Part 3 — decision tree
    print("[Decision tree — when to stop prompting]\n")
    print("  Model doesn't have the information?  →  RAG (L5)")
    print("  Inconsistent output despite good prompting?  →  fine-tuning or more few-shot")
    print("  Task needs multiple steps + external actions?  →  agents (L7)")
    print("  None of the above?  →  keep improving the prompt")
