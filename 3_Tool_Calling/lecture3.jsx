import { useState } from "react";

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:       "#060609",
  surface:  "#0D0D18",
  surface2: "#111120",
  border:   "#1C1C30",
  accent:   "#FF6B35",
  tool:     "#FF6B35",
  dispatch: "#F59E0B",
  parallel: "#3B82F6",
  struct:   "#9D71EA",
  error:    "#EF4444",
  mcp:      "#00FF88",
  react:    "#EC4899",
  text:     "#E2E2F0",
  muted:    "#666880",
  dim:      "#333348",
};

// ─── DATA: CHAPTER 01 ─────────────────────────────────────────────────────────

const GENERATIONS = [
  {
    era:      "2022 — Raw API",
    color:    "#6B7280",
    tagline:  "You parse text. You call APIs. Hope for the best.",
    what:     "The LLM generates free text. You write regex and string parsing to extract what you need, then manually call the real API. The model has no awareness of the actual call — it just produces text that describes what should happen.",
    problem:  "LLM output is non-deterministic. Parsing breaks on rephrasing. The model hallucinates API responses instead of triggering real calls. Every integration is bespoke string manipulation.",
    when:     "Never in production. Prototyping only.",
    code:     `response = llm.generate("Check balance for customer 12345")
text = response.text  # "The balance is 15,230 SAR"
# What if it says "I'll check that"? What if the format changes?
# You can't force it. You can't trust it. You parse and pray.`,
  },
  {
    era:      "2023 — Tool Calling",
    color:    C.accent,
    tagline:  "LLM decides what to call. You execute. Grounded answers.",
    what:     "You define tools as JSON schemas. The LLM decides when to call a tool and what arguments to pass. Your code executes the real function. The result goes back to the model. The model generates a final answer grounded in real data.",
    problem:  "Your toolset is custom — every schema you write is one-off. Every application that wants to use your tools needs to integrate them separately. No standard protocol.",
    when:     "Your default choice. Known fixed toolset, production reliability required.",
    code:     `# You define the schema — LLM decides when and how to call
tools = [{"name": "get_balance", "description": "...", "input_schema": {...}}]
response = client.messages.create(tools=tools, messages=[...])
# stop_reason == "tool_use" → you execute → inject result → final answer`,
  },
  {
    era:      "2024 — MCP",
    color:    C.mcp,
    tagline:  "Standard protocol. Tool servers. Any client discovers automatically.",
    what:     "Model Context Protocol standardizes how tool servers expose their capabilities and how any LLM client discovers them. One MCP server → Claude Desktop, Claude Code, your app — no custom wiring per client. The ecosystem play.",
    problem:  "Still maturing. Infrastructure overhead. Overkill for a simple fixed toolset.",
    when:     "Dynamic tool discovery needed. Multiple LLM clients sharing the same tools. Community-built tool servers.",
    code:     `# L3: custom tool definition per app
tool = {"name": "get_weather", "input_schema": {...}}

# L4 (MCP): server exposes tools, any client discovers them
from mcp.server import Server
server = Server("weather-server")
@server.tool()
def get_weather(location: str) -> str: ...`,
  },
];

const LOOP_STEPS = [
  {
    num:      "01",
    label:    "Send message + tools",
    color:    C.tool,
    desc:     "User message and tool schemas are sent together in one API call. The model sees both the query and the full list of available tools.",
    messages: `[
  {"role": "user", "content": "What's the weather in Addis Ababa?"}
]
+ tools=[{name, description, input_schema}]`,
  },
  {
    num:      "02",
    label:    "Model → tool_use block",
    color:    C.dispatch,
    desc:     'The model returns stop_reason="tool_use". The response contains a tool_use content block with the tool name and the arguments the model chose.',
    messages: `response.stop_reason == "tool_use"
response.content = [
  ToolUseBlock(
    id="toolu_01...",
    name="get_weather",
    input={"location": "Addis Ababa"}
  )
]`,
  },
  {
    num:      "03",
    label:    "Your code executes the tool",
    color:    C.parallel,
    desc:     "You extract the tool name and arguments from the response. You run the actual function. The model is waiting — it has no network access, no runtime. You are the executor.",
    messages: `# Your code — not the model
result = get_weather(location="Addis Ababa")
# → {"temp_c": 22, "condition": "sunny", "humidity": 45}`,
  },
  {
    num:      "04",
    label:    "Inject tool_result",
    color:    C.struct,
    desc:     "You append the assistant turn (with the tool_use block) and a new user turn containing the tool_result. The result is now part of the context window — the model will see it.",
    messages: `messages = [
  {"role": "user",      "content": "What's the weather..."},
  {"role": "assistant", "content": [tool_use_block]},
  {"role": "user",      "content": [
    {"type": "tool_result",
     "tool_use_id": "toolu_01...",
     "content": '{"temp_c": 22, "condition": "sunny"}'}
  ]}
]`,
  },
  {
    num:      "05",
    label:    "Model generates final answer",
    color:    C.mcp,
    desc:     "You send the updated messages back to the model. It now has the real tool result in context. It generates a final text answer grounded in actual data — not a hallucination.",
    messages: `response.stop_reason == "end_turn"
response.content[0].text ==
  "The current weather in Addis Ababa is 22°C and sunny
   with 45% humidity."`,
  },
];

// ─── DATA: CHAPTER 02 ─────────────────────────────────────────────────────────

