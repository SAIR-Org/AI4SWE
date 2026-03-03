import { useState } from "react";

const ACCENT = "#00FF88";
const DIM = "#0A0A0F";
const SURFACE = "#0D0D16";
const BORDER = "#1A1A2A";

// ─── DATA ────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "hook",
    label: "00 — The Problem",
    time: "0:00–0:10",
    color: "#FF4444",
    icon: "⚡",
    type: "narrative",
    headline: `When someone says "add AI" — what layer are they even talking about?`,
    body: `Your PM walks in: "We need to add AI to this feature by Friday."\n\nYou nod. But what does that mean?\n\nA prompt change? A fine-tuned model? A RAG pipeline? A new model entirely?\n\nThe word "AI" collapses architecture, infrastructure, training regime, inference constraints, and product interface into a single syllable. Every miscommunication in every AI project starts here.\n\nThis lecture decompresses that word — historically and technically — so that every term you use for the rest of this course is precise, layered, and unambiguous.`,
    insight: "Ambiguity disappears when layers are explicit. The goal is to make the system visible end-to-end.",
  },
  {
    id: "history",
    label: "01 — The History",
    time: "0:10–0:30",
    color: "#F59E0B",
    icon: "📜",
    type: "phases",
    headline: "Before the transformer and after — a technical narrative, not a marketing story.",
    body: "AI did not begin with ChatGPT. To understand LLMs, you need the four structural phases that produced them.",
    phases: [
      {
        phase: "Phase 1",
        title: "Symbolic & Optimization AI",
        era: "1950s–2000s",
        color: "#6B7280",
        items: [
          "PSO, Genetic Algorithms, heuristic search, rule engines",
          "Human-defined representations. Intelligence was explicit logic.",
          "Performance depended on how well humans encoded the problem.",
          "No learning. Every behavior was written, not discovered.",
        ],
        shift: null,
      },
      {
        phase: "Phase 2",
        title: "Machine Learning",
        era: "1990s–2012",
        color: "#3B82F6",
        items: [
          "Shift: rules → parameterized functions optimized from data",
          "Core epistemological change: behavior learned, not specified",
          "Feature engineering still manual — humans chose what mattered",
          "Optimization via gradient descent variants",
        ],
        shift: "Intelligence moved from explicit rules into learned weights.",
      },
      {
        phase: "Phase 3",
        title: "Deep Learning",
        era: "2012–2017",
        color: "#8B5CF6",
        items: [
          "End-to-end representation learning — no manual feature engineering",
          "Scale became the differentiator: data × parameters × compute",
          "CNNs dominated vision. RNNs/LSTMs dominated NLP.",
          "Domains were separate. Architectures were task-specialized.",
        ],
        shift: "Programming changed form. Intelligence moved into weights learned from data.",
      },
      {
        phase: "Phase 4",
        title: "Transformers",
        era: "2017–present",
        color: "#00FF88",
        items: [
          "Attention replaced recurrence. Massive parallelization unlocked.",
          "Scaling laws became visible: performance improved predictably with scale",
          "Pretraining became the dominant paradigm. Task boundaries dissolved.",
          "NLP, vision, audio — unified under one architecture family.",
        ],
        shift: "This is the structural break. LLMs are not a new species — they are scaled continuations of the DL paradigm.",
      },
    ],
  },
  {
    id: "terminology",
    label: "02 — Terminology",
    time: "0:30–0:50",
    color: "#00FF88",
    icon: "🔤",
    type: "terms",
    headline: "Every term precisely defined. No synonyms. No collapses.",
    body: "These are the terms you will use for the rest of this course. Each one is a distinct concept at a distinct layer.",
    terms: [
      {
        term: "AI",
        wrong: "Calling ChatGPT 'the AI'",
        right: "Historical umbrella: symbolic systems, optimization algorithms, ML, DL. Everything lives inside it. It is the root, not a product.",
        analogy: "Like calling everything in tech 'the computer' — technically not wrong, practically useless.",
        layer: "Concept",
      },
      {
        term: "ML",
        wrong: "Using ML and AI interchangeably",
        right: "Parameterized models optimized from data. The paradigm shift from rule-writing to function-learning.",
        analogy: "Traditional software: you write the rules. ML: the machine learns rules from examples.",
        layer: "Paradigm",
      },
      {
        term: "Deep Learning",
        wrong: "Thinking DL is just 'better ML'",
        right: "Large neural networks trained via gradient descent. End-to-end representation learning at scale.",
        analogy: "ML needed manual features. DL learns the features too. The whole pipeline became learnable.",
        layer: "Paradigm",
      },
      {
        term: "Transformer",
        wrong: "Using it as a synonym for LLM",
        right: "An attention-based neural architecture enabling parallel sequence modeling. The architectural breakthrough of 2017.",
        analogy: "Transformer is to LLM what TCP/IP is to HTTP — the foundation, not the application.",
        layer: "Architecture",
      },
      {
        term: "Foundation Model",
        wrong: "Never heard of it, calls everything GPT",
        right: "A large pretrained model adaptable to many downstream tasks. LLMs are a subset. Vision models are a subset.",
        analogy: "Like a base Docker image — you build on top, not from scratch.",
        layer: "Model Category",
      },
      {
        term: "LLM",
        wrong: "Calling every AI system an LLM",
        right: "A large transformer-based language model trained on massive text corpora. Predicts next tokens.",
        analogy: "LLM is to Foundation Model what React is to JS framework — one important instance of the category.",
        layer: "Model Category",
      },
      {
        term: "GPT",
        wrong: "Using GPT to mean all AI",
        right: "Generative Pre-trained Transformer — a specific architecture AND OpenAI product line. Not a category name.",
        analogy: "GPT is to LLM what iPhone is to smartphone. One product, not the whole category.",
        layer: "Product / Architecture",
      },
      {
        term: "Inference",
        wrong: "Calling it 'running the model' or confusing with training",
        right: "The act of using a trained model to generate outputs. Every API call you make is inference. This is what you pay per token for.",
        analogy: "Training = compile time. Inference = runtime. You pay for runtime.",
        layer: "Operation",
      },
      {
        term: "Token",
        wrong: "Thinking tokens = words",
        right: "The atomic unit an LLM processes. ~4 chars in English. 'Unbelievable' ≈ 3 tokens. Cost, context, and limits are all measured in tokens.",
        analogy: "Like bytes vs characters. You think in words, the model processes in tokens.",
        layer: "Data Unit",
      },
      {
        term: "Context Window",
        wrong: "Thinking the model remembers everything",
        right: "Maximum tokens the model processes in one call — input + output combined. Beyond this limit, earlier content is invisible.",
        analogy: "Like RAM for the model. Fixed size. If it overflows, old content is gone.",
        layer: "Constraint",
      },
      {
        term: "Embedding",
        wrong: "Thinking it's just a number or a vector",
        right: "A dense numerical representation of text that captures semantic meaning. Similar meaning → similar vectors. The foundation of RAG.",
        analogy: "Like hashing, but for meaning instead of identity. 'Dog' and 'puppy' will be nearby in embedding space.",
        layer: "Representation",
      },
      {
        term: "Fine-tuning",
        wrong: "Thinking you need to retrain the whole model",
        right: "Continuing training of a pretrained model on smaller task-specific data to specialize its behavior.",
        analogy: "Extending a base Docker image with your dependencies. Start from what exists, adapt it.",
        layer: "Training Operation",
      },
      {
        term: "RAG",
        wrong: "Confusing it with fine-tuning",
        right: "Retrieval-Augmented Generation — fetch relevant external data at inference time and inject into the prompt. No retraining.",
        analogy: "A database query before your API handler runs. Fetch context, then pass it to the model.",
        layer: "Pattern",
      },
      {
        term: "Agent",
        wrong: "Thinking it's just a chatbot",
        right: "A system where an LLM uses tools, observes results, and decides next steps in a loop. It has autonomy over HOW to achieve a goal.",
        analogy: "The difference between a calculator and a programmer. The programmer decides what operations to run and in what order.",
        layer: "System",
      },
    ],
  },
  {
    id: "stack",
    label: "03 — The Stack",
    time: "0:50–1:10",
    color: "#3B82F6",
    icon: "🔧",
    type: "stack",
    headline: "Five layers. Every AI term lives in one of them.",
    body: "When someone says 'add AI,' ambiguity spans all five layers simultaneously. Your job is to ask: which layer?",
    layers: [
      {
        num: "L1",
        name: "Product / UI Layer",
        color: "#EC4899",
        abstraction: "Highest",
        what: "Chat interface, embedded AI feature, copilot inside an app. What the user sees.",
        how: "Prompt design, UX constraints, response formatting, latency control.",
        tools: ["ChatGPT UI", "Claude.ai", "Your product's frontend"],
        terms: ["Prompt", "System message", "Response"],
        noNeed: "No model internals required.",
      },
      {
        num: "L2",
        name: "API / Orchestration Layer",
        color: "#F59E0B",
        abstraction: "Medium-High",
        what: "Where engineers integrate intelligence. Closed-source APIs or open-source runtimes.",
        how: "Designing prompts, managing context windows, implementing retrieval, adding memory, defining agents.",
        tools: ["Anthropic API", "OpenAI API", "LangChain", "LlamaIndex", "Ollama"],
        terms: ["RAG", "Tool calling", "Context window", "Structured output", "Agent"],
        noNeed: null,
      },
      {
        num: "L3",
        name: "Model Layer",
        color: "#8B5CF6",
        abstraction: "Medium",
        what: "Transformer architecture defined in PyTorch. Pretrained weights. Tokenizer. Forward pass. Decoding.",
        how: "Modifying architecture, fine-tuning weights, changing training objective, quantizing, controlling generation.",
        tools: ["PyTorch", "Hugging Face Transformers", "LoRA / PEFT", "Model checkpoints"],
        terms: ["Fine-tuning", "Weights", "Tokenizer", "Temperature", "Beam search"],
        noNeed: null,
      },
      {
        num: "L4",
        name: "Systems Layer",
        color: "#00FF88",
        abstraction: "Low",
        what: "Below PyTorch. CUDA kernels, cuBLAS, tensor cores, memory management, kernel fusion.",
        how: "Optimizing GPU memory, reducing latency, implementing custom kernels, improving throughput.",
        tools: ["CUDA", "Triton", "DeepSpeed", "TensorRT", "vLLM", "Flash Attention"],
        terms: ["Kernel", "Tensor", "Memory bandwidth", "Latency"],
        noNeed: null,
      },
      {
        num: "L5",
        name: "Hardware Layer",
        color: "#6B7280",
        abstraction: "Physical",
        what: "GPU architecture, VRAM capacity, bandwidth, interconnect (NVLink, PCIe), multi-node networking.",
        how: "Selecting GPU type, configuring distributed topology, estimating training cost.",
        tools: ["NVIDIA A100 / H100", "NVLink", "Distributed clusters"],
        terms: ["VRAM", "Bandwidth", "Interconnect", "Compute budget"],
        noNeed: null,
      },
    ],
    mappings: [
      { action: "Just prompting", layers: ["L1", "L2"], color: "#EC4899" },
      { action: "Implementing RAG", layers: ["L2", "L3"], color: "#F59E0B" },
      { action: "Fine-tuning", layers: ["L3"], color: "#8B5CF6" },
      { action: "Optimizing inference speed", layers: ["L4"], color: "#00FF88" },
      { action: "Budgeting cluster costs", layers: ["L5"], color: "#6B7280" },
    ],
  },
  {
    id: "tree",
    label: "04 — The Tree",
    time: "1:10–1:20",
    color: "#00FF88",
    icon: "🌳",
    type: "tree",
    headline: "AI → Agent. The full taxonomy in one view.",
    body: "Every term from this lecture, placed in the tree. This is the map for the entire course.",
  },
  {
    id: "system",
    label: "05 — The System",
    time: "1:20–1:30",
    color: "#FF4444",
    icon: "🔁",
    type: "pipeline",
    headline: `An LLM product is not "a model." It is a systems pipeline.`,
    body: `When someone says "add AI," the correct response is: At which layer? With which constraints? With which abstraction boundary?`,
  },
];

