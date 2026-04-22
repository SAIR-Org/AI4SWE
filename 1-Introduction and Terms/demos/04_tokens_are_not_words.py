# DEMO 03 - Tokens Are Not Words
# AI4SWE - Lecture 1
# RUN: uv add tiktoken
# No API key needed
# WHAT THIS SHOWS:
#   Part 3 of the lecture: tokens are the unit for context windows, latency, and cost.
#   Engineers need to reason in tokens, not in plain word counts.

import tiktoken

enc = tiktoken.get_encoding("cl100k_base")

EXAMPLES = [
    ("Simple English",   "The cat sat on the mat."),
    ("Complex words",    "Unbelievably, the phenomenon was counterintuitive."),
    ("Python code",      "def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)"),
    ("Big numbers",      "The model has 70,000,000,000 parameters."),
    ("Arabic (short)",   "مرحبا بالعالم"),
    ("Arabic (long)",    "نماذج اللغة الكبيرة هي أنظمة ذكاء اصطناعي تعلمت من كميات ضخمة من البيانات"),
]

if __name__ == "__main__":
    print()
    for label, text in EXAMPLES:
        words  = len(text.split())
        tokens = len(enc.encode(text))
        ratio  = tokens / words
        print(f"  {label:<22} {words:>5} words  {tokens:>6} tokens  {ratio:.1f}x")

    print()

    # BPE in action - show how one word becomes multiple tokens
    word   = "counterintuitive"
    pieces = [enc.decode([t]) for t in enc.encode(word)]
    print(f"  '{word}' -> {pieces}")
    print(f"  BPE split this word into {len(pieces)} tokens")

    print()
    print("  HOW IT WORKS: BPE (Byte Pair Encoding)")
    print("  Starts with characters, merges most frequent pairs repeatedly.")
    print("  Common words    -> 1 token")
    print("  Rare/long words -> multiple tokens")
    print("  Arabic gets more tokens: the BPE vocab was built mostly on English text.")
    print()
    print("  WHY THIS MATTERS")
    print("  Context limits are token limits.")
    print("  Billing is based on tokens.")
    print("  Truncation and latency are easier to predict once you think in tokens.")


# Apply this at https://tiktokenizer.vercel.app/ and observe the results

"""
The cat sat on the mat.
Unbelievably, the phenomenon was counterintuitive.
def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)
The model has 70,000,000,000 parameters.
مرحبا بالعالم
نماذج اللغة الكبيرة هي أنظمة ذكاء اصطناعي تعلمت من كميات ضخمة من البيانات

"""
