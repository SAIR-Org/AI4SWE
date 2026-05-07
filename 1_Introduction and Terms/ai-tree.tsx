import { useState } from "react";

const NODES = {
  ai: {
    id: "ai", label: "AI", sub: "Artificial Intelligence", color: "#6B7280",
    desc: "The broad field of making machines exhibit intelligent behavior. Umbrella term — everything lives inside it.",
    algos: ["Search algorithms", "Heuristics", "Expert systems", "Symbolic reasoning", "PSO", "Genetic algorithms"],
    children: ["ml", "nn"],
    x: 50, y: 4,
  },
  ml: {
    id: "ml", label: "ML", sub: "Machine Learning", color: "#3B82F6",
    desc: "Systems that learn from data instead of explicit rules. The paradigm shift: behavior learned, not written.",
    algos: ["Linear Regression", "SVM", "Decision Trees", "Random Forest", "K-Means", "Naive Bayes", "Gradient Boosting"],
    children: [],
    x: 25, y: 14,
  },
  nn: {
    id: "nn", label: "NN / DL", sub: "Neural Networks & Deep Learning", color: "#8B5CF6",
    desc: "Layered networks of nodes trained via gradient descent. End-to-end representation learning — features are learned, not hand-crafted.",
    algos: ["Backpropagation", "Dropout", "Batch Norm", "ReLU", "Adam optimizer"],
    children: ["cv", "nlp"],
    x: 72, y: 14,
  },
  cv: {
    id: "cv", label: "CV + CNN", sub: "Computer Vision", color: "#EC4899",
    desc: "DL applied to images. CNNs learn spatial hierarchies of features — edges → shapes → objects. Dominated vision before Vision Transformers.",
    algos: ["LeNet", "AlexNet", "VGG", "ResNet", "YOLO", "U-Net", "GAN"],
    children: ["vit"],
    x: 55, y: 26,
  },
  nlp: {
    id: "nlp", label: "NLP + RNN/LSTM", sub: "Natural Language Processing", color: "#F59E0B",
    desc: "DL applied to sequences. RNNs process tokens one by one. LSTMs add gating to handle long-range dependencies. Sequential — slow to train.",
    algos: ["RNN", "LSTM", "GRU", "Seq2Seq", "Attention (early)", "Word2Vec", "GloVe"],
    children: ["transformer"],
    x: 82, y: 26,
  },
  transformer: {
    id: "transformer", label: "Transformer", sub: "2017 — Attention Is All You Need", color: "#00FF88",
    desc: "Replaced recurrence with self-attention. Fully parallel. Scaling laws emerged. Originally for Neural Machine Translation (NMT) — then took over everything.",
    algos: ["Self-Attention", "Multi-Head Attention", "Positional Encoding", "Encoder-Decoder", "Layer Norm"],
    children: ["gpt", "bert", "vit", "diffusion"],
    x: 72, y: 38,
  },
  gpt: {
    id: "gpt", label: "GPT Branch", sub: "Decoder-only · Generative", color: "#FF9500",
    desc: "Decoder-only transformers trained to predict next tokens. Scales into LLMs. GPT-1→2→3→4, Claude, Llama, Mistral all live here.",
    algos: ["GPT-1/2/3/4", "Claude", "Llama", "Mistral", "Gemini", "RLHF", "InstructGPT"],
    children: ["llm"],
    x: 55, y: 50,
  },
  bert: {
    id: "bert", label: "BERT Branch", sub: "Encoder-only · Understanding", color: "#06B6D4",
    desc: "Encoder-only transformers trained with masked language modeling. Excellent at understanding and classification. Not generative.",
    algos: ["BERT", "RoBERTa", "DistilBERT", "ALBERT", "DeBERTa", "Sentence-BERT"],
    children: ["embeddings"],
    x: 82, y: 50,
  },
  vit: {
    id: "vit", label: "Vision Transformer", sub: "Transformer → CV", color: "#EC4899",
    desc: "Transformers applied to images by splitting them into patches. Replaced CNNs as the dominant vision architecture at scale.",
    algos: ["ViT", "CLIP", "DINO", "SAM", "Florence", "SigLIP"],
    children: [],
    x: 35, y: 50,
  },
  diffusion: {
    id: "diffusion", label: "Diffusion Models", sub: "Generative · Image & Video", color: "#A78BFA",
    desc: "Learn to reverse a noisy process to generate images. Stable Diffusion, DALL-E 3, Midjourney, Sora all built on this paradigm.",
    algos: ["DDPM", "Stable Diffusion", "DALL-E 3", "Midjourney", "Sora", "ControlNet"],
    children: [],
    x: 18, y: 50,
  },
  llm: {
    id: "llm", label: "LLM", sub: "Large Language Models", color: "#00FF88",
    desc: "Foundation models trained on massive text corpora. Predicts next tokens. Base for all modern AI products.",
    algos: ["GPT-4", "Claude 3", "Llama 3", "Gemini", "Mistral", "Qwen"],
    children: ["embeddings", "rag", "agents"],
    x: 55, y: 62,
  },
  embeddings: {
    id: "embeddings", label: "Embeddings", sub: "Semantic Representations", color: "#06B6D4",
    desc: "Dense vectors that encode meaning. Similar concepts → nearby vectors. The bridge between language and retrieval.",
    algos: ["text-embedding-3", "all-MiniLM", "BGE", "Cohere Embed", "Cosine similarity"],
    children: ["rag"],
    x: 75, y: 62,
  },
  rag: {
    id: "rag", label: "RAG", sub: "Retrieval-Augmented Generation", color: "#FF4444",
    desc: "Systems design pattern: retrieve relevant context at inference time, inject into prompt. No retraining needed. Connects LLMs to external knowledge.",
    algos: ["Vector DB (Pinecone, pgvector)", "Chunking", "Semantic search", "Reranking", "HyDE"],
    children: [],
    x: 62, y: 76,
  },
  agents: {
    id: "agents", label: "Agents", sub: "Autonomous AI Systems", color: "#FF9500",
    desc: "LLM + tools + memory + decision loop. The model decides what to do, not just what to say. The destination of the modern AI stack.",
    algos: ["ReAct", "Tool use", "Function calling", "LangChain", "LlamaIndex", "AutoGPT", "Multi-agent"],
    children: [],
    x: 42, y: 76,
  },
};