const TREE_NODES = [
  { id: "ai", label: "AI", desc: "Umbrella field", color: "#6B7280", x: 50, y: 5, parent: null },
  { id: "ml", label: "ML", desc: "Learns from data", color: "#3B82F6", x: 50, y: 18, parent: "ai" },
  { id: "dl", label: "Deep Learning", desc: "Neural nets at scale", color: "#8B5CF6", x: 50, y: 31, parent: "ml" },
  { id: "transformer", label: "Transformer", desc: "Attention architecture", color: "#EC4899", x: 50, y: 44, parent: "dl" },
  { id: "fm", label: "Foundation Model", desc: "Large pretrained", color: "#F59E0B", x: 50, y: 57, parent: "transformer" },
  { id: "llm", label: "LLM", desc: "Text-based FM", color: "#00FF88", x: 25, y: 70, parent: "fm" },
  { id: "vision", label: "Vision Model", desc: "Image-based FM", color: "#F59E0B", x: 75, y: 70, parent: "fm" },
  { id: "gpt", label: "GPT-4", desc: "OpenAI LLM", color: "#10B981", x: 12, y: 83, parent: "llm" },
  { id: "claude", label: "Claude", desc: "Anthropic LLM", color: "#10B981", x: 28, y: 83, parent: "llm" },
  { id: "multimodal", label: "Multimodal", desc: "Text + Image + more", color: "#F59E0B", x: 75, y: 83, parent: "vision" },
  { id: "rag", label: "RAG", desc: "External knowledge", color: "#FF4444", x: 10, y: 95, parent: "llm" },
  { id: "finetune", label: "Fine-tuning", desc: "Specialize weights", color: "#FF4444", x: 28, y: 95, parent: "llm" },
  { id: "agent", label: "Agent", desc: "LLM + tools + loop", color: "#FF9500", x: 46, y: 95, parent: "llm" },
];

