# Lecture 02 — Prompt & Context Engineering

> *The context window is everything the model knows. Your job is to fill it right.*

Before writing a single production AI feature, you need to understand what you're actually controlling. This lecture reframes "prompt engineering" as a subdomain of a broader discipline — context engineering — and teaches the five patterns that cover 90% of real engineering work, plus the workflow that turns guesswork into a repeatable process.

By the end of this session you'll be able to look at any prompting problem, diagnose it by failure mode, and apply the right technique — not because you memorized a list, but because you understand the mechanism.

---

## What's in This Folder

```
2_Prompt_Eng/
│
├── lecture2.jsx              ← Full interactive slide deck (React)
│
└── demos/
    ├── 01_context_is_everything.py   ← Same question, 3 system prompts, 3 different models
    ├── 02_zero_vs_few_shot.py        ← Zero-shot → instructions only → few-shot, with token cost tracking
    ├── 03_chain_of_thought.py        ← CoT off vs on vs hidden CoT
    ├── 04_structured_output.py       ← JSON schema extraction + server-side validation
    ├── 05_stateless_memory.py        ← Model forgets between calls; history injection fixes it
    ├── 06_combining_patterns.py      ← Full production pipeline: role + few-shot + hidden CoT + JSON
    ├── 07_the_ceiling.py             ← Prompting hits a wall; simulated RAG fixes it → seeds L5
    ├── 08_prompt_injection.py        ← Four attack techniques + defense patterns + intent classifier
    └── bonus_prompt_workflow.py      ← Semantic failure: framing fools the model → 3/6 → 5/6 → 6/6
```

---

## Published Artifacts

| Artifact | Link |
|---|---|
| 🌐 Full Lecture (interactive) | *(link in video description)* |
| 🎬 Recording | *(coming soon — YouTube)* |

---

## The Demos

Eight demos plus a bonus. Each one runs a before-and-after comparison so the diff does the teaching.

---

### Demo 01 — Context Is Everything
**File:** `demos/01_context_is_everything.py`

**What it shows:**
The same user question sent to the same model with three different system prompts. Persona A: a concise expert. Persona B: a patient teacher. Persona C: a strict gatekeeper that refuses to answer without a reproduction case. The outputs are completely different — same weights, same API call, same question.

**The point:** The system message is not decoration. It is the behavioral contract your product depends on. Change the context → change the model.

**Stack layer:** L2 (Model API) — the control surface

```bash
python3 demos/01_context_is_everything.py
```

---

### Demo 02 — Zero-Shot vs Few-Shot
**File:** `demos/02_zero_vs_few_shot.py`

**What it shows:**
Commit message generation run three ways: zero-shot (no guidance), instructions only (format described in words), and few-shot (same instructions plus 3 examples). Zero-shot produces verbose inconsistent prose. Instructions alone get the format right but pick wrong types on edge cases. Few-shot locks in both format and correct type vocabulary. Token count is printed for each — the cost/quality tradeoff is visible in the terminal.

**The point:** Instructions tell the model the rules. Examples show the decisions — how to apply those rules when it's not obvious. That's the specific value few-shot adds on top of a well-written instruction.

**Stack layer:** L2 (Model API) — in-context learning

```bash
python3 demos/02_zero_vs_few_shot.py
```

---

### Demo 03 — Chain of Thought
**File:** `demos/03_chain_of_thought.py`

**What it shows:**
A multi-step arithmetic/logic problem run three ways: no CoT (model shortcuts, often wrong), zero-shot CoT ("Let's think step by step"), and hidden CoT (reasoning stripped before showing to user). Token counts are printed for each.

**The point:** CoT forces reasoning tokens into the context window before the answer token. The answer is generated with more signal available. The 4-word phrase "Let's think step by step" reshapes the decoding trajectory. Hidden CoT is the production pattern — full quality, clean output.

**Stack layer:** L2 (Model API) — decoding control

```bash
python3 demos/03_chain_of_thought.py
```

---

### Demo 04 — Structured Output
**File:** `demos/04_structured_output.py`

**What it shows:**
PR metadata extraction from plain text descriptions. Without a schema: prose output, unparseable. With a JSON schema: machine-readable on the first call. With server-side validation: the production pattern.

**The point:** A JSON schema in the prompt collapses the output space. The model's first token is constrained. Combine with `temperature=0`. Always validate server-side — the model can still deviate on edge inputs.

**Stack layer:** L2 (Model API) → application layer integration

```bash
python3 demos/04_structured_output.py
```

---

### Demo 05 — Stateless Memory
**File:** `demos/05_stateless_memory.py`

**What it shows:**
Three parts. Part 1: two independent API calls — the model introduces itself in call A, then has no idea what you said in call B because each call is a fresh context window. Part 2: resend the history from call A alongside call B — the model now "remembers". Part 3: a production chatbot loop that grows its context with every turn, showing how context size compounds.

**The point:** The model is a stateless function. You are the memory system. Conversation history only exists because you resend it. Context size grows with every turn — which is exactly why context window limits are an engineering constraint and why RAG becomes necessary.

