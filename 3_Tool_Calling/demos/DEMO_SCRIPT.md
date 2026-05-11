# Lecture 3 — Demo Presenter Script
**AI4SWE · Tool Calling: Giving the Model Hands**
*Personal reference only — not committed*

---

## Demo 01 — The First Tool Call
`python 01_first_tool_call.py`

### The Concept
In L2 the model answered questions. In L3 it takes actions. But there's a distinction you need to land before running a single line of code: the model does not execute tools. It requests them. You execute them. The model reads the result.

This is not a subtle point. It changes how you think about debugging, security, and architecture. If the model ran your functions directly, you'd have no control point. Because it only *requests* them, you control what actually happens — you decide whether to call the real banking API, the mock, or nothing at all.

That's the mental model. Now let's prove it in the simplest way possible.

### The Code
One question: "What's the weather like in Addis Ababa right now?"

We run it twice. First with no tools — the model answers from its training data, which has no real-time information. Then we define one tool: `get_weather` with a description, a location parameter, and a real API call to Open-Meteo behind it. The model sees the tool, decides to call it, passes the location. Our code executes the HTTP request. We inject the result. The model generates a final answer grounded in live data.

Three things to point out while the code runs:
1. The `[tool called]` line — that's our code printing, not the model. The model returned a structured request, we executed it.
2. The `[tool result]` line — real HTTP response from Open-Meteo, not made up.
3. The final answer — one specific sentence with real numbers, not a paragraph about "typical climate patterns."

### Real Output
```
Question: What's the weather like in Addis Ababa right now?

[BEFORE — no tools]
  → I'm not able to access real-time weather conditions. However, I can tell you that
    Addis Ababa has a subtropical highland climate, with average temperatures between
    15°C and 22°C throughout the year...
    [4 paragraphs of general climate knowledge — none of it current]

[AFTER — get_weather tool defined]
  [iter 1] tool called: get_weather({'location': 'Addis Ababa'})
  [iter 1] tool result: {'location': 'Addis Ababa', 'temp_c': 16.5, 'humidity': 39, 'condition': 'overcast'}
  → The current weather in Addis Ababa is overcast with a temperature of 16.5°C
    and a humidity of 39%.
```

The BEFORE is four paragraphs of educated guessing. The AFTER is one sentence of fact. The model didn't get smarter — it got grounded. That's the entire value proposition of tool calling.

---

## Demo 02 — The Model as Dispatcher
`python 02_tool_dispatch.py`

### The Concept
Here's the thing that surprises most engineers when they first use tool calling: you don't write dispatch logic. There's no `if "balance" in query: call_balance_tool`. You write tool descriptions, and the model reads them and routes.

Your tool descriptions are your routing table. The model is the router.

This sounds obvious until you see it working across three completely different query types in one script — and realize you wrote zero branching code.

### The Code
Three tools: `search_docs`, `get_user_profile`, `get_order_status`. Three queries: one about a specific order, one about the return policy, one about France.

All three queries hit the same routing function. No if/else. The model reads the descriptions on every call and decides which tool — or no tool at all — is appropriate.

Point out the third query while it runs: "What's the capital of France?" — a question none of the tools can help with. The model correctly returns no tool call at all and answers directly from its knowledge. You wrote no special handling for this case.

### Real Output
```
3 tools available: search_docs | get_user_profile | get_order_status

Query: What's the status of order #4421?
  → get_order_status({"order_id":"4421"})

Query: How does the return policy work?
  → search_docs({"query":"return policy"})

Query: What's the capital of France?
  → (no tool called — model answered directly)

Each query routed to a different tool — or no tool at all.
Three tools available. Model picks the right one each time.
No if/else in your code. Descriptions are the dispatch table.
```

Three outcomes from three queries. One tool per query — exactly the right one. And France correctly got no tool. All of that happened from descriptions, not code.

---

## Demo 03 — Parallel Tool Calls
`python 03_parallel_calls.py`

### The Concept
The model doesn't always return one tool call. Sometimes it returns several in a single response. The question is: what do you do with them?

The naive approach is to execute them one after another. The production approach is to execute them all at once. If the tool calls are independent — and they usually are when the model batches them — there is no reason to wait for the first to finish before starting the second.