const CONCEPTS = [
  {
    id:       "anatomy",
    name:     "Tool Definition Anatomy",
    color:    C.tool,
    icon:     "{ }",
    tagline:  "Three fields. One of them matters most.",
    mechanism: "A tool schema has three fields: name (how the model calls it), description (why and when to call it), and input_schema (what arguments it takes). The model reads all three — but the description is the decision engine. It determines when the tool is relevant, whether it's the right tool for a query, and how to phrase the arguments.",
    tradeoff:  "A well-written description eliminates wrong calls. A vague description forces the model to guess. The description field is a mini-prompt — give it the same engineering discipline as a system message.",
    watchout:  "Don't leak implementation details in the name. 'call_core_banking_v2_rest_endpoint' is a bad name. 'get_account_balance' is a good name. The model reads names as semantic signals.",
    example: {
      prompt: `{
  "name": "get_account_balance",

  "description": "Retrieve the current balance of a customer
  account. Call this when the user asks about their balance,
  available funds, or account amount. Requires account ID.",

  "input_schema": {
    "type": "object",
    "properties": {
      "account_id": {
        "type": "string",
        "description": "Customer account identifier"
      }
    },
    "required": ["account_id"]
  }
}`,
      output: `name      → how the model calls it (snake_case, semantic)
description → WHEN and WHY to call — the decision field
input_schema → WHAT arguments are required and their types`,
    },
    terms: ["JSON Schema", "input_schema", "Tool Description", "Semantic Routing"],
  },
  {
    id:       "single",
    name:     "Single Tool Call — The Loop",
    color:    C.dispatch,
    icon:     "⟳",
    tagline:  "Five steps. One cycle. The foundation of everything.",
    mechanism: "Every tool call follows the same cycle: send query + tools → model returns tool_use → you execute → inject tool_result → model returns final answer. The messages array grows with each step. You manage this state — the model is stateless between calls.",
    tradeoff:  "Simple and predictable. One tool call per turn. If the model needs multiple tools in sequence it will ask for them one at a time — unless you enable parallel calls.",
    watchout:  "Always check stop_reason before accessing content. If stop_reason is 'end_turn' the model answered directly — no tool was called. If it's 'tool_use' you must execute before sending the next request.",
    example: {
      prompt: `# Detect and handle the tool call
response = client.messages.create(
    model=MODEL, tools=TOOLS, messages=messages
)

if response.stop_reason == "tool_use":
    block = next(b for b in response.content
                 if b.type == "tool_use")
    result = execute(block.name, block.input)
    # → inject result, call again`,
      output: `stop_reason == "end_turn"  → model answered, no tool needed
stop_reason == "tool_use"  → tool requested, you must execute`,
    },
    terms: ["stop_reason", "tool_use", "tool_result", "Messages Array"],
  },
  {
    id:       "dispatch",
    name:     "Multi-Tool Dispatch",
    color:    C.dispatch,
    icon:     "⇢",
    tagline:  "The description is the dispatch logic. You write no if/else.",
    mechanism: "When multiple tools are defined, the model reads all descriptions and routes the query to the right tool(s). There is no dispatch code in your application — the model is the router. Define 3 tools: the model picks the correct one(s) based on descriptions alone. Change a description → change the routing.",
    tradeoff:  "Powerful and clean — no hand-written routing. But: overlapping descriptions create ambiguity. If two tools sound similar, the model will hesitate or pick the wrong one. Make descriptions distinct.",
    watchout:  "Test routing explicitly. Run the same query with different description wordings and check which tool is called. Routing failures are silent — the wrong tool gets called with no error.",
    example: {
      prompt: `# Three tools. One query. No dispatch code.
QUERY = "Status of order #4421 and who placed it?"

# Model reads all three descriptions:
# search_docs  → "Search product documentation..."
# get_user     → "Retrieve customer name by order ID..."
# get_order    → "Get shipping status for an order..."

# Model routes to:
# → get_user_profile(order_id="4421")
# → get_order_status(order_id="4421")
# search_docs is never called.`,
      output: `You wrote: tool schemas + descriptions
Model did: read descriptions → chose correct tools → routed correctly
You wrote: zero dispatch logic`,
    },
    terms: ["Tool Routing", "Description Engineering", "Dispatch Logic", "Semantic Matching"],
  },
  {
    id:       "parallel",
    name:     "Parallel Tool Calls",
    color:    C.parallel,
    icon:     "⫴",
    tagline:  "Model returns multiple tool_use blocks. Execute all. Return all.",
    mechanism: "When a query needs multiple pieces of data, the model can return several tool_use blocks in a single response. Execute all of them, collect all results, and return them together in one user message. The model then generates a final answer from all the results at once.",
    tradeoff:  "Reduces round-trips. If you need 3 tool results, parallel calls pay 1× the latency instead of 3×. But: the model must get all results before generating the answer — a slow tool blocks everything.",
    watchout:  "Always iterate over all tool_use blocks — never assume there is only one. A query that looks like it needs one tool might trigger two. Use: [b for b in response.content if b.type == \"tool_use\"]",
    example: {
      prompt: `# Query needs 3 cities — model returns 3 blocks at once
tool_blocks = [b for b in response.content
               if b.type == "tool_use"]
# len(tool_blocks) == 3

# Execute all, collect results
tool_results = []
for block in tool_blocks:
    result = get_weather(**block.input)
    tool_results.append({
        "type":        "tool_result",
        "tool_use_id": block.id,
        "content":     json.dumps(result),
    })

# Return ALL results in one user message
messages.append({"role": "user", "content": tool_results})`,
      output: `One API call  → 3 tool_use blocks
One execution → 3 results (run in parallel if async)
One message   → all 3 results injected together
One API call  → final answer with all 3 cities`,
    },
    terms: ["tool_use blocks", "Parallel Execution", "Batch Results", "Latency Optimization"],
  },
  {
    id:       "choice",
    name:     "Tool Choice — Forced vs Optional",
    color:    C.struct,
    icon:     "◉",
    tagline:  "Control whether and which tool the model must call.",
    mechanism: "tool_choice controls the model's calling behavior. 'auto' lets the model decide (default). 'any' forces at least one tool call. Forcing a specific tool by name is the extraction pattern — the model must fill the schema regardless of the query. Use this when you want guaranteed structured output.",
    tradeoff:  "Forced tool choice = guaranteed structured output. More reliable than prompt-based JSON from L2. But: forcing a specific tool makes the model ignore whether it's actually relevant — use only when you know the tool applies.",
    watchout:  "The extraction tool pattern works best for stateless tasks: document parsing, field extraction, classification. Do not force a tool that has side effects (sends emails, writes to DB) unless you are certain the query warrants it.",
    example: {
      prompt: `# auto — model decides (default)
tool_choice={"type": "auto"}

# any — must call at least one tool
tool_choice={"type": "any"}

# forced — must call this specific tool
tool_choice={"type": "tool", "name": "extract_pr_metadata"}

# The extraction pattern: force a schema-only tool
# → guaranteed structured output, API-level enforcement
# → more reliable than "return ONLY valid JSON" in system prompt`,
      output: `Anthropic format: {"type": "tool", "name": "..."}
OpenAI format:   {"type": "function", "function": {"name": "..."}}
                 ↑ different — don't mix them`,
    },
    terms: ["tool_choice", "Extraction Pattern", "Forced Tool", "Structured Output"],
  },
  {
    id:       "error",
    name:     "Error Handling",
    color:    C.error,
    icon:     "⚡",
    tagline:  "Return errors in tool_result. The model adapts. Never crash the loop.",
    mechanism: "Tools fail. External APIs time out. Invalid arguments get passed. When a tool raises an exception, return the error message in tool_result with is_error=True. The model reads the error as context and responds appropriately — it may retry with different arguments, ask the user for clarification, or explain the failure gracefully.",
    tradeoff:  "Graceful degradation with no extra logic on your side. The model handles the recovery. But: the model's recovery behavior is non-deterministic — for critical paths, add explicit retry logic before returning the error to the model.",
    watchout:  "Never return an empty result or silently swallow the error. If the model receives no tool_result for a tool_use_id it will hallucinate a response. Always close the loop — even with an error message.",
    example: {
      prompt: `try:
    result   = call_external_api(**block.input)
    content  = json.dumps(result)
    is_error = False
except Exception as e:
    content  = str(e)       # "upstream timeout"
    is_error = True

# Always inject — even on failure
messages.append({"role": "user", "content": [
    {
        "type":        "tool_result",
        "tool_use_id": block.id,
        "content":     content,
        "is_error":    is_error,  # ← the signal
    }
]})`,
      output: `Model sees is_error=True →
  "I wasn't able to retrieve the balance right now due to
   a temporary service issue. Please try again shortly."
No crash. No hallucination. Graceful recovery.`,
    },
    terms: ["is_error", "tool_result", "Graceful Degradation", "Error Recovery"],
  },
];