**Stack layer:** L2 (Model API) → bridges to L5 (RAG)

```bash
python3 demos/05_stateless_memory.py
```

---

### Demo 06 — Combining Patterns: The Production Pipeline
**File:** `demos/06_combining_patterns.py`

**What it shows:**
A complete production-grade pipeline that parses bug report emails into structured incident records. All 5 patterns combined in one prompt: Role/Persona (system message as triage contract) + Few-shot (1 worked example anchors format and severity reasoning) + Hidden CoT (model reasons inside `<thinking>` tags, caller sees only clean JSON) + Structured Output (strict schema with validation) + Workflow (extract_reasoning / validate / retry pattern).

**The point:** Real AI features don't use one technique. This is what a production prompt looks like — not a toy example but a reusable, testable, versionable mini-pipeline. Directly implements the hands-on pipeline pattern from the reference PDF.

**Stack layer:** L2 (Model API) — full production pattern

```bash
python3 demos/06_combining_patterns.py
```

---

### Demo 07 — The Ceiling
**File:** `demos/07_the_ceiling.py`

**What it shows:**
Three parts. Part 1: questions the model cannot answer — private company pricing, internal incident history, company refund policy. The model answers confidently with fabricated information. Part 2: inject the real knowledge base (simulated RAG) — exact same questions, exact correct answers. Part 3: the architectural decision tree — when to stop prompting and what to reach for instead.

**The point:** No amount of prompt engineering fixes a knowledge gap. When the model doesn't have the information, the solution is to put that information in the context window at query time. That's RAG. This demo is the cliff-hanger that makes L5 feel necessary rather than optional.

**Stack layer:** L2 ceiling → L5 (RAG) motivation

```bash
python3 demos/07_the_ceiling.py
```

---

### Demo 08 — Prompt Injection
**File:** `demos/08_prompt_injection.py`

**What it shows:**
Four injection techniques against a scoped customer support bot: direct override, system prompt extraction, persona hijack, and indirect injection. Part 2 adds a naive prompt-level defense and tests whether it holds. Part 3 adds an architectural defense — a separate intent classifier that blocks the payload before it reaches the main model.

**The point:** The system prompt and user message share the same context window. There is no hard boundary. Injection is the consequence. Defense in depth is the answer: never put secrets in the system prompt, validate output not just input, and for high-stakes pipelines classify intent upstream.

**Stack layer:** L2 (Model API) — security at the prompt layer

```bash
python3 demos/08_prompt_injection.py
```

---

### Bonus — The 95% Problem
**File:** `demos/bonus_prompt_workflow.py`

**What it shows:**
A bug report severity classifier (P1/P2/P3) that works on obvious inputs but fails silently on edge cases — valid label format, wrong severity. The model is fooled by reporter framing: "Minor issue — login broken for all users" gets classified as P2. "URGENT CRITICAL EMERGENCY: button is wrong color" gets classified as P1. Three prompt versions fix this one step at a time. Pass rate: 3/6 → 5/6 → 6/6.

**The point:** Semantic failures are the harder class of prompt bugs — the output looks correct, the answer is wrong. A test suite on obvious inputs misses all of it. Prompting is debugging: if you can't describe the failure mode, you can't fix the prompt.

**Stack layer:** L2 (Model API) — prompt engineering as engineering discipline

```bash
python3 demos/bonus_prompt_workflow.py
```

---

## Setup

```bash
# Same stack as Lecture 1 — no new dependencies
# GROQ_API_KEY must be in .env

cd 2_Prompt_Eng/demos
python3 01_context_is_everything.py
```

If you haven't set up from Lecture 1:
```bash
uv add groq python-dotenv
cp ../.env.example ../.env
# Fill in GROQ_API_KEY
```

---

## What This Lecture Covers

| Section | What You Learn |
|---|---|
| **CE > PE** | Prompt Engineering is a subdomain. Context Engineering is the full discipline — RAG, history, memory, and structured outputs are all part of it. |
| **The Mental Model** | `f(context) → next_token`, repeated. The model is stateless. You manage state — not it. |
| **Three Roles** | system / user / assistant — what each one actually does at the model level, not just the API level. |
| **5 Core Patterns** | Zero-shot, few-shot, chain of thought, structured output, role/persona — each with its mechanism, tradeoff, and watchout. |
| **The Workflow** | Define → Draft → Test → Analyze → Refine → Version. Prompting is debugging, not guessing. |
| **Failure Diagnosis** | 5 failure modes and their fixes: underspecification, ambiguity, format mismatch, instruction overload, context ceiling. |
| **The Ceiling** | When prompting is not the right tool — and what to reach for instead (RAG, fine-tuning, agents). |
| **Prompt Injection** | The system prompt is not a hard boundary. Four attack techniques, two defense layers — prompt-level and architectural. |

---

*Part of the [AI4SWE](https://github.com/SAIR-Org/AI4SWE) series — AI Engineering for Software Engineers.*