This demo makes the difference measurable.

### The Code
One query about weather in three cities. The model returns three tool_use blocks in one response. We then execute those three HTTP calls two ways: sequentially in a for loop, and in parallel with a ThreadPoolExecutor. Both produce the same results. The time difference is real — three separate round trips to Open-Meteo, one at a time versus all at once.

While it runs: point to the sequential timing first, then parallel. The speedup varies by network conditions but is consistently 2–3×. In production where your tools call a database, an external API, and a cache service, that difference is the latency your user feels.

### Real Output
```
Query: What's the weather right now in London, Cairo, and Addis Ababa?

[model returned 3 tool call(s)]
  → get_weather({"location":"London"})
  → get_weather({"location":"Cairo"})
  → get_weather({"location":"Addis Ababa"})

[SEQUENTIAL — one at a time]
  0.41s

[PARALLEL — ThreadPoolExecutor]
  ✓ London: 11.3°C, partly cloudy, 48% humidity
  ✓ Cairo: 30.2°C, clear sky, 26% humidity
  ✓ Addis Ababa: 16.5°C, overcast, 40% humidity
  0.28s — speedup: 1.4×

[final answer]
  → The current weather in London is partly cloudy at 11.3°C and 48% humidity.
    Cairo is clear sky at 30.2°C and 26% humidity. Addis Ababa is overcast
    at 16.5°C and 40% humidity.
```

The rule: always iterate over all tool_use blocks — never assume there's only one. And always ask yourself: are these calls independent? If yes, execute them in parallel. It's one `ThreadPoolExecutor` call.

---

## Demo 04 — Native Structured Output
`python 04_structured_output_upgrade.py`

### The Concept
In L2 Demo 04 we extracted PR metadata using prompt-based JSON — we asked the model nicely to return a specific format and then validated what came back. That works. But it's a request, not a guarantee.

L3 gives you the guarantee. Instead of asking the model to output JSON matching your schema, you define a tool with that schema and force the model to call it. The API enforces the structure at generation time — the model physically cannot produce output that violates the schema.

### The Code
Same task as L2 Demo 04: extract title, type, breaking flag, and files changed from PR descriptions. We run 7 PRs through both approaches side by side.

L2 approach: system prompt asks for JSON, we strip markdown fences, parse, validate manually.
L3 approach: extraction tool + `tool_choice` forced, we read `tool_calls[0].function.arguments` directly.

Both score 7/7 on these inputs — which is the honest finding, say it out loud. A capable model handles both equally on clean inputs. Then point to the real difference: look at the code. L2 needs regex stripping, json.loads, manual enum checking, manual type checking. L3 needs none of it. And the enum constraint is enforced by the API — the model can never output "bugfix" instead of "fix."

