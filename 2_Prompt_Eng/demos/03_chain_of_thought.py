# =============================================================================
# DEMO 03 — Chain of Thought
# AI4SWE · Lecture 2
# =============================================================================
# Same problem, three ways: no CoT (shortcuts → wrong), zero-shot CoT
# ("Let's think step by step" → correct), hidden CoT (correct, clean output).
# CoT forces reasoning tokens before the answer token — more signal, better result.
# RUN: python 03_chain_of_thought.py
# =============================================================================

import os
import re
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.1-8b-instant"

PROBLEM = (
    "3 engineers can review 3 pull requests in 3 minutes.\n"
    "How long would it take 6 engineers to review 6 pull requests?"
)
# Trap: most people (and models without CoT) say 6 minutes.
# Correct answer: 3 minutes. Each engineer reviews 1 PR per 3 min.
# Doubling both team and work doesn't change the time.

HIDDEN_COT_SYSTEM = (
    "Reason step by step inside <thinking>...</thinking> tags. "
    "Output ONLY the final answer outside the tags — one line."
)


def call(messages: list, system: str = None, max_tokens: int = 400) -> tuple[str, int, int]:
    msgs = ([{"role": "system", "content": system}] if system else []) + messages
    r    = client.chat.completions.create(model=MODEL, max_tokens=max_tokens, temperature=0.0, messages=msgs)
    return r.choices[0].message.content.strip(), r.usage.prompt_tokens, r.usage.completion_tokens


def strip_thinking(text: str) -> str:
    return re.sub(r"<thinking>.*?</thinking>", "", text, flags=re.DOTALL).strip()


if __name__ == "__main__":
    print(f"Problem: {PROBLEM}\n")

    answer, t_in, t_out = call([{"role": "user", "content": PROBLEM + "\n\nAnswer with a number only."}])
    print(f"[No CoT]  ({t_in} in / {t_out} out)")
    print(f"  {answer}\n")

    reasoning, t_in, t_out = call([{"role": "user", "content": PROBLEM + "\n\nLet's think step by step."}])
    print(f"[Zero-shot CoT]  ({t_in} in / {t_out} out)")
    for line in reasoning.split("\n")[:8]:
        if line.strip():
            print(f"  {line}")
    print()

    raw, t_in, t_out = call([{"role": "user", "content": PROBLEM}], system=HIDDEN_COT_SYSTEM, max_tokens=600)
    print(f"[Hidden CoT]  ({t_in} in / {t_out} out)  |  full response: {len(raw)} chars")
    print(f"  shown to user: {strip_thinking(raw)}")
