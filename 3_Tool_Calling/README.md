# Lecture 03 — Tool Calling: Giving the Model Hands

> *In L2 the model answered questions. In L3 it takes actions.*

Before building agents, you need to understand the primitive that makes them possible. This lecture teaches tool calling end-to-end — from the mental model to production patterns — and closes with a preview of what MCP and agents look like on top of it.

By the end of this session you'll be able to define tools, run the full tool calling loop, dispatch across multiple tools, execute calls in parallel, force structured output at the API level, and handle errors gracefully — all with the Anthropic SDK.

---

## What's in This Folder

```
3_Tool_Calling/
│
├── lecture3.jsx              ← Full interactive slide deck (React)
│
└── demos/
    ├── 01_first_tool_call.py          ← Before: hallucination. After: grounded answer via tool loop.
    ├── 02_tool_dispatch.py            ← Descriptions as dispatch logic — clear vs vague, same query
    ├── 03_parallel_calls.py           ← Model returns 3 tool_use blocks, execute all, one final answer
    ├── 04_structured_output_upgrade.py ← L2 prompt-based JSON vs L3 extraction tool (pass rate diff)
    ├── 05_error_handling.py           ← is_error=True, graceful recovery, loop never crashes
    └── bonus_description_engineering.py ← Same schema, two descriptions, 2/6 → 6/6
```

---

## The Demos

Six demos. Each one is a before/after — the diff does the teaching. Run alongside the lecture.

---

### Demo 01 — The First Tool Call
**File:** `demos/01_first_tool_call.py`

**What it shows:**
The same weather question sent twice. Without tools: the model confidently fabricates a temperature. With a `get_weather` tool defined: the model requests it, your code executes it, the result is injected, and the final answer is grounded in real (mock) data.

**The point:** The model doesn't run the tool — it requests it. You execute. The result goes back into the context. This is the entire mental model of tool calling.

```bash
python 01_first_tool_call.py
```

---

### Demo 02 — The Model as Dispatcher
**File:** `demos/02_tool_dispatch.py`

**What it shows:**
Three tools defined: `search_docs`, `get_user_profile`, `get_order_status`. One query that needs two of them. With clear descriptions: model routes correctly, calls the right two, skips the third. With vague descriptions ("Gets balance", "Gets order"): model misroutes on the same query.

**The point:** You don't write dispatch logic. You write descriptions. The descriptions are the dispatch table. Vague descriptions are silent routing bugs.

```bash
python 02_tool_dispatch.py
```

---

### Demo 03 — Parallel Tool Calls
**File:** `demos/03_parallel_calls.py`

**What it shows:**
A query asking for weather in three cities at once. The model returns three `tool_use` blocks in a single response. All three are executed, all three results are returned in one user message, and the model generates one final answer covering all three cities.

**The point:** Always iterate over all `tool_use` blocks — never assume there is only one. Parallel execution reduces latency from 3× to 1×.

```bash
python 03_parallel_calls.py
```

---

### Demo 04 — Native Structured Output
**File:** `demos/04_structured_output_upgrade.py`

**What it shows:**
The same PR metadata extraction task from L2 Demo 04, run two ways side by side. L2 approach: prompt-based JSON with server-side validation — works but can deviate on edge inputs. L3 approach: an extraction tool with `tool_choice` forced — the schema is enforced at the API level.

**The point:** Tool calling is the most reliable way to get structured output from a model. The extraction tool pattern (a tool with no side effects, forced invocation) upgrades prompt-based JSON for critical production paths.

```bash
python 04_structured_output_upgrade.py
```

---

### Demo 05 — Error Handling in the Loop
**File:** `demos/05_error_handling.py`

**What it shows:**
A tool that calls a flaky external API — shown once working and once failing. On failure: the error is returned in `tool_result` with `is_error=True`. The model sees the error, adapts, and responds gracefully. No crash. No hallucinated response. The loop continues.

**The point:** Never swallow tool errors silently. Return `is_error=True` with the error message — the model will handle recovery. An empty result causes hallucination. An error result causes adaptation.

```bash
python 05_error_handling.py
```

---

### Bonus — The Description Is the Prompt
**File:** `demos/bonus_description_engineering.py`

**What it shows:**
Six queries. Same tools. Same model. Two sets of descriptions: vague (one word each) vs engineered (precise, with when-to-call and when-not-to-call guidance). The schema never changes. Pass rate: vague 2/6, engineered 6/6.

**The point:** The description field is the most under-engineered part of tool calling. It determines when the tool is called, whether it's the right tool, and what arguments make sense. Engineer it like a system prompt.

```bash
python bonus_description_engineering.py
```

---

## Setup

```bash
# Switch to Anthropic SDK — tool calling is native here
uv add anthropic

# ANTHROPIC_API_KEY already in .env from L1 bonus demo
# If not: add it to .env at the repo root

cd 3_Tool_Calling/demos
python 01_first_tool_call.py
```

**Note:** L3 switches from Groq to the Anthropic SDK. The Anthropic tool calling format differs from OpenAI:
- Result role is `"user"` (not `"tool"`)
- `tool_choice` format: `{"type": "tool", "name": "..."}` (not `{"type": "function", ...}`)
- Schema field is `input_schema` (not `parameters`)

---

## What This Lecture Covers

| Section | What You Learn |
|---|---|
| **3 Generations** | Raw API → Tool Calling → MCP — the evolution and when to use each |
| **The Mental Model** | The model requests tools. You execute. Result is context. You own the loop. |
| **Tool Anatomy** | name, description, input_schema — and why description is the most important field |
| **The Loop** | 5-step cycle: send → tool_use → execute → inject → final answer |
| **Dispatch** | Descriptions route queries. No if/else. Vague descriptions = silent routing bugs. |
| **Parallel Calls** | Multiple tool_use blocks in one response. Always iterate all, never assume one. |
| **Tool Choice** | auto / any / forced — and the extraction pattern for guaranteed structured output |
| **Error Handling** | is_error=True, graceful recovery, loop never crashes |
| **ReAct Preview** | The while loop that turns tool calling into an agent. That's L4. |
| **MCP Preview** | One server, any client, auto-discovery. That's L4. |

---

*Part of the [AI4SWE](https://github.com/SAIR-Org/AI4SWE) series — AI Engineering for Software Engineers.*