const PIPELINE = [
  { step: "User Input", layer: "L1", color: "#EC4899" },
  { step: "UI / Product", layer: "L1", color: "#EC4899" },
  { step: "Orchestration Logic", layer: "L2", color: "#F59E0B" },
  { step: "Retrieval (RAG)", layer: "L2", color: "#F59E0B" },
  { step: "Tokenization", layer: "L3", color: "#8B5CF6" },
  { step: "Transformer Forward Pass", layer: "L3", color: "#8B5CF6" },
  { step: "GPU Kernel Execution", layer: "L4", color: "#00FF88" },
  { step: "Hardware Scheduling", layer: "L5", color: "#6B7280" },
  { step: "Decoding", layer: "L3", color: "#8B5CF6" },
  { step: "Response Formatting", layer: "L2", color: "#F59E0B" },
  { step: "Output to User", layer: "L1", color: "#EC4899" },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Tag({ text, color }) {
  return (
    <span style={{
      fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px",
      padding: "2px 8px", borderRadius: "3px",
      background: color + "20", border: `1px solid ${color}40`, color,
    }}>{text}</span>
  );
}

function SectionNarrative({ s }) {
  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#FFF", marginBottom: "20px", lineHeight: 1.3 }}>
        {s.headline}
      </h2>
      <div style={{
        fontSize: "15px", lineHeight: "1.8", color: "#999", whiteSpace: "pre-line",
        borderLeft: `3px solid ${s.color}`, paddingLeft: "20px", marginBottom: "28px",
      }}>{s.body}</div>
      {s.insight && (
        <div style={{
          padding: "16px 20px", background: s.color + "10",
          border: `1px solid ${s.color}30`, borderRadius: "8px",
          fontSize: "14px", color: s.color, fontWeight: "600",
        }}>⚡ {s.insight}</div>
      )}
    </div>
  );
}