### Real Output
```
[L2 — prompt-based JSON]
  ✓ PR 1  type=fix  breaking=False  files=3
  ✓ PR 2  type=feature  breaking=False  files=7
  ✓ PR 3  type=refactor  breaking=True  files=12
  ✓ PR 4  type=hotfix  breaking=False  files=1
  ✓ PR 5  type=fix  breaking=False  files=2
  ✓ PR 6  type=fix  breaking=False  files=4
  ✓ PR 7  type=refactor  breaking=False  files=None
  7/7 valid

[L3 — extraction tool + tool_choice forced]
  ✓ PR 1  type=fix  breaking=False  files=3
  ... [same results]
  7/7 valid

  L2: 7/7  |  L3: 7/7

────────────────────────────────────────────────────────────
PASS RATE IS THE SAME — here is what actually differs:

  L2 output — what your code MIGHT receive:
    "```json\n{\"type\": \"fix\"}```"  ← markdown wrapped
    "The PR type is fix."              ← prose instead of JSON
    "{\"type\": \"bugfix\", ...}"      ← wrong enum value
  → You need: regex strip + json.loads + manual field validation

  L3 output — what your code ALWAYS receives:
    tool_calls[0].function.arguments
    = '{"title": "...", "type": "fix", "breaking": false, "files_changed": 3}'
  → Always valid JSON. Type always in enum. Required fields always present.

  WHEN L3 MATTERS MOST:
  • High-volume pipelines where one bad parse crashes the batch
  • Strict enums — model can never output 'bugfix' instead of 'fix'
  • Any time you want schema guarantees, not schema requests
```

The distinction: L2 is a request. L3 is a contract. On a good day with a capable model, both work. At 3am when one response in a batch of 10,000 comes back as markdown-wrapped JSON and crashes your pipeline — that's when the contract matters.

---

## Demo 05 — Error Handling in the Loop
`python 05_error_handling.py`

### The Concept
Tools fail. External APIs time out. Services go down. The question is: what does the loop do when that happens?

The answer is simpler than most engineers expect. You return the error string as the tool result content. That's it. The model reads it, understands something went wrong, and responds appropriately. No special error handling logic. No retry framework. The model handles the recovery.

The only rule: never swallow the error silently. If the model gets no tool_result for a tool_use_id it generated, it hallucinates — it makes up an answer as if the call succeeded. You must always close the loop, even with an error.

### The Code
One query, two runs. A `get_account_balance` tool that either succeeds (returns real data) or raises a `TimeoutError`. On success: inject the result, get the balance. On failure: catch the exception, inject the error string as content, get a graceful apology. The model is told via system prompt not to retry — in production that's the right call when you've already surfaced the error to the user.

Watch the `[tool called]` and `[tool error]` lines — that's your code executing, not the model. The model's final response in both cases is clean: no raw JSON, no stack traces, no function syntax leaking into the UI.

### Real Output
```
Query: What's the balance on account ACC-9921?

[SUCCESS — tool works normally]
  [tool called]  get_account_balance(account_id='ACC-9921')
  [tool result]  {'account_id': 'ACC-9921', 'balance': 12450.75, 'currency': 'ETB'}
  → Your current balance is 12,450.75 ETB.

[FAILURE — tool raises an exception]
  [tool called]  get_account_balance(account_id='ACC-9921')
  [tool error]   upstream banking service unavailable
  → I apologize, but the service seems to be temporarily unavailable.

The loop never crashed. The model adapted to what it was told.
Return the error string as content — the model handles recovery.
```

No crash. No hallucinated balance. Two clean outcomes from two scenarios. The model adapted because you told it what happened — the error message in the tool result is the signal. Never swallow it.

---

## Running Order

| # | File | One-line topic | ~Time |
|---|------|----------------|-------|
| 01 | `01_first_tool_call.py` | Model requests, you execute, result is context | 4 min |
| 02 | `02_tool_dispatch.py` | Descriptions route queries — no if/else needed | 3 min |
| 03 | `03_parallel_calls.py` | Execute model-requested tool calls in parallel | 4 min |
| 04 | `04_structured_output_upgrade.py` | Request vs guarantee — same rate, different risk | 5 min |
| 05 | `05_error_handling.py` | Return errors in tool_result — loop never crashes | 4 min |
| 💡 | `bonus_langchain_intro.py` | What LangChain wraps and why we go raw | 5 min |
| 🌐 | `bonus_gemini_test.py` | Same code, free Gemini API — 3-line swap | 2 min |

**Total: ~27 min for all 5 core demos · Run bonus only if time allows**

---

## Notes for Live Delivery

**Before starting:** Have all 5 demos pre-run in separate terminals so output is visible without waiting for API calls. Groq free tier: 100K tokens/day on `llama-3.3-70b-versatile`, 500K on `llama-3.1-8b-instant`. Demo 03 and 04 need the 70b model.

**If token limits hit mid-demo:** Switch to `llama-3.1-8b-instant` in the MODEL line. Quality slightly lower but tool calling works on simple demos (01, 02, 05).

**Key phrases to use:**
- Demo 01: *"The model didn't get smarter — it got grounded."*
- Demo 02: *"Your descriptions are your routing table. You wrote no branching code."*
- Demo 03: *"Always ask: are these calls independent? If yes, run them in parallel."*
- Demo 04: *"L2 is a request. L3 is a contract."*
- Demo 05: *"Never swallow the error. The model adapts if you tell it what happened."*