// ─── DATA: CHAPTER 03 ─────────────────────────────────────────────────────────

const DEMOS = [
  {
    num:   "01",
    title: "The First Tool Call",
    color: C.tool,
    desc:  "Before: ask about weather → confident hallucination. After: define a tool → model requests it → inject real data → grounded answer. The full loop end-to-end in one script.",
    concepts: [
      "Tool schema definition",
      "stop_reason == 'tool_use' detection",
      "tool_result injection",
      "Messages array after the loop",
      "Hallucination eliminated by grounding",
    ],
    preview: `# BEFORE — no tools, model hallucinates
call("What's the weather in Addis Ababa?")
# → "Currently 24°C with partly cloudy skies..."  ← fabricated

# AFTER — tool defined
tools = [{"name": "get_weather", "description": "...", ...}]
response = client.messages.create(tools=tools, messages=[...])

# Detect → execute → inject → final answer
if response.stop_reason == "tool_use":
    block  = next(b for b in response.content if b.type == "tool_use")
    result = get_weather(**block.input)       # your code runs here
    # inject result → call again → grounded answer`,
  },
  {
    num:   "02",
    title: "The Model as Dispatcher",
    color: C.dispatch,
    desc:  "Three tools defined. Three different queries — one routes to get_order_status, one to search_docs, one calls no tool at all. Zero dispatch code written. The model reads descriptions and routes.",
    concepts: [
      "Multi-tool definition with distinct descriptions",
      "Model routes by description — no if/else needed",
      "No-tool case handled automatically",
      "Descriptions are the routing table",
      "TOOL_MAP maps name → Python function",
    ],
    preview: `QUERIES = [
    "What's the status of order #4421?",  # → get_order_status
    "How does the return policy work?",    # → search_docs
    "What's the capital of France?",       # → no tool called
]

# One run() function handles all three
def run(query: str) -> str:
    response = client.chat.completions.create(
        model=MODEL, tools=TOOLS, messages=[system, user]
    )
    if not response.choices[0].message.tool_calls:
        return response.choices[0].message.content  # direct answer

    # dispatch to TOOL_MAP — zero branching code written by you
    for tc in response.choices[0].message.tool_calls:
        result = TOOL_MAP[tc.function.name](**json.loads(tc.function.arguments))
        ...`,
  },
  {
    num:   "03",
    title: "Parallel Tool Calls",
    color: C.parallel,
    desc:  "Query asks for weather in 3 cities. Model returns 3 tool_use blocks in one response. Execute all, return all results together, get one final answer. Never assume a single tool call.",
    concepts: [
      "Multiple tool_use blocks in one response",
      "Iterate over all blocks — never assume one",
      "Batch results in one user message",
      "Latency benefit of parallel execution",
    ],
    preview: `# Model returns 3 blocks at once
tool_blocks = [b for b in response.content if b.type == "tool_use"]
print(f"{len(tool_blocks)} tool calls")  # → 3

# Execute all, collect all results
tool_results = []
for block in tool_blocks:
    result = get_weather(**block.input)
    tool_results.append({
        "type": "tool_result",
        "tool_use_id": block.id,
        "content": json.dumps(result),
    })

# All results in one message → one final answer
messages.append({"role": "user", "content": tool_results})`,
  },
  {
    num:   "04",
    title: "Native Structured Output",
    color: C.struct,
    desc:  "Direct callback to L2 Demo 04. Same task, two approaches side by side. Prompt-based JSON vs extraction tool + forced tool_choice. Compare pass rates — the API enforces the schema in L3.",
    concepts: [
      "L2 prompt-based JSON — can deviate",
      "Extraction tool pattern — schema enforced",
      "tool_choice force for guaranteed output",
      "API-level vs prompt-level enforcement",
      "When to use each approach",
    ],
    preview: `# L2 — prompt-based (can deviate on edge inputs)
system = "Return ONLY valid JSON: {title, type, breaking, files}"
# → works 4/5, fails on adversarial phrasing

# L3 — extraction tool + forced tool_choice
tool = {"name": "extract_pr_metadata", "input_schema": {...}}
response = client.messages.create(
    tools=[tool],
    tool_choice={"type": "tool", "name": "extract_pr_metadata"},
    messages=[{"role": "user", "content": pr_text}],
)
# → model MUST call the tool with valid schema
# → 5/5 — API enforces it, not the prompt`,
  },
  {
    num:   "05",
    title: "Error Handling in the Loop",
    color: C.error,
    desc:  "Tool calls a flaky API — success and failure shown side by side. Return the error as the tool result content string. Model adapts gracefully. The loop never crashes. Never swallow errors silently.",
    concepts: [
      "Error as plain content string — loop keeps running",
      "Model reads the error and recovers gracefully",
      "Always close the loop — even on failure",
      "Silent swallow → model hallucinates",
      "System prompt controls recovery behavior",
    ],
    preview: `try:
    content = json.dumps(get_account_balance(account_id, fail=fail))
except Exception as e:
    content = f"Error: {e}"   # "Error: upstream banking service unavailable"

# Always inject — success or failure
messages = messages + [
    choice.message,
    {"role": "tool", "tool_call_id": tc.id, "content": content},
]

# Success → "Your balance is 12,450.75 ETB."
# Failure → "I apologize, but the service is temporarily unavailable."
# Loop never crashed. Model adapted.`,
  },
  {
    num:   "06",
    title: "Custom Logic as Tools",
    color: "#10B981",
    desc:  "Any Python function can be a tool. An in-memory task manager — add_task, list_tasks, mark_done, get_stats — driven entirely by the model. Real state mutation. The model never sees the TASKS dict.",
    concepts: [
      "Your own functions as tools — not just external APIs",
      "Real state mutation via tool calls",
      "Natural language → Python dispatch via TOOL_MAP",
      "Model drives your code; your code owns the data",
      "Model never accesses the data store directly",
    ],
    preview: `TASKS: dict[str, dict] = {}  # model never sees this

def add_task(title: str, priority: str = "medium") -> dict:
    task_id = str(uuid.uuid4())[:8]
    TASKS[task_id] = {"title": title, "priority": priority, "status": "pending"}
    return {"added": task_id, "title": title}

def mark_done(title: str) -> dict:
    for task in TASKS.values():
        if title.lower() in task["title"].lower() and task["status"] == "pending":
            task["status"] = "done"
            return {"marked_done": task["title"]}
    return {"error": f"no pending task matching '{title}'"}

# Model calls add_task("Fix login bug", "high")
# Model calls mark_done("Fix login bug")
# State changes. Model reads results. Answers.`,
  },
  {
    num:   "07",
    title: "The Agent Loop",
    color: C.react,
    desc:  "The while loop that turns tool calling into an agent. The model keeps calling tools until it has enough to answer — chaining calls across iterations. Reason → Act → Observe → Reason. You own the loop.",
    concepts: [
      "MAX_ITERATIONS safety cap — always required",
      "finish_reason drives termination",
      "Model chains tool calls across iterations",
      "Result of one call informs the next",
      "ReAct pattern: Reason → Act → Observe",
    ],
    preview: `MAX_ITERATIONS = 10  # always cap agent loops

def agent(query: str) -> str:
    messages = [system, user_query]
    for _ in range(MAX_ITERATIONS):
        response   = client.chat.completions.create(model=MODEL, tools=TOOLS, messages=messages)
        tool_calls = response.choices[0].message.tool_calls or []

        if not tool_calls:
            return response.choices[0].message.content  # model is done

        messages.append(response.choices[0].message)
        for tc in tool_calls:
            result = TOOL_MAP[tc.function.name](**json.loads(tc.function.arguments or "{}"))
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": json.dumps(result)})

    return "[agent stopped — hit MAX_ITERATIONS]"`,
  },
  {
    num:   "Framework",
    title: "LangChain Introduction",
    color: "#10B981",
    desc:  "LangChain wraps tool calling in a higher-level API. Uses Groq — no new setup needed. Four parts: bind_tools, AgentExecutor, provider swap (one line → Anthropic), and a side-by-side comparison of what each approach hides.",
    concepts: [
      "@tool decorator — docstring + type hints become the schema",
      "bind_tools() — replaces manual tool definition",
      "AgentExecutor — loop fully hidden inside the framework",
      "Provider swap: ChatGroq → ChatAnthropic, zero other changes",
      "Raw SDK advantage: every step visible and debuggable",
    ],
    preview: `# Groq — free, key already in .env from L1/L2
GROQ_MODEL      = ChatGroq(model="llama-3.3-70b-versatile")
ANTHROPIC_MODEL = ChatAnthropic(model="claude-haiku-4-5-20251001")

@tool
def get_weather(location: str) -> str:
    """Get current weather. Call when user asks about weather."""
    return MOCK_WEATHER.get(location, "unknown")

# Same code — two providers, one line changed
run_agent_executor(GROQ_MODEL)       # Groq
run_agent_executor(ANTHROPIC_MODEL)  # Anthropic — identical result

# What LangChain hides vs raw SDK:
# @tool            ← manual JSON schema in raw SDK
# AgentExecutor    ← while stop_reason == "tool_use": loop
# ChatGroq/Claude  ← provider-specific client + response format
# LangChain earns its keep when you need provider flexibility.`,
  },
];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Tag({ text, color = "#555" }) {
  return (
    <span style={{
      fontSize: "10px", fontWeight: "700", letterSpacing: "1.2px",
      padding: "2px 7px", borderRadius: "3px",
      background: color + "18", border: `1px solid ${color}35`, color,
    }}>{text}</span>
  );
}