function SectionHistory({ s }) {
  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#FFF", marginBottom: "8px", lineHeight: 1.3 }}>{s.headline}</h2>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "28px" }}>{s.body}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {s.phases.map((p, i) => (
          <div key={i} style={{
            background: SURFACE, border: `1px solid ${p.color}30`,
            borderLeft: `4px solid ${p.color}`, borderRadius: "8px",
            padding: "20px 24px", position: "relative",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: p.color, letterSpacing: "2px" }}>{p.phase}</span>
              <span style={{ fontSize: "17px", fontWeight: "800", color: "#FFF" }}>{p.title}</span>
              <span style={{ fontSize: "12px", color: "#444", marginLeft: "auto" }}>{p.era}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
              {p.items.map((item, j) => (
                <li key={j} style={{ fontSize: "13px", color: "#888", paddingLeft: "16px", position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: p.color }}>›</span>
                  {item}
                </li>
              ))}
            </ul>
            {p.shift && (
              <div style={{
                marginTop: "14px", padding: "10px 14px",
                background: p.color + "10", border: `1px solid ${p.color}30`,
                borderRadius: "6px", fontSize: "13px", color: p.color, fontStyle: "italic",
              }}>
                {p.shift}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTerms({ s }) {
  const [expanded, setExpanded] = useState(null);
  const [learned, setLearned] = useState({});

  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#FFF", marginBottom: "8px" }}>{s.headline}</h2>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>{s.body}</p>
      <div style={{
        display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px",
      }}>
        {["Concept","Paradigm","Architecture","Model Category","Operation","Data Unit","Constraint","Representation","Training Operation","Pattern","System","Product / Architecture"].map(l => (
          <Tag key={l} text={l} color="#555" />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {s.terms.map((t) => (
          <div key={t.term}
            onClick={() => setExpanded(expanded === t.term ? null : t.term)}
            style={{
              background: expanded === t.term ? "#13131F" : SURFACE,
              border: `1px solid ${learned[t.term] ? ACCENT + "50" : BORDER}`,
              borderRadius: "8px", cursor: "pointer", transition: "all 0.15s",
            }}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={e => { e.stopPropagation(); setLearned(p => ({ ...p, [t.term]: !p[t.term] })); }}
                style={{
                  width: "18px", height: "18px", borderRadius: "3px", flexShrink: 0,
                  border: `2px solid ${learned[t.term] ? ACCENT : "#333"}`,
                  background: learned[t.term] ? ACCENT : "transparent", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                {learned[t.term] && <span style={{ color: "#000", fontSize: "11px", fontWeight: "900" }}>✓</span>}
              </button>
              <span style={{ fontSize: "15px", fontWeight: "700", color: learned[t.term] ? ACCENT : "#FFF", flex: 1 }}>{t.term}</span>
              <Tag text={t.layer} color="#444" />
              <span style={{ color: "#333", fontSize: "11px", marginLeft: "8px" }}>{expanded === t.term ? "▲" : "▼"}</span>
            </div>
            {expanded === t.term && (
              <div style={{ padding: "0 16px 16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ padding: "12px", background: "#180A0A", border: "1px solid #3A1A1A", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", color: "#FF4444", letterSpacing: "2px", marginBottom: "6px" }}>❌ WRONG</div>
                    <div style={{ fontSize: "13px", color: "#CC7777", lineHeight: 1.5 }}>{t.wrong}</div>
                  </div>
                  <div style={{ padding: "12px", background: "#0A180A", border: "1px solid #1A3A1A", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", marginBottom: "6px" }}>✓ RIGHT</div>
                    <div style={{ fontSize: "13px", color: "#77CC99", lineHeight: 1.5 }}>{t.right}</div>
                  </div>
                </div>
                <div style={{ padding: "10px 14px", background: "#0A0A18", border: "1px solid #2A2A4A", borderRadius: "6px", fontSize: "13px", color: "#8888BB" }}>
                  <span style={{ color: "#5555AA", fontWeight: "700" }}>⚡ Analogy: </span>{t.analogy}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionStack({ s }) {
  const [active, setActive] = useState(null);

  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#FFF", marginBottom: "8px" }}>{s.headline}</h2>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>{s.body}</p>

      {/* Stack layers */}
      <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginBottom: "28px" }}>
        {s.layers.map((layer) => (
          <div key={layer.num}
            onClick={() => setActive(active === layer.num ? null : layer.num)}
            style={{
              background: active === layer.num ? "#13131F" : SURFACE,
              border: `1px solid ${active === layer.num ? layer.color + "60" : BORDER}`,
              borderLeft: `4px solid ${layer.color}`,
              borderRadius: "6px", cursor: "pointer", transition: "all 0.15s",
            }}>
            <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{
                fontSize: "11px", fontWeight: "900", letterSpacing: "1px",
                color: layer.color, background: layer.color + "15",
                padding: "3px 8px", borderRadius: "3px", fontFamily: "monospace",
              }}>{layer.num}</span>
              <span style={{ fontSize: "15px", fontWeight: "700", color: "#FFF", flex: 1 }}>{layer.name}</span>
              <span style={{ fontSize: "11px", color: "#444" }}>{layer.abstraction} abstraction</span>
              <span style={{ color: "#333", fontSize: "11px" }}>{active === layer.num ? "▲" : "▼"}</span>
            </div>
            {active === layer.num && (
              <div style={{ padding: "0 18px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "6px" }}>WHAT</div>
                  <div style={{ fontSize: "13px", color: "#999", lineHeight: 1.6 }}>{layer.what}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "6px" }}>HOW YOU OPERATE HERE</div>
                  <div style={{ fontSize: "13px", color: "#999", lineHeight: 1.6 }}>{layer.how}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>TOOLS</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {layer.tools.map(t => <Tag key={t} text={t} color={layer.color} />)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>TERMS THAT LIVE HERE</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {layer.terms.map(t => <Tag key={t} text={t} color="#888" />)}
                  </div>
                </div>
                {layer.noNeed && (
                  <div style={{ gridColumn: "1/-1", fontSize: "12px", color: "#444", fontStyle: "italic" }}>
                    Note: {layer.noNeed}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Abstraction gradient */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "11px", color: "#444", letterSpacing: "2px", marginBottom: "10px" }}>ABSTRACTION GRADIENT</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0", overflowX: "auto" }}>
          {["Prompt", "API", "Model Object", "Tensor Ops", "CUDA Kernel", "GPU Hardware"].map((item, i, arr) => (
            <div key={item} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                padding: "8px 12px", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap",
                background: `hsl(${160 - i * 25}, 60%, ${15 + i * 3}%)`,
                border: `1px solid hsl(${160 - i * 25}, 40%, 25%)`,
                color: `hsl(${160 - i * 25}, 80%, 65%)`,
                borderRadius: i === 0 ? "6px 0 0 6px" : i === arr.length - 1 ? "0 6px 6px 0" : "0",
              }}>{item}</div>
              {i < arr.length - 1 && (
                <div style={{ fontSize: "10px", color: "#333", zIndex: 1 }}>→</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
          <span style={{ fontSize: "11px", color: "#22C55E" }}>↑ Speed of development, abstraction comfort</span>
          <span style={{ fontSize: "11px", color: "#FF4444" }}>↑ Control, complexity, responsibility</span>
        </div>
      </div>

      {/* Where am I mappings */}
      <div>
        <div style={{ fontSize: "11px", color: "#444", letterSpacing: "2px", marginBottom: "12px" }}>WHERE ARE YOU OPERATING?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {s.mappings.map(m => (
            <div key={m.action} style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "10px 16px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "6px",
            }}>
              <span style={{ fontSize: "13px", color: "#FFF", flex: 1 }}>
                {m.action === "Just prompting" ? "\"Just prompting\"" : m.action}
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                {m.layers.map(l => {
                  const layer = s.layers.find(x => x.num === l);
                  return <Tag key={l} text={l} color={layer?.color || "#888"} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionTree() {
  const [hovered, setHovered] = useState(null);

  // Build a simple vertical tree display
  const levels = [
    [TREE_NODES.find(n => n.id === "ai")],
    [TREE_NODES.find(n => n.id === "ml")],
    [TREE_NODES.find(n => n.id === "dl")],
    [TREE_NODES.find(n => n.id === "transformer")],
    [TREE_NODES.find(n => n.id === "fm")],
    [TREE_NODES.find(n => n.id === "llm"), TREE_NODES.find(n => n.id === "vision")],
    [TREE_NODES.find(n => n.id === "gpt"), TREE_NODES.find(n => n.id === "claude"), TREE_NODES.find(n => n.id === "multimodal")],
    [TREE_NODES.find(n => n.id === "rag"), TREE_NODES.find(n => n.id === "finetune"), TREE_NODES.find(n => n.id === "agent")],
  ];

  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#FFF", marginBottom: "8px" }}>AI → Agent. The full taxonomy.</h2>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>Every term from this lecture, placed in the tree. This is the map for the entire course. Screenshot this.</p>

      <div style={{
        background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px",
        padding: "32px 24px", display: "flex", flexDirection: "column", gap: "12px",
      }}>
        {levels.map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "center", gap: "12px", alignItems: "center" }}>
            {i > 0 && row.length === 1 && (
              <div style={{ position: "absolute", marginTop: "-22px", width: "1px", height: "12px", background: "#222" }} />
            )}
            {row.map(node => node && (
              <div key={node.id}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  padding: "8px 18px", borderRadius: "6px", cursor: "default",
                  background: node.color + "15", border: `1px solid ${node.color}${hovered === node.id ? "80" : "40"}`,
                  transition: "all 0.15s", transform: hovered === node.id ? "translateY(-2px)" : "none",
                  boxShadow: hovered === node.id ? `0 4px 20px ${node.color}30` : "none",
                  minWidth: "120px", textAlign: "center",
                }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: node.color }}>{node.label}</div>
                <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{node.desc}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Course map */}
      <div style={{ marginTop: "24px", padding: "20px 24px", background: "#0A1A0A", border: "1px solid #1A3A1A", borderRadius: "8px" }}>
        <div style={{ fontSize: "11px", color: ACCENT, letterSpacing: "2px", marginBottom: "12px" }}>COURSE ROADMAP</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {[
            { label: "Lecture 1", desc: "This lecture — the map", color: ACCENT },
            { label: "Lecture 2", desc: "Prompt Engineering", color: "#F59E0B" },
            { label: "Lecture 3", desc: "How LLMs work", color: "#8B5CF6" },
            { label: "Lecture 4", desc: "RAG + VDB", color: "#3B82F6" },
            { label: "Lecture 5", desc: "Fine-tuning", color: "#EC4899" },
            { label: "Lecture N", desc: "Agents", color: "#FF9500" },
          ].map(item => (
            <div key={item.label} style={{
              padding: "10px 14px", background: item.color + "10",
              border: `1px solid ${item.color}30`, borderRadius: "6px",
            }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: item.color }}>{item.label}</div>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionPipeline({ s }) {
  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#FFF", marginBottom: "8px" }}>{s.headline}</h2>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>{s.body}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginBottom: "28px" }}>
        {PIPELINE.map((step, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "14px",
            padding: "12px 18px", background: SURFACE,
            border: `1px solid ${step.color}30`, borderLeft: `3px solid ${step.color}`,
            borderRadius: "6px",
          }}>
            <span style={{ fontSize: "12px", color: "#444", fontFamily: "monospace", minWidth: "24px" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: "14px", color: "#FFF", flex: 1 }}>{step.step}</span>
            <Tag text={step.layer} color={
              step.layer === "L1" ? "#EC4899" :
              step.layer === "L2" ? "#F59E0B" :
              step.layer === "L3" ? "#8B5CF6" :
              step.layer === "L4" ? "#00FF88" : "#6B7280"
            } />
          </div>
        ))}
      </div>

      <div style={{
        padding: "20px 24px", background: "#0A0A1A",
        border: "1px solid #2A2A4A", borderRadius: "8px",
      }}>
        <div style={{ fontSize: "11px", color: "#4444AA", letterSpacing: "2px", marginBottom: "12px" }}>THE CORRECT RESPONSE TO "ADD AI"</div>
        {[
          "At which layer?",
          "With which constraints?",
          "With which abstraction boundary?",
        ].map((q, i) => (
          <div key={i} style={{
            fontSize: "16px", fontWeight: "700", color: "#FFF",
            padding: "10px 0", borderBottom: i < 2 ? "1px solid #1A1A2A" : "none",
          }}>→ {q}</div>
        ))}
        <div style={{ marginTop: "16px", fontSize: "14px", color: "#00FF88", fontStyle: "italic" }}>
          Once terminology, history, and layers are internalized — the ambiguity collapses. The system becomes concrete.
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Lecture1() {
  const [active, setActive] = useState(0);
  const s = SECTIONS[active];

  return (
    <div style={{
      minHeight: "100vh", background: DIM, color: "#E8E8F0",
      fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom: `1px solid ${BORDER}`, padding: "16px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: SURFACE, flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: "10px", color: "#333", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "3px" }}>
            AI for SWE — Crash Course
          </div>
          <div style={{ fontSize: "18px", fontWeight: "800", color: "#FFF", letterSpacing: "-0.3px" }}>
            Lecture 1: Fix Your Lingo
          </div>
        </div>
        <div style={{ fontSize: "12px", color: "#444" }}>90 min · 14 terms · 5 stack layers</div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{
          width: "240px", borderRight: `1px solid ${BORDER}`,
          background: SURFACE, flexShrink: 0, overflowY: "auto",
          padding: "12px 0",
        }}>
          {SECTIONS.map((sec, i) => (
            <button key={sec.id} onClick={() => setActive(i)} style={{
              width: "100%", textAlign: "left", padding: "14px 20px",
              background: active === i ? "#13131F" : "transparent",
              border: "none",
              borderLeft: `3px solid ${active === i ? sec.color : "transparent"}`,
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "16px" }}>{sec.icon}</span>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: active === i ? "#FFF" : "#666" }}>
                    {sec.label}
                  </div>
                  <div style={{ fontSize: "10px", color: "#333", marginTop: "2px" }}>{sec.time}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px", maxWidth: "820px" }}>
          {s.type === "narrative" && <SectionNarrative s={s} />}
          {s.type === "phases" && <SectionHistory s={s} />}
          {s.type === "terms" && <SectionTerms s={s} />}
          {s.type === "stack" && <SectionStack s={s} />}
          {s.type === "tree" && <SectionTree />}
          {s.type === "pipeline" && <SectionPipeline s={s} />}

          {/* Navigation */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: "48px", paddingTop: "20px", borderTop: `1px solid ${BORDER}`,
          }}>
            <button
              onClick={() => setActive(Math.max(0, active - 1))}
              disabled={active === 0}
              style={{
                padding: "10px 20px", background: active === 0 ? "#111" : SURFACE,
                border: `1px solid ${BORDER}`, borderRadius: "6px",
                color: active === 0 ? "#333" : "#888", cursor: active === 0 ? "not-allowed" : "pointer",
                fontSize: "12px",
              }}>← Previous</button>
            <span style={{ fontSize: "12px", color: "#333", alignSelf: "center" }}>
              {active + 1} / {SECTIONS.length}
            </span>
            <button
              onClick={() => setActive(Math.min(SECTIONS.length - 1, active + 1))}
              disabled={active === SECTIONS.length - 1}
              style={{
                padding: "10px 20px",
                background: active === SECTIONS.length - 1 ? "#111" : s.color + "20",
                border: `1px solid ${active === SECTIONS.length - 1 ? BORDER : s.color + "40"}`,
                borderRadius: "6px",
                color: active === SECTIONS.length - 1 ? "#333" : s.color,
                cursor: active === SECTIONS.length - 1 ? "not-allowed" : "pointer",
                fontSize: "12px", fontWeight: "700",
              }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
