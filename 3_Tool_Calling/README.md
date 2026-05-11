# Lecture 03 — Tool Calling: Giving the Model Hands

> *In L2 the model answered questions. In L3 it takes actions.*

Before building agents, you need to understand the primitive that makes them possible. This lecture teaches tool calling end-to-end — from the mental model to production patterns — and closes with a preview of MCP and the ReAct agent loop.

By the end of this session you'll be able to define tools, run the full tool calling loop, dispatch across multiple tools, execute calls in parallel, force structured output at the API level, and handle errors gracefully.

---

## What's in This Folder

```
3_Tool_Calling/
│
├── lecture3.jsx              ← Full interactive slide deck (React)
│
└── demos/
    ├── 01_first_tool_call.py          ← Hallucination vs grounded answer — real Open-Meteo API
    ├── 02_tool_dispatch.py            ← 3 tools, 3 query types, zero dispatch code
    ├── 03_parallel_calls.py           ← Sequential vs parallel execution, real speedup
    ├── 04_structured_output_upgrade.py ← Prompt JSON (request) vs extraction tool (guarantee)
    ├── 05_error_handling.py           ← Tool fails → error returned → model recovers
    ├── bonus_langchain_intro.py       ← What LangChain wraps and why we go raw
    └── bonus_gemini_test.py           ← Same code, free Gemini API, 3-line swap
```

---

## The Demos

Five core demos + two bonus. Each one is a before/after — the diff does the teaching. Run alongside the lecture.

---

### Demo 01 — The First Tool Call
**File:** `demos/01_first_tool_call.py`

**What it shows:**
The same weather question sent twice. Without tools: the model generates a paragraph of general climate knowledge — no real data. With a `get_weather` tool backed by the real Open-Meteo API: the model requests the tool, your code executes the HTTP call, the result is injected, and the final answer is grounded in live data.

**The point:** The model doesn't run the tool — it requests it. You execute. The result goes back into the context. This is the entire mental model of tool calling.

```bash
python 01_first_tool_call.py
```

---

### Demo 02 — The Model as Dispatcher
**File:** `demos/02_tool_dispatch.py`

**What it shows:**
Three tools defined: `search_docs`, `get_user_profile`, `get_order_status`. Three different queries — one about an order, one about a policy, one about France. The model routes each query to the right tool, or makes no tool call at all for the France question. Zero dispatch logic in your code.

**The point:** You don't write dispatch logic. You write descriptions. The model reads them and routes. Your tool descriptions are your routing table.

```bash
python 02_tool_dispatch.py
```

---

### Demo 03 — Parallel Tool Calls
**File:** `demos/03_parallel_calls.py`

**What it shows:**
A query asking for weather in three cities. The model returns three tool calls in one response. We execute them two ways: sequentially (one HTTP call at a time) and in parallel (ThreadPoolExecutor). Both produce identical results. The time difference is real — three round trips to Open-Meteo measured live.

**The point:** When the model returns multiple tool calls, execute them in parallel. Sequential execution is the naive approach. Parallel execution is the production pattern.

```bash
python 03_parallel_calls.py
```

---

### Demo 04 — Native Structured Output
**File:** `demos/04_structured_output_upgrade.py`

**What it shows:**
The same PR metadata extraction task from L2 Demo 04, run two ways. L2: prompt-based JSON — you ask for JSON, strip markdown, parse, validate manually. L3: extraction tool + forced `tool_choice` — the API enforces the schema at generation time. Both score 7/7 on clean inputs. The difference is guarantees and code complexity.

**The point:** L2 is a request. L3 is a contract. The extraction tool pattern eliminates an entire class of parsing bugs — the model physically cannot output a value outside your enum.

```bash
python 04_structured_output_upgrade.py
```

---

### Demo 05 — Error Handling in the Loop
**File:** `demos/05_error_handling.py`

**What it shows:**
One query, two runs. A banking tool that either succeeds or raises a TimeoutError. On success: clean balance returned. On failure: error string injected as tool result content, model responds gracefully. No crash. No hallucinated balance. The loop never breaks.

**The point:** Never swallow tool errors silently. Return the error as content — the model adapts. An empty result causes hallucination. An explicit error causes graceful recovery.

```bash
python 05_error_handling.py
```

---

### Bonus — LangChain Introduction
**File:** `demos/bonus_langchain_intro.py`

**What it shows:**
LangChain's tool calling API in three parts: `bind_tools` (loop still yours), `create_react_agent` (loop fully hidden), and a provider swap showing the same code run against Groq and then Anthropic with one line changed. Closes with a side-by-side of what each approach hides vs exposes.

**The point:** LangChain is less code but hides the mechanism. This course teaches the raw SDK so the framework is obvious — not magic.

```bash
# Requires: uv add langchain-openai langchain-anthropic langchain-core langchain
python bonus_langchain_intro.py
```

---

### Bonus — Gemini Free Tier
**File:** `demos/bonus_gemini_test.py`

**What it shows:**
Demo 01 run against Google's Gemini 2.0 Flash instead of Groq. Three lines change — the client, base URL, and model name. Everything else is identical. Confirms the OpenAI-compatible format works across providers.

**The point:** The tool calling code you write is provider-agnostic. Swap 3 lines, same code runs on Groq, Gemini, DeepSeek, or any OpenAI-compatible provider.

```bash
# Requires: GEMINI_API_KEY in .env (free at aistudio.google.com — no payment needed)
python bonus_gemini_test.py
```

---

## Setup

```bash
# Same stack as L1 and L2 — GROQ_API_KEY already in .env, no new setup needed
cd 3_Tool_Calling/demos
python 01_first_tool_call.py

# LangChain bonus only:
uv add langchain-openai langchain-anthropic langchain-core langchain

# Gemini bonus only:
# 1. Go to aistudio.google.com → Get API Key (free, Google account only)
# 2. Add to .env: GEMINI_API_KEY=your_key_here
python bonus_gemini_test.py
```

**API format:** L3 uses the OpenAI-compatible format (Groq). This is the industry standard — Groq, DeepSeek, Qwen, OpenRouter all speak this format:
- Tool results use `role: "tool"`
- Schema field is `parameters` (not `input_schema`)
- Detection via `finish_reason == "tool_calls"`

---

## What This Lecture Covers

| Section | What You Learn |
|---|---|
| **3 Generations** | Raw API → Tool Calling → MCP — the evolution and when to use each |
| **The Mental Model** | The model requests tools. You execute. Result is context. You own the loop. |
| **Tool Anatomy** | name, description, parameters — why description is the most important field |
| **The Loop** | 5-step cycle: send → tool_use → execute → inject → final answer |
| **Dispatch** | Descriptions route queries. No if/else needed. Model is the router. |
| **Parallel Calls** | Multiple tool calls per response. Always iterate all. Execute in parallel. |
| **Tool Choice** | auto / required / forced — and the extraction pattern for schema guarantees |
| **Error Handling** | Return error as content. Loop never crashes. Model handles recovery. |
| **ReAct Preview** | The while loop that turns tool calling into an agent. That's L4. |
| **MCP Preview** | One server, any client, auto-discovery. That's L4. |

---

*Part of the [AI4SWE](https://github.com/SAIR-Org/AI4SWE) series — AI Engineering for Software Engineers.*