const EDGES = [
  ["ai", "ml"], ["ai", "nn"],
  ["nn", "cv"], ["nn", "nlp"],
  ["nlp", "transformer"],
  ["cv", "vit"],
  ["transformer", "gpt"], ["transformer", "bert"], ["transformer", "vit"], ["transformer", "diffusion"],
  ["gpt", "llm"],
  ["bert", "embeddings"],
  ["llm", "rag"], ["llm", "agents"], ["llm", "embeddings"],
  ["embeddings", "rag"],
];

const W = 900, H = 820;
const px = x => (x / 100) * W;
const py = y => (y / 100) * H;

export default function AITree() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const node = selected ? NODES[selected] : null;

  return (
    <div style={{
      minHeight: "100vh", background: "#080810", color: "#E0E0F0",
      fontFamily: "'Fira Code', 'DM Mono', monospace",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 24px", borderBottom: "1px solid #1A1A2A",
        background: "#0D0D16", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: "10px", color: "#333", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "3px" }}>AI4SWE · Lecture 1</div>
          <div style={{ fontSize: "17px", fontWeight: "800", color: "#FFF" }}>The AI Evolution Tree</div>
        </div>
        <div style={{ fontSize: "11px", color: "#444" }}>Click any node to explore</div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* SVG Tree */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
          <svg width={W} height={H} style={{ display: "block" }}>
            <defs>
              {Object.values(NODES).map(n => (
                <filter key={n.id} id={`glow-${n.id}`}>
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              ))}
            </defs>

            {/* Edges */}
            {EDGES.map(([a, b], i) => {
              const na = NODES[a], nb = NODES[b];
              const isActive = selected === a || selected === b || hovered === a || hovered === b;
              return (
                <line key={i}
                  x1={px(na.x)} y1={py(na.y) + 18}
                  x2={px(nb.x)} y2={py(nb.y) - 18}
                  stroke={isActive ? NODES[a].color : "#1E1E2E"}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray={isActive ? "none" : "4 4"}
                  opacity={isActive ? 0.8 : 0.4}
                  style={{ transition: "all 0.2s" }}
                />
              );
            })}

            {/* Nodes */}
            {Object.values(NODES).map(n => {
              const cx = px(n.x), cy = py(n.y);
              const isSelected = selected === n.id;
              const isHovered = hovered === n.id;
              const isActive = isSelected || isHovered;

              return (
                <g key={n.id}
                  onClick={() => setSelected(selected === n.id ? null : n.id)}
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                  filter={isActive ? `url(#glow-${n.id})` : "none"}
                >
                  {/* Outer ring when active */}
                  {isActive && (
                    <circle cx={cx} cy={cy} r={28}
                      fill="none" stroke={n.color} strokeWidth={1.5} opacity={0.4}/>
                  )}
                  {/* Main circle */}
                  <circle cx={cx} cy={cy} r={22}
                    fill={isSelected ? n.color : "#0D0D16"}
                    stroke={n.color}
                    strokeWidth={isActive ? 2 : 1.5}
                    opacity={1}
                    style={{ transition: "all 0.2s" }}
                  />
                  {/* Label */}
                  <text x={cx} y={cy - 3} textAnchor="middle"
                    fontSize={n.label.length > 6 ? "8" : "10"} fontWeight="800"
                    fill={isSelected ? "#000" : n.color}
                    style={{ transition: "all 0.2s", userSelect: "none" }}
                  >{n.label}</text>
                  {/* Sub label below circle */}
                  <text x={cx} y={cy + 34} textAnchor="middle"
                    fontSize="8.5" fill={isActive ? n.color : "#333"}
                    style={{ transition: "all 0.2s", userSelect: "none" }}
                  >{n.sub.split(" ").slice(0, 2).join(" ")}</text>
                </g>
              );
            })}

            {/* Era labels */}
            {[
              { label: "RULE-BASED ERA", y: 4, color: "#333" },
              { label: "LEARNING FROM DATA", y: 14, color: "#333" },
              { label: "DEEP LEARNING", y: 26, color: "#333" },
              { label: "TRANSFORMER REVOLUTION (2017)", y: 38, color: "#00FF8840" },
              { label: "SPECIALIZATION", y: 50, color: "#333" },
              { label: "FOUNDATION MODELS", y: 62, color: "#333" },
              { label: "SYSTEMS DESIGN", y: 76, color: "#FF450040" },
            ].map((era, i) => (
              <text key={i} x={8} y={py(era.y) + 4}
                fontSize="8" fill={era.color} letterSpacing="2"
                style={{ userSelect: "none" }}
              >{era.label}</text>
            ))}
          </svg>
        </div>

        {/* Detail Panel */}
        <div style={{
          width: "300px", borderLeft: "1px solid #1A1A2A",
          background: "#0D0D16", overflowY: "auto", flexShrink: 0,
          transition: "all 0.2s",
        }}>
          {!node ? (
            <div style={{ padding: "32px 20px", color: "#333", fontSize: "13px", lineHeight: 1.8 }}>
              <div style={{ fontSize: "11px", color: "#222", letterSpacing: "2px", marginBottom: "20px" }}>HOW TO READ THIS</div>
              <div style={{ marginBottom: "12px" }}>→ Each node is a milestone in AI history</div>
              <div style={{ marginBottom: "12px" }}>→ Edges show what led to what</div>
              <div style={{ marginBottom: "12px" }}>→ Click any node to see its story, key algorithms, and why it matters</div>
              <div style={{ marginTop: "32px", fontSize: "11px", color: "#222", letterSpacing: "2px", marginBottom: "16px" }}>ERA GUIDE</div>
              {[
                { label: "Rule-based", color: "#6B7280", desc: "Humans wrote every rule" },
                { label: "ML", color: "#3B82F6", desc: "Rules learned from data" },
                { label: "Deep Learning", color: "#8B5CF6", desc: "Features learned too" },
                { label: "Transformer", color: "#00FF88", desc: "The structural break" },
                { label: "Systems", color: "#FF4444", desc: "LLMs + design patterns" },
              ].map(e => (
                <div key={e.label} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: e.color, flexShrink: 0 }}/>
                  <div>
                    <span style={{ fontSize: "12px", color: e.color, fontWeight: "700" }}>{e.label}</span>
                    <span style={{ fontSize: "11px", color: "#444", marginLeft: "8px" }}>{e.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "24px 20px" }}>
              {/* Node header */}
              <div style={{
                padding: "16px", background: node.color + "10",
                border: `1px solid ${node.color}30`, borderRadius: "8px", marginBottom: "20px"
              }}>
                <div style={{ fontSize: "20px", fontWeight: "800", color: node.color, marginBottom: "4px" }}>{node.label}</div>
                <div style={{ fontSize: "11px", color: "#666" }}>{node.sub}</div>
              </div>

              {/* Description */}
              <div style={{ fontSize: "13px", color: "#999", lineHeight: 1.7, marginBottom: "20px", borderLeft: `2px solid ${node.color}40`, paddingLeft: "12px" }}>
                {node.desc}
              </div>

              {/* Key algorithms */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", color: "#444", letterSpacing: "2px", marginBottom: "10px" }}>KEY ALGORITHMS / MODELS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {node.algos.map(a => (
                    <span key={a} style={{
                      fontSize: "11px", padding: "3px 8px",
                      background: node.color + "15", border: `1px solid ${node.color}30`,
                      color: node.color, borderRadius: "3px"
                    }}>{a}</span>
                  ))}
                </div>
              </div>

              {/* Connected to */}
              {node.children.length > 0 && (
                <div>
                  <div style={{ fontSize: "10px", color: "#444", letterSpacing: "2px", marginBottom: "10px" }}>LED TO</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {node.children.map(cid => {
                      const child = NODES[cid];
                      return (
                        <div key={cid}
                          onClick={() => setSelected(cid)}
                          style={{
                            padding: "8px 12px", background: child.color + "10",
                            border: `1px solid ${child.color}30`, borderRadius: "6px",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
                          }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: child.color, flexShrink: 0 }}/>
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: child.color }}>{child.label}</div>
                            <div style={{ fontSize: "10px", color: "#444" }}>{child.sub}</div>
                          </div>
                          <span style={{ marginLeft: "auto", color: "#333", fontSize: "11px" }}>→</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button onClick={() => setSelected(null)} style={{
                marginTop: "24px", width: "100%", padding: "10px",
                background: "transparent", border: "1px solid #1A1A2A",
                borderRadius: "6px", color: "#444", cursor: "pointer", fontSize: "12px"
              }}>← Back to tree</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
