# =============================================================================
# DEMO 05 — Stateless Memory
# AI4SWE · Lecture 2
# =============================================================================
# WHAT THIS SHOWS:
#   The model has no memory between API calls.
#   Conversation history only exists because YOU resend it.
#   Part 1: statelessness in action — the model forgets.
#   Part 2: history injection — you give the model its memory.
#   Part 3: the exact pattern a production chatbot uses.
#
# LECTURE TIE-IN:
#   f(context) → token, repeated. No state between calls.
#   This is why RAG exists: if the model forgets between calls,
#   what happens when it also never knew something? You inject it.
#   That's Lecture 5.
#
# RUN:
#   python 05_stateless_memory.py
# =============================================================================

import os
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL = "llama-3.1-8b-instant"


def call(messages: list, system: str = None) -> str:
    all_messages = []
    if system:
        all_messages.append({"role": "system", "content": system})
    all_messages.extend(messages)
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=80,
        temperature=0.0,
        messages=all_messages,
    )
    return response.choices[0].message.content.strip()


def section(title: str):
    print(f"\n  {'─' * 60}")
    print(f"  {title}")
    print(f"  {'─' * 60}\n")


if __name__ == "__main__":
    print()
    print("  Stateless Memory: The Model Forgets Between Calls")
    print("=" * 66)

    # ── PART 1: Statelessness ─────────────────────────────────────────────────
    section("PART 1 — Two independent calls. The model forgets.")

    # Call A: introduce yourself
    msg_a = "My name is Musab and I'm building an AI course for software engineers."
    reply_a = call([{"role": "user", "content": msg_a}])
    print(f"  Call A  → User   : \"{msg_a}\"")
    print(f"           Model  : \"{reply_a}\"")

    print()

    # Call B: new request — no history sent
    msg_b = "What's my name and what am I building?"
    reply_b = call([{"role": "user", "content": msg_b}])
    print(f"  Call B  → User   : \"{msg_b}\"")
    print(f"           Model  : \"{reply_b}\"")
    print()
    print("  The model has no idea. Call A never happened as far as it's concerned.")
    print("  Each call is a fresh context window. Zero state carried over.")

    # ── PART 2: History Injection ─────────────────────────────────────────────
    section("PART 2 — Same question. This time we inject the history.")

    history = [
        {"role": "user",      "content": msg_a},
        {"role": "assistant", "content": reply_a},
        {"role": "user",      "content": msg_b},
    ]
    reply_c = call(history)
    print(f"  Messages sent   : [Turn 1 user] + [Turn 1 assistant] + [Turn 2 user]")
    print(f"  Turn 2 question : \"{msg_b}\"")
    print(f"  Model answer    : \"{reply_c}\"")
    print()
    print("  The model 'remembers' because we resent the history.")
    print("  You are the memory system. The model is stateless.")

    # ── PART 3: The Production Pattern ───────────────────────────────────────
    section("PART 3 — The production chatbot pattern")

    SYSTEM = (
        "You are a concise assistant for the AI4SWE course. "
        "Answer in 1-2 sentences."
    )

    conversation = []
    turns = [
        "I'm Ahmed, a backend engineer.",
        "What programming concepts will help me most in AI engineering?",
        "Given my background, which lecture should I focus on first?",
    ]

    print("  System prompt injected on every call:")
    print(f"  \"{SYSTEM}\"\n")

    for i, user_msg in enumerate(turns, 1):
        conversation.append({"role": "user", "content": user_msg})
        reply = call(conversation, system=SYSTEM)
        conversation.append({"role": "assistant", "content": reply})

        print(f"  Turn {i}")
        print(f"    User  : {user_msg}")
        print(f"    Model : {reply}")
        print(f"    Context size: {len(conversation)} messages  ({sum(len(m['content']) for m in conversation)} chars total)")
        print()

    print("  Notice: context grows with every turn.")
    print("  The full conversation is resent on every single API call.")
    print("  This is why context window limits matter — and why RAG is needed")
    print("  when the context gets too large or the data doesn't exist in training.")
    print()
    print("── WHAT JUST HAPPENED ──────────────────────────────────────────")
    print("  Part 1: The model forgot between calls. Stateless.")
    print("  Part 2: Injecting history gave the model 'memory'.")
    print("  Part 3: A real chatbot resends the full history every turn.")
    print()
    print("  You maintain state. The model is a function.")
    print("  When the context gets too large or the model doesn't know")
    print("  something from its training — that's where RAG enters. (L5)")
    print()
