# Lecture 01 — From AI to Agents: The Complete Terminology Map

> *You can't engineer what you can't name. This lecture fixes that.*

Before writing a single line of AI code, you need the map. This lecture gives you the full landscape — the history that produced modern AI, the 14 terms every engineer misuses, the 5-layer stack that everything runs on, and the taxonomy that goes from a raw model all the way to an autonomous agent.

By the end of this session, you'll be able to look at any AI system — any product, any architecture diagram, any paper — and immediately place every piece on the map.

---

## What's in This Folder

```
1-Introduction and Terms/
│
├── lecture1.jsx              ← Full interactive slide deck (React)
├── ai-tree.tsx               ← AI taxonomy tree — visual overview of the field
├── big_ai-tree.tsx           ← Expanded version with more depth
├── Lecture_1.excalidraw      ← Hand-drawn diagram: the 5-layer LLM stack
│
└── demos/
    ├── 01_the_ui_is_just_an_api_call.py   ← Demo 1: strip the UI, see the API
    ├── 02_api_parms.py                    ← Demo 2: temperature, system, max_tokens
    ├── 04_tokens_are_not_words.py         ← Demo 3: BPE tokenization in action
    ├── bonus_api.py                       ← Bonus: same call, Anthropic + OpenAI
    └── generate_lecture_excalidraw.py     ← Script that generated the diagram
```

---

## Published Artifacts

These are the live interactive versions — open them in your browser:

| Artifact | Link |
|---|---|
| 🌐 Full Lecture (interactive) | [claude.ai/public/artifacts/9c2cd345](https://claude.ai/public/artifacts/9c2cd345-6c4c-408c-a2a1-9857f7037b98) |
| 🌳 AI Taxonomy Tree | [claude.ai/public/artifacts/301ea686](https://claude.ai/public/artifacts/301ea686-a15e-4e2f-9f34-9954e32c6fc9) |
| 🌳 Bigger AI Tree | [claude.ai/public/artifacts/da67e768](https://claude.ai/public/artifacts/da67e768-2b50-4c64-b0eb-35aff2a27d1a) |

---

## The Demos

Three live demos that run during the lecture. Each one takes one concept off the slide and makes it real in a terminal.

### Demo 01 — The UI Is Just an API Call
**File:** `demos/01_the_ui_is_just_an_api_call.py`

ChatGPT and Claude are frontends. Behind them is an API. This demo strips the browser away and sends the exact same request directly — so you can see that the interface is decoration, and the API is the real surface.

```bash
uv add groq python-dotenv
python demos/01_the_ui_is_just_an_api_call.py
```

---

### Demo 02 — API Parameters Are Product Controls
**File:** `demos/02_api_parms.py`

Same model, same question — two different outputs. This demo shows how `system`, `temperature`, and `max_tokens` shape behavior. These are the knobs the UI hides. The API exposes them.

```bash
python demos/02_api_parms.py
```

---

### Demo 03 — Tokens Are Not Words
**File:** `demos/04_tokens_are_not_words.py`

Context limits, billing, and latency are all measured in tokens — not words, not characters. This demo runs BPE tokenization on English, code, and Arabic text side by side so you can see exactly how the model actually reads your input.

No API key needed.

```bash
uv add tiktoken
python demos/04_tokens_are_not_words.py
```

---

### Bonus — Same Pattern, Different Vendors
**File:** `demos/bonus_api.py`

The same question, sent to Claude (Anthropic) and GPT (OpenAI) in the same script. The providers differ. The request pattern is identical. This is your first look at why orchestration and abstraction layers exist.

```bash
pip install anthropic openai
# set ANTHROPIC_API_KEY and OPENAI_API_KEY in your .env
python demos/bonus_api.py
```

---

## Setup

```bash
# from the repo root — installs everything at once
uv add groq tiktoken python-dotenv

# copy the env template and fill in your key
cp ../.env.example ../.env
```

**.env**
```
GROQ_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here   # only needed for bonus demo
OPENAI_API_KEY=your_key_here      # only needed for bonus demo
```

Get a free Groq key at [console.groq.com](https://console.groq.com) — Demos 01–03 only need this one.

---

## What This Lecture Covers

| Section | What You Learn |
|---|---|
| **AI History** | Symbolic → ML → Deep Learning → Transformers — the 8 moments that matter |
| **14 Core Terms** | LLM, RAG, agent, inference, embedding, fine-tuning, and more — real definitions |
| **The 5-Layer Stack** | Product UI → Model API → Orchestration → Model → Systems/Hardware |
| **AI → Agent Taxonomy** | How a raw model becomes a product, an assistant, and finally an agent |
| **Engineer's Lens** | How to answer "add AI to this feature" without guessing |

---

*Part of the [AI4SWE](https://github.com/SAIR-Org/AI4SWE) series — AI Engineering for Software Engineers.*
