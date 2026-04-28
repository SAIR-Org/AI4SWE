# =============================================================================
# DEMO 03 — Chain of Thought
# AI4SWE · Lecture 2
# =============================================================================
# WHAT THIS SHOWS:
#   The same multi-step reasoning problem run three ways:
#   1. Standard — model shortcuts to an answer (often wrong)
#   2. Zero-shot CoT — "Let's think step by step" changes everything
#   3. Hidden CoT — reasoning stripped before showing the user
#
# LECTURE TIE-IN:
#   CoT forces reasoning tokens into the context before the answer token.
#   The answer is generated with more signal available — better routing.
#   Hidden CoT = quality benefit without UX verbosity.
#
# RUN:
#   python 03_chain_of_thought.py
# =============================================================================

import os
import re
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL = "llama-3.1-8b-instant"

PROBLEM = """3 engineers can review 3 pull requests in 3 minutes.
How long would it take 6 engineers to review 6 pull requests?"""

# The shortcut trap: most people (and models without CoT) say 6 minutes.
# Right answer: 3 minutes.
# Each engineer reviews 1 PR in 3 minutes.
# 6 engineers reviewing 6 PRs is the same rate — still 3 minutes.
# Doubling the team and the work doesn't change the time.

HIDDEN_COT_SYSTEM = """You are a precise problem solver.
Reason through problems step by step inside <thinking>...</thinking> tags.
Output ONLY the final answer and one line of explanation outside the tags.
Do not show your working in the final output."""


def call(messages: list, system: str = None, max_tokens: int = 400) -> tuple[str, int, int]:
    kwargs = dict(model=MODEL, max_tokens=max_tokens, temperature=0.0, messages=messages)
    if system:
        kwargs["messages"] = [{"role": "system", "content": system}] + messages
    response = client.chat.completions.create(**kwargs)
    content = response.choices[0].message.content.strip()
    return content, response.usage.prompt_tokens, response.usage.completion_tokens


def strip_thinking(text: str) -> str:
    cleaned = re.sub(r"<thinking>.*?</thinking>", "", text, flags=re.DOTALL)
    return cleaned.strip()


if __name__ == "__main__":
    print(f"\n  Problem:\n")
    for line in PROBLEM.strip().split("\n"):
        print(f"    {line}")
    print()
    print("=" * 66)

    # 1. Standard — no CoT
    print("\n  [1] STANDARD — No CoT")
    answer, t_in, t_out = call([{"role": "user", "content": PROBLEM + "\n\nAnswer with a number only."}])
    print(f"  Tokens in/out : {t_in} / {t_out}")
    print(f"  Answer        : {answer[:200]}")
    print()

    # 2. Zero-shot CoT
    print("─" * 66)
    print("\n  [2] ZERO-SHOT CoT — 'Let's think step by step'")
    cot_prompt = PROBLEM + "\n\nLet's think step by step."
    reasoning, t_in, t_out = call([{"role": "user", "content": cot_prompt}])
    print(f"  Tokens in/out : {t_in} / {t_out}")
    print(f"  Reasoning     :")
    for line in reasoning[:500].split("\n"):
        print(f"    {line}")
    if len(reasoning) > 500:
        print("    ...")
    print()

    # 3. Hidden CoT
    print("─" * 66)
    print("\n  [3] HIDDEN CoT — Full reasoning, clean output shown to user")
    raw, t_in, t_out = call(
        [{"role": "user", "content": PROBLEM}],
        system=HIDDEN_COT_SYSTEM,
        max_tokens=600,
    )
    visible = strip_thinking(raw)
    print(f"  Tokens in/out : {t_in} / {t_out}")
    print(f"  Raw output    : {len(raw)} chars (includes hidden reasoning)")
    print(f"  Shown to user :")
    for line in visible.split("\n"):
        print(f"    {line}")
    print()

    print("── WHAT JUST HAPPENED ──────────────────────────────────────────")
    print("  [1] Standard: model jumps to an answer — often wrong on multi-step.")
    print("  [2] CoT: reasoning tokens appear BEFORE the answer token.")
    print("      The answer is generated with more signal in context.")
    print("  [3] Hidden CoT: same quality as [2], but the user sees only the answer.")
    print("      This is the production pattern — quality without UX clutter.")
    print()
    print("  The 4 words 'Let's think step by step' reshape the decoding trajectory.")
    print()
