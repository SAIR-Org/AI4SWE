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
    ├── 03_tokens_are_not_words.py         ← Demo 3: BPE tokenization in action
    └── bonus_api.py                       ← Bonus: same call, Anthropic + OpenAI
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

Three live demos that run during the lecture, plus one bonus. Each one takes a concept off the slide and makes it real in a terminal.

---

### Demo 01 — The UI Is Just an API Call
**File:** `demos/01_the_ui_is_just_an_api_call.py`

**What it shows:**
ChatGPT and Claude.ai are frontends — browsers with polish on top. Behind them is a plain HTTP request. This demo strips the browser away and sends the exact same request directly using the Groq API (Llama 3.1). The model, the question, the response — all identical. The only thing missing is the wrapper.

**The point:** The interface is decoration. The API is the real surface. Once you see this, you stop thinking about AI products as black boxes and start thinking about them as request-response systems you can replicate, extend, and control.

**Stack layer:** L1 (Product UI) → L2 (Model API)

```bash
uv add groq python-dotenv
python demos/01_the_ui_is_just_an_api_call.py
```

---

### Demo 02 — API Parameters Are Product Controls
**File:** `demos/02_api_parms.py`

**What it shows:**
Same model. Same question. Two calls with different parameters — one bare minimum, one with `system`, `temperature`, and `max_tokens` set explicitly. The outputs differ in length, tone, and determinism. The demo prints both side by side so the diff is obvious.

**The point:** The knobs the product hides (`temperature`, `system message`, `max_tokens`) are exactly the knobs that control model behavior. Every product decision about how an AI feature behaves maps directly to one of these parameters. This is where behavior becomes engineering work.

- `system` — shapes the model's identity before it speaks
- `temperature=0.0` — deterministic output, same answer every run
- `max_tokens=50` — hard cutoff, the model cannot exceed this

**Stack layer:** L2 (Model API) — the control surface

```bash
python demos/02_api_parms.py
```

---

### Demo 03 — Tokens Are Not Words
**File:** `demos/03_tokens_are_not_words.py`

**What it shows:**
Context limits, billing, and latency are all measured in tokens — not words, not characters, not lines. This demo runs BPE (Byte Pair Encoding) tokenization on six different inputs: simple English, complex English, Python code, big numbers, short Arabic, and long Arabic. It prints the word count, token count, and ratio for each. Then it zooms in on a single word (`counterintuitive`) and shows exactly how BPE splits it into sub-word pieces.

**The point:** Engineers who think in words will always be surprised by context window limits and billing. Engineers who think in tokens can predict both. The Arabic examples make the point viscerally — the tokenizer was trained mostly on English, so Arabic text costs 4–5× more tokens per word than English. That has direct cost and performance implications.

**No API key needed.** Runs entirely offline via `tiktoken`.

```bash
uv add tiktoken
python demos/03_tokens_are_not_words.py
```

---

### Bonus — Same Pattern, Different Vendors
**File:** `demos/bonus_api.py`

**What it shows:**
The same question sent to two different providers — Anthropic (Claude) and OpenAI (GPT) — in a single script. The SDKs differ slightly in naming (`input_tokens` vs `prompt_tokens`, `content[0].text` vs `choices[0].message.content`) but the structure is identical: client → create → model + messages → response.

**The point:** The provider is a detail. The engineering pattern — a client, a model, a message list, a response object — is the same everywhere. This is why abstraction layers (LangChain, LlamaIndex, LiteLLM) exist: to smooth over these surface differences. Seeing the raw APIs side by side makes the abstraction earn its keep instead of just adding indirection.

**Stack layer:** L2 (Model API) → L3 (Orchestration motivation)

```bash
# both packages are already in pyproject.toml — just sync
uv sync

# set in your .env
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here

python demos/bonus_api.py
```

---

## Setup

```bash
# from the repo root — installs everything at once
uv sync

# copy the env template and fill in your key(s)
cp .env.example .env
```

**.env** (fill in the keys you have — only GROQ_API_KEY is needed for Demos 01–03):
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