// ─── CHAPTER 01 — THE FRAME ───────────────────────────────────────────────────

function FrameChapter() {
  const [activeGen, setActiveGen]  = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div>
      <div style={{ marginBottom: "40px" }}>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "3px", marginBottom: "12px" }}>CHAPTER 01 — THE FRAME</div>
        <h2 style={{ fontSize: "26px", fontWeight: "900", color: "#FFF", marginBottom: "16px", lineHeight: 1.2 }}>
          In L2 the model answered questions.<br />
          In L3 it takes actions.
        </h2>
        <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.8, maxWidth: "600px" }}>
          Text in → text out is over. Tool calling makes it text in → action → result → text out.
          The model stops being a calculator and starts being an operator.
        </p>
      </div>

      {/* Core mental model */}
      <div style={{ marginBottom: "36px", padding: "24px", background: C.surface, border: `1px solid ${C.accent}30`, borderLeft: `4px solid ${C.accent}`, borderRadius: "8px" }}>
        <div style={{ fontSize: "10px", color: C.accent, letterSpacing: "2px", marginBottom: "12px" }}>THE CORE MENTAL MODEL</div>
        <div style={{ fontSize: "20px", color: "#FFF", fontWeight: "900", fontFamily: "monospace", marginBottom: "14px" }}>
          The model doesn't execute tools. It requests them.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {[
            { label: "Requested, not run", color: C.tool,     desc: "The model outputs a structured request. Your code runs the actual function. Intentional — the model has no runtime, no network, no side effects." },
            { label: "Result is context",  color: C.parallel, desc: "The tool result goes back into the messages array. The model sees it as context and generates the final answer from real data, not from weights." },
            { label: "You own the loop",   color: C.struct,   desc: "Same as stateless memory in L2 — you are the orchestrator. The model is stateless. The loop exists because you build it and manage the messages." },
          ].map(item => (
            <div key={item.label} style={{ padding: "14px", background: "#070710", border: `1px solid ${item.color}20`, borderTop: `2px solid ${item.color}`, borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: item.color, letterSpacing: "1px", marginBottom: "8px" }}>{item.label.toUpperCase()}</div>
              <div style={{ fontSize: "12px", color: C.muted, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Generations */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "2px", marginBottom: "14px" }}>THREE GENERATIONS — CLICK TO EXPAND</div>
        {GENERATIONS.map((g) => (
          <div
            key={g.era}
            onClick={() => setActiveGen(activeGen === g.era ? null : g.era)}
            style={{
              marginBottom: "5px", background: activeGen === g.era ? C.surface2 : C.surface,
              border: `1px solid ${activeGen === g.era ? g.color + "50" : C.border}`,
              borderLeft: `4px solid ${g.color}`,
              borderRadius: "8px", cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: g.color, marginBottom: "3px" }}>{g.era}</div>
                <div style={{ fontSize: "12px", color: C.muted, fontStyle: "italic" }}>{g.tagline}</div>
              </div>
              <span style={{ color: C.dim, fontSize: "11px" }}>{activeGen === g.era ? "▲" : "▼"}</span>
            </div>
            {activeGen === g.era && (
              <div style={{ padding: "0 18px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ padding: "12px", background: "#070710", border: `1px solid ${C.border}`, borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", color: g.color, letterSpacing: "2px", marginBottom: "6px" }}>WHAT IT IS</div>
                    <div style={{ fontSize: "12px", color: "#999", lineHeight: 1.7 }}>{g.what}</div>
                  </div>
                  <div style={{ padding: "12px", background: "#070710", border: `1px solid ${C.border}`, borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", color: C.error, letterSpacing: "2px", marginBottom: "6px" }}>THE PROBLEM</div>
                    <div style={{ fontSize: "12px", color: "#999", lineHeight: 1.7 }}>{g.problem}</div>
                    <div style={{ fontSize: "10px", color: g.color, letterSpacing: "1px", marginTop: "10px" }}>WHEN TO USE → {g.when}</div>
                  </div>
                </div>
                <pre style={{ fontSize: "11px", color: "#9DB3CC", background: "#070710", border: `1px solid ${C.border}`, borderRadius: "5px", padding: "12px", margin: 0, overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{g.code}</pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* The Loop — interactive stepper */}
      <div>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "2px", marginBottom: "14px" }}>THE TOOL CALLING LOOP — CLICK EACH STEP</div>
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {LOOP_STEPS.map((step, i) => (
            <button
              key={step.num}
              onClick={() => setActiveStep(i)}
              style={{
                padding: "6px 14px", borderRadius: "5px", cursor: "pointer",
                fontSize: "11px", fontWeight: "700",
                background: activeStep === i ? step.color + "20" : "transparent",
                border: `1px solid ${activeStep === i ? step.color + "60" : C.border}`,
                color: activeStep === i ? step.color : C.muted,
              }}
            >
              {step.num} — {step.label}
            </button>
          ))}
        </div>
        {(() => {
          const s = LOOP_STEPS[activeStep];
          return (
            <div style={{ background: C.surface, border: `1px solid ${s.color}30`, borderTop: `3px solid ${s.color}`, borderRadius: "8px", padding: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: s.color, marginBottom: "8px" }}>Step {s.num}: {s.label}</div>
              <p style={{ fontSize: "13px", color: "#AAA", lineHeight: 1.7, marginBottom: "16px" }}>{s.desc}</p>
              <pre style={{ fontSize: "11px", color: "#9DB3CC", background: "#070710", border: `1px solid ${C.border}`, borderRadius: "5px", padding: "12px", margin: 0, overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{s.messages}</pre>
            </div>
          );
        })()}

        {/* L2 bridge */}
        <div style={{ marginTop: "16px", padding: "14px 18px", background: C.surface, border: `1px solid ${C.struct}25`, borderLeft: `3px solid ${C.struct}`, borderRadius: "6px" }}>
          <span style={{ fontSize: "11px", color: C.struct, fontWeight: "700" }}>↑ L2 CONNECTION: </span>
          <span style={{ fontSize: "12px", color: C.muted }}>
            L2 Demo 04 got structured output by prompting for JSON — the model could deviate on edge inputs.
            Tool calling IS structured output, but enforced at the API level — the schema is the contract.
            Same family. Different mechanism. Upgrade, not replacement.
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── CHAPTER 02 — THE CRAFT ───────────────────────────────────────────────────

function CraftChapter() {
  const [active, setActive] = useState(null);

  return (
    <div>
      <div style={{ marginBottom: "40px" }}>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "3px", marginBottom: "12px" }}>CHAPTER 02 — THE CRAFT</div>
        <h2 style={{ fontSize: "26px", fontWeight: "900", color: "#FFF", marginBottom: "16px", lineHeight: 1.2 }}>
          Six concepts.<br />
          From anatomy to production patterns.
        </h2>
        <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.8, maxWidth: "600px" }}>
          Each concept has a mechanism, a tradeoff, and a watchout.
          Understanding the mechanism lets you diagnose failures instead of guessing.
        </p>
      </div>

      {/* Concepts */}
      <div style={{ marginBottom: "44px" }}>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "2px", marginBottom: "14px" }}>SIX CONCEPTS — CLICK TO EXPAND</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {CONCEPTS.map((c) => (
            <div
              key={c.id}
              onClick={() => setActive(active === c.id ? null : c.id)}
              style={{
                background: active === c.id ? C.surface2 : C.surface,
                border: `1px solid ${active === c.id ? c.color + "50" : C.border}`,
                borderLeft: `4px solid ${c.color}`,
                borderRadius: "8px", cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <div style={{ padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "6px", flexShrink: 0,
                  background: c.color + "15", border: `1px solid ${c.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: "900", color: c.color, fontFamily: "monospace",
                }}>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#FFF", marginBottom: "3px" }}>{c.name}</div>
                  <div style={{ fontSize: "12px", color: C.muted, fontStyle: "italic" }}>{c.tagline}</div>
                </div>
                <span style={{ color: C.dim, fontSize: "11px", marginTop: "2px" }}>{active === c.id ? "▲" : "▼"}</span>
              </div>

              {active === c.id && (
                <div style={{ padding: "0 18px 20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div style={{ padding: "12px 14px", background: "#070710", border: `1px solid ${C.border}`, borderRadius: "6px" }}>
                      <div style={{ fontSize: "10px", color: c.color, letterSpacing: "2px", marginBottom: "8px" }}>MECHANISM — WHY IT WORKS</div>
                      <div style={{ fontSize: "12px", color: "#999", lineHeight: 1.7 }}>{c.mechanism}</div>
                    </div>
                    <div style={{ padding: "12px 14px", background: "#070710", border: `1px solid ${C.border}`, borderRadius: "6px" }}>
                      <div style={{ fontSize: "10px", color: C.dispatch, letterSpacing: "2px", marginBottom: "8px" }}>TRADEOFF</div>
                      <div style={{ fontSize: "12px", color: "#999", lineHeight: 1.7 }}>{c.tradeoff}</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "9px", color: C.muted, marginBottom: "4px", letterSpacing: "1px" }}>CODE</div>
                      <pre style={{ fontSize: "11px", color: "#9DB3CC", background: "#070710", border: `1px solid ${C.border}`, borderRadius: "4px", padding: "10px", margin: 0, overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{c.example.prompt}</pre>
                    </div>
                    <div>
                      <div style={{ fontSize: "9px", color: "#77AA77", marginBottom: "4px", letterSpacing: "1px" }}>RESULT</div>
                      <pre style={{ fontSize: "11px", color: "#88CC88", background: "#070E07", border: `1px solid #1A301A`, borderRadius: "4px", padding: "10px", margin: 0, overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{c.example.output}</pre>
                    </div>
                  </div>

                  <div style={{ padding: "10px 14px", background: "#120A0A", border: "1px solid #301515", borderRadius: "6px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "11px", color: "#FF6B35", fontWeight: "700" }}>⚠ WATCH OUT: </span>
                    <span style={{ fontSize: "12px", color: "#888" }}>{c.watchout}</span>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {c.terms.map(t => <Tag key={t} text={t} color={c.color} />)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ReAct Preview */}
      <div style={{ padding: "24px", background: C.surface, border: `1px solid ${C.react}25`, borderRadius: "10px" }}>
        <div style={{ fontSize: "11px", color: C.react, letterSpacing: "2px", marginBottom: "14px" }}>PREVIEW — THE REACT LOOP (LECTURE 4)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div style={{ padding: "16px", background: "#070710", border: `1px solid ${C.accent}25`, borderTop: `2px solid ${C.accent}`, borderRadius: "6px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: C.accent, letterSpacing: "1px", marginBottom: "10px" }}>WHAT L3 TEACHES — SINGLE TURN</div>
            <pre style={{ fontSize: "11px", color: "#9DB3CC", margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{`User
  → Model → tool_use
  → result
  → Model → final answer

One cycle. Deterministic.
You control every step.`}</pre>
          </div>
          <div style={{ padding: "16px", background: "#070710", border: `1px solid ${C.react}25`, borderTop: `2px solid ${C.react}`, borderRadius: "6px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: C.react, letterSpacing: "1px", marginBottom: "10px" }}>WHAT L4 WILL BUILD — REACT LOOP</div>
            <pre style={{ fontSize: "11px", color: "#9DB3CC", margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{`while response.stop_reason == "tool_use":
    result = execute_tool(response)
    messages.append(result)
    response = client.messages.create(
        tools=tools, messages=messages
    )
# model decides when it has enough to answer`}</pre>
          </div>
        </div>
        <div style={{ padding: "12px 16px", background: C.react + "08", border: `1px solid ${C.react}20`, borderRadius: "6px" }}>
          <span style={{ fontSize: "12px", color: C.react, fontWeight: "700" }}>→ </span>
          <span style={{ fontSize: "13px", color: "#AAA" }}>
            When the model decides what to call next based on what it just got back — that is an agent.
            That while loop is the ReAct pattern. That is Lecture 4.
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── CHAPTER 03 — CODE LAB ────────────────────────────────────────────────────

function CodeChapter() {
  const [activeDemo, setActiveDemo] = useState(0);
  const d = DEMOS[activeDemo];

  return (
    <div>
      <div style={{ marginBottom: "36px" }}>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "3px", marginBottom: "12px" }}>CHAPTER 03 — CODE LAB</div>
        <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#FFF", marginBottom: "12px", lineHeight: 1.2 }}>
          Seven demos. Each one proves a concept.
        </h2>
        <p style={{ fontSize: "14px", color: C.muted, lineHeight: 1.7, maxWidth: "580px" }}>
          Every demo is a before/after. The diff teaches. Run alongside the lecture — not after.
        </p>
      </div>

      {/* Setup */}
      <div style={{ marginBottom: "28px", padding: "20px 24px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px" }}>
        <div style={{ fontSize: "11px", color: C.accent, letterSpacing: "2px", marginBottom: "12px" }}>SETUP — SAME STACK AS L1 / L2</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
          {[
            { step: "1", text: "GROQ_API_KEY already in .env — no new setup needed" },
            { step: "2", text: "uv add groq python-dotenv  (already installed from L1/L2)" },
            { step: "3", text: "uv add langchain-groq langchain-anthropic langchain-core langchain  (framework bonus only)" },
            { step: "4", text: "python 01_first_tool_call.py" },
          ].map(s => (
            <div key={s.step} style={{ display: "flex", gap: "10px", padding: "10px 12px", background: "#0A0A12", border: `1px solid ${C.border}`, borderRadius: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: "900", color: C.accent, fontFamily: "monospace", minWidth: "16px" }}>{s.step}</span>
              <span style={{ fontSize: "12px", color: "#AAA", lineHeight: 1.5 }}>{s.text}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 14px", background: "#0A120A", border: "1px solid #1A301A", borderRadius: "6px", fontFamily: "monospace", fontSize: "12px", color: "#77BB77" }}>
          $ python 01_first_tool_call.py  # GROQ_API_KEY — already set up
        </div>
      </div>

      {/* Demo selector */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
        {DEMOS.map((demo, i) => (
          <button
            key={demo.num}
            onClick={() => setActiveDemo(i)}
            style={{
              padding: "8px 14px", borderRadius: "6px", cursor: "pointer",
              fontSize: "12px", fontWeight: "700",
              background: activeDemo === i ? demo.color + "20" : "transparent",
              border: `1px solid ${activeDemo === i ? demo.color + "60" : C.border}`,
              color: activeDemo === i ? demo.color : C.muted,
            }}
          >{demo.num} — {demo.title}</button>
        ))}
      </div>

      {/* Active demo */}
      <div style={{ background: C.surface, border: `1px solid ${d.color}30`, borderTop: `3px solid ${d.color}`, borderRadius: "8px", padding: "24px", marginBottom: "28px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#FFF", marginBottom: "8px" }}>Demo {d.num}: {d.title}</h3>
        <p style={{ fontSize: "14px", color: C.muted, marginBottom: "20px", lineHeight: 1.6 }}>{d.desc}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "2px", marginBottom: "10px" }}>CONCEPTS DEMONSTRATED</div>
            {d.concepts.map(c => (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "#CCC" }}>{c}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "2px", marginBottom: "10px" }}>CODE PREVIEW</div>
            <pre style={{
              fontSize: "11px", lineHeight: "1.7", color: "#9DB3CC",
              background: "#070710", border: `1px solid ${C.border}`,
              borderRadius: "6px", padding: "14px", overflowX: "auto",
              margin: 0, fontFamily: "'Fira Code', 'Courier New', monospace",
              whiteSpace: "pre-wrap",
            }}>{d.preview}</pre>
          </div>
        </div>
      </div>

      {/* MCP Tease */}
      <div style={{ padding: "24px", background: "#070710", border: `1px solid ${C.mcp}20`, borderRadius: "10px" }}>
        <div style={{ fontSize: "11px", color: C.mcp, letterSpacing: "2px", marginBottom: "16px" }}>PREVIEW — MCP (LECTURE 4)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div style={{ padding: "16px", background: C.surface, border: `1px solid ${C.accent}20`, borderTop: `2px solid ${C.accent}`, borderRadius: "6px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: C.accent, letterSpacing: "1px", marginBottom: "10px" }}>WHAT YOU BUILT IN L3</div>
            <pre style={{ fontSize: "11px", color: "#9DB3CC", margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{`tool = {
  "name": "get_weather",
  "description": "...",
  "input_schema": {...}
}
# Custom schema. Your app only.
# Another app? Build it again.`}</pre>
          </div>
          <div style={{ padding: "16px", background: C.surface, border: `1px solid ${C.mcp}20`, borderTop: `2px solid ${C.mcp}`, borderRadius: "6px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: C.mcp, letterSpacing: "1px", marginBottom: "10px" }}>WHAT L4 BUILDS (MCP)</div>
            <pre style={{ fontSize: "11px", color: "#9DB3CC", margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{`from mcp.server import Server
server = Server("weather-server")

@server.tool()
def get_weather(location: str) -> str:
    ...
# Standard protocol.
# Claude Desktop, Claude Code, your app
# → same server, zero rewiring.`}</pre>
          </div>
        </div>
        <div style={{ padding: "12px 16px", background: C.mcp + "08", border: `1px solid ${C.mcp}20`, borderRadius: "6px" }}>
          <span style={{ fontSize: "12px", color: C.mcp, fontWeight: "700" }}>→ </span>
          <span style={{ fontSize: "13px", color: "#AAA" }}>
            5 tools, 5 custom schemas, 5 custom dispatch functions — for one app.
            MCP is the protocol that standardizes all of this. One server exposes tools. Any MCP client discovers them.
            Lecture 4 builds it from scratch.
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "frame", label: "01 — The Frame", sub: "3 generations, mental model, loop", icon: "⚙", color: C.accent },
  { id: "craft", label: "02 — The Craft", sub: "6 concepts + ReAct preview",        icon: "🔧", color: C.dispatch },
  { id: "code",  label: "03 — Code Lab",  sub: "7 demos + LangChain bonus",           icon: "⌨", color: C.parallel },
];

export default function Lecture3() {
  const [tab, setTab] = useState("frame");

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom: `1px solid ${C.border}`, padding: "14px 28px",
        background: C.surface, display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: "9px", color: C.dim, letterSpacing: "3px", marginBottom: "4px" }}>AI FOR SOFTWARE ENGINEERS — CRASH COURSE</div>
          <div style={{ fontSize: "17px", fontWeight: "900", color: "#FFF", letterSpacing: "-0.3px" }}>Lecture 3: Tool Calling — Giving the Model Hands</div>
        </div>
        <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: C.dim }}>
          <span>90 min</span>
          <span>·</span>
          <span>6 concepts</span>
          <span>·</span>
          <span>7 demos + 1 extra</span>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.surface, display: "flex", flexShrink: 0 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "14px 24px", background: "transparent", border: "none",
              borderBottom: `3px solid ${tab === t.id ? t.color : "transparent"}`,
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "15px" }}>{t.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "12px", fontWeight: "800", color: tab === t.id ? "#FFF" : C.muted }}>{t.label}</div>
                <div style={{ fontSize: "10px", color: C.dim, marginTop: "1px" }}>{t.sub}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px", maxWidth: "900px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {tab === "frame" && <FrameChapter />}
        {tab === "craft" && <CraftChapter />}
        {tab === "code"  && <CodeChapter />}
      </div>
    </div>
  );
}
