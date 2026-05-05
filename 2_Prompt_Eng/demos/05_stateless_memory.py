# =============================================================================
# DEMO 05 — Stateless Memory
# AI4SWE · Lecture 2
# =============================================================================
# The model has no memory between API calls — proved live.
# History injection gives the model its "memory".
# Part 3: interactive chatbot — the audience types, the bot remembers.
# You maintain state. The model is a stateless function.
# RUN: python 05_stateless_memory.py
# =============================================================================

import os
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.1-8b-instant"

MSG_A  = "My name is Silba and I'm building an AI course for software engineers with Musab."
MSG_B  = "What's my name and what am I building?"

SYSTEM = "You are a concise assistant. Answer in 1-2 sentences. Be direct."


def call(messages: list, system: str = None, max_tokens: int = 60) -> str:
    msgs = ([{"role": "system", "content": system}] if system else []) + messages
    r    = client.chat.completions.create(model=MODEL, max_tokens=max_tokens, temperature=0.7, messages=msgs)
    return r.choices[0].message.content.strip()


if __name__ == "__main__":
    BRIEF = "Reply in one short sentence only."

    # Part 1 — stateless: two independent calls, no history shared
    reply_a = call([{"role": "user", "content": MSG_A}], system=BRIEF, max_tokens=40)
    reply_b = call([{"role": "user", "content": MSG_B}], system=BRIEF, max_tokens=40)
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
    ], system=BRIEF, max_tokens=40)
    print("[History injected — call A resent with call B]")
    print(f"  {reply_c}\n")

    # Part 3 — interactive chatbot: the audience types, the bot remembers
    print("[Interactive chatbot — the full history is resent on every call]")
    print("  type 'quit' to exit\n")
    conversation = []
    while True:
        user_input = input("  You: ").strip()
        if not user_input or user_input.lower() in ("quit", "exit", "q"):
            break
        conversation.append({"role": "user", "content": user_input})
        reply = call(conversation, system=SYSTEM, max_tokens=150)
        conversation.append({"role": "assistant", "content": reply})
        total_chars = sum(len(m["content"]) for m in conversation)
        print(f"  Bot: {reply}")
        print(f"  [{len(conversation) // 2} turns · {total_chars} chars in context]\n")
