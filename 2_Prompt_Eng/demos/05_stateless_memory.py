# =============================================================================
# DEMO 05 — Stateless Memory
# AI4SWE · Lecture 2
# =============================================================================
# The model has no memory between API calls — proved live.
# History injection gives the model its "memory".
# A chatbot loop shows context size growing every turn.
# You maintain state. The model is a stateless function.
# RUN: python 05_stateless_memory.py
# =============================================================================

import os
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.1-8b-instant"

MSG_A  = "My name is Musab and I'm building an AI course for software engineers."
MSG_B  = "What's my name and what am I building?"

SYSTEM = "You are a concise assistant for the AI4SWE course. Answer in 1-2 sentences."
TURNS  = [
    "I'm Ahmed, a backend engineer.",
    "What programming concepts will help me most in AI engineering?",
    "Given my background, which lecture should I focus on first?",
]


def call(messages: list, system: str = None) -> str:
    msgs = ([{"role": "system", "content": system}] if system else []) + messages
    r    = client.chat.completions.create(model=MODEL, max_tokens=80, temperature=0.0, messages=msgs)
    return r.choices[0].message.content.strip()


if __name__ == "__main__":
    # Part 1 — stateless: two independent calls, no history shared
    reply_a = call([{"role": "user", "content": MSG_A}])
    reply_b = call([{"role": "user", "content": MSG_B}])
    print("[Stateless — fresh context each call]")
    print(f"  call A: {MSG_A!r}")
    print(f"          {reply_a}")
    print(f"  call B: {MSG_B!r}")
    print(f"          {reply_b}\n")

    # Part 2 — history injected: resend call A alongside call B
    reply_c = call([
        {"role": "user",      "content": MSG_A},
        {"role": "assistant", "content": reply_a},
        {"role": "user",      "content": MSG_B},
    ])
    print("[History injected — call A resent with call B]")
    print(f"  {reply_c}\n")

    # Part 3 — production chatbot: full history resent every turn
    print("[Production chatbot loop — context grows each turn]")
    conversation = []
    for user_msg in TURNS:
        conversation.append({"role": "user", "content": user_msg})
        reply = call(conversation, system=SYSTEM)
        conversation.append({"role": "assistant", "content": reply})
        total_chars = sum(len(m["content"]) for m in conversation)
        print(f"  turn {len(conversation) // 2}  [{total_chars} chars in context]  {reply[:80]}")
