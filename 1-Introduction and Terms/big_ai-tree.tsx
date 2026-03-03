import { useState, useEffect } from "react";

const NODES = {
  early: {
    id: "early", label: "EARLY AI", sub: "Symbolic · Rule-based", color: "#94A3B8",
    desc: "The birth of AI as a field. Focus on symbolic reasoning, logic, and hand-crafted rules. Machines that could 'think' by manipulating symbols — no learning, pure logic.",
    algos: ["Logic Theorist (1956)", "General Problem Solver", "ELIZA", "Shakey the Robot", "Expert Systems", "MYCIN"],
    children: ["expert", "connectionist"],
    year: 1956, inventors: ["John McCarthy", "Marvin Minsky", "Allen Newell", "Herbert Simon"],
    icon: "🤖", x: 50, y: 3,
  },
  expert: {
    id: "expert", label: "EXPERT SYS.", sub: "1980s Boom & Bust", color: "#6B7280",
    desc: "Rule-based systems encoding human expertise. Commercial success in narrow domains — then crashed during the AI Winter when maintenance costs exploded and limitations became clear.",
    algos: ["R1/XCON", "MYCIN", "DENDRAL", "Backward Chaining", "Forward Chaining", "Inference Engines"],
    children: [], year: 1980, inventors: ["Edward Feigenbaum"],
    icon: "⚙️", x: 28, y: 12,
  },
  connectionist: {
    id: "connectionist", label: "CONNECTIONISM", sub: "Early Neural Nets", color: "#7C8FA6",
    desc: "The rival approach to symbolic AI. Networks of simple units could learn — but limited by compute and the XOR problem setback (Minsky & Papert, 1969). Revival came in 1986 with backprop.",
    algos: ["Perceptron (1958)", "ADALINE", "Hopfield Networks", "Boltzmann Machines", "Backpropagation (1986)"],
    children: ["ml"], year: 1958, inventors: ["Frank Rosenblatt", "Geoffrey Hinton", "David Rumelhart"],
    icon: "🧬", x: 72, y: 12,
  },
  ml: {
    id: "ml", label: "ML", sub: "Machine Learning", color: "#3B82F6",
    desc: "Systems that learn from data instead of explicit rules. The paradigm shift: behavior learned, not written. Statistics meets computation at scale.",
    algos: ["Linear Regression", "SVM", "Decision Trees", "Random Forest", "K-Means", "Naive Bayes", "Gradient Boosting", "XGBoost"],
    children: ["rl"], year: 1980, inventors: ["Arthur Samuel", "Tom Mitchell", "Vladimir Vapnik"],
    icon: "📊", x: 30, y: 24,
  },
  nn: {
    id: "nn", label: "DEEP LEARNING", sub: "Neural Networks", color: "#8B5CF6",
    desc: "Layered networks trained via gradient descent. End-to-end representation learning — features are discovered, not hand-crafted. The 2012 ImageNet breakthrough was the Big Bang of modern AI.",
    algos: ["Backpropagation", "Dropout", "Batch Norm", "ReLU", "Adam optimizer", "Xavier Init", "Residual Connections"],
    children: ["cv", "nlp", "rl"], year: 1986, inventors: ["Geoffrey Hinton", "Yann LeCun", "Yoshua Bengio", "Jürgen Schmidhuber"],
    icon: "🔮", x: 68, y: 24,
  },
  rl: {
    id: "rl", label: "RL", sub: "Reinforcement Learning", color: "#F87171",
    desc: "Learning through interaction and rewards. Agents learn policies by trial and error. The secret sauce behind game-playing AI, robotics, and RLHF — which aligns LLMs to human values.",
    algos: ["Q-Learning", "SARSA", "Policy Gradients", "PPO", "DQN", "A3C", "SAC", "AlphaGo", "AlphaZero"],
    children: ["marl", "robotics"], year: 1992, inventors: ["Richard Sutton", "Andrew Barto", "David Silver"],
    icon: "🎮", x: 50, y: 36,
  },
  marl: {
    id: "marl", label: "MARL", sub: "Multi-Agent RL", color: "#FB923C",
    desc: "Multiple RL agents learning and interacting simultaneously. Emergent behaviors, cooperation, and competition arise from simple rules. The frontier of complex adaptive systems.",
    algos: ["MADDPG", "QMIX", "VDN", "MAPPO", "NeuroEvolution", "Self-Play"],
    children: [], year: 2017, inventors: ["Jakob Foerster", "Shimon Whiteson"],
    icon: "👥", x: 18, y: 46,
  },
  robotics: {
    id: "robotics", label: "ROBOTICS", sub: "Embodied AI", color: "#2DD4BF",
    desc: "AI in physical systems. Perception → planning → control loop. The challenge of connecting mind to body in the real, uncertain, continuous world.",
    algos: ["SLAM", "Inverse Kinematics", "Imitation Learning", "Model Predictive Control", "Motion Planning", "Grasping"],
    children: [], year: 1960, inventors: ["Rodney Brooks", "Oussama Khatib"],
    icon: "🦾", x: 36, y: 46,
  },
  cv: {
    id: "cv", label: "CV + CNN", sub: "Computer Vision", color: "#EC4899",
    desc: "Deep learning applied to images. CNNs learn spatial hierarchies: edges → shapes → objects. ImageNet 2012 (AlexNet) started the modern AI era. Now challenged by Vision Transformers.",
    algos: ["LeNet", "AlexNet", "VGG", "ResNet", "YOLO", "U-Net", "GAN", "StyleGAN", "EfficientNet"],
    children: ["vit", "diffusion"], year: 2012, inventors: ["Yann LeCun", "Alex Krizhevsky", "Ilya Sutskever", "Kaiming He"],
    icon: "👁️", x: 62, y: 36,
  },
  nlp: {
    id: "nlp", label: "NLP + LSTM", sub: "Natural Language Processing", color: "#FBBF24",
    desc: "Deep learning applied to sequences. RNNs process tokens one by one. LSTMs add gating for long-range dependencies. Sequential — slow to train, but dominated language until 2017.",
    algos: ["RNN", "LSTM", "GRU", "Seq2Seq", "Attention (early)", "Word2Vec", "GloVe", "ELMo", "Beam Search"],
    children: ["transformer"], year: 2014, inventors: ["Sepp Hochreiter", "Jürgen Schmidhuber", "Kyunghyun Cho", "Yoshua Bengio"],
    icon: "📝", x: 80, y: 36,
  },
  transformer: {
    id: "transformer", label: "TRANSFORMER", sub: "Attention Is All You Need · 2017", color: "#34D399",
    desc: "The architectural breakthrough that ate the world. Replaced recurrence with self-attention — fully parallelizable. Scaling laws emerged. Originally for machine translation, now powers everything.",
    algos: ["Self-Attention", "Multi-Head Attention", "Positional Encoding", "Encoder-Decoder", "Layer Norm", "Scaled Dot-Product"],
    children: ["gpt", "bert", "vit", "diffusion", "t5"],
    year: 2017, inventors: ["Ashish Vaswani", "Noam Shazeer", "Jakob Uszkoreit", "Google Brain"],
    papers: ["Attention Is All You Need"],
    icon: "⚡", x: 68, y: 56,
  },
  t5: {
    id: "t5", label: "T5", sub: "Text-to-Text Transfer", color: "#10B981",
    desc: "Unified framework: every NLP task cast as text-to-text. Encoder-decoder architecture bridging the gap between BERT understanding and GPT generation.",
    algos: ["T5", "mT5", "UL2", "Span Corruption", "Adapter Layers", "Prompt Tuning"],
    children: ["llm"], year: 2019, inventors: ["Colin Raffel", "Adam Roberts", "Google Research"],
    icon: "🔄", x: 50, y: 66,
  },
  gpt: {
    id: "gpt", label: "GPT BRANCH", sub: "Decoder-only · Generative", color: "#F97316",
    desc: "Decoder-only transformers trained to predict the next token. The autoregressive revolution — a simple objective with enormous consequences. Scales into LLMs.",
    algos: ["GPT-1", "GPT-2", "GPT-3", "GPT-4", "Claude", "Llama", "Mistral", "Gemini", "RLHF", "InstructGPT", "Constitutional AI"],
    children: ["llm"], year: 2018, inventors: ["Alec Radford", "Ilya Sutskever", "OpenAI"],
    papers: ["Improving Language Understanding by Generative Pre-Training"],
    icon: "📈", x: 68, y: 66,
  },
  bert: {
    id: "bert", label: "BERT BRANCH", sub: "Encoder-only · Understanding", color: "#22D3EE",
    desc: "Encoder-only transformers with masked language modeling. Bidirectional context — sees the whole sentence at once. The foundation of modern search, retrieval, and classification.",
    algos: ["BERT", "RoBERTa", "DistilBERT", "ALBERT", "DeBERTa", "ELECTRA", "Sentence-BERT", "Cross-Encoders"],
    children: ["embeddings"], year: 2018, inventors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee", "Google"],
    papers: ["BERT: Pre-training of Deep Bidirectional Transformers"],
    icon: "🔍", x: 86, y: 66,
  },
  vit: {
    id: "vit", label: "ViT", sub: "Vision Transformer", color: "#F472B6",
    desc: "Transformers applied to images by splitting them into patches — no convolutions needed. Proved pure attention beats CNNs at scale. Unlocked a new era of vision-language models.",
    algos: ["ViT", "DeiT", "CLIP", "DINO", "SAM", "Florence", "SigLIP", "MAE", "BEiT"],
    children: ["multimodal"], year: 2020, inventors: ["Alexey Dosovitskiy", "Lucas Beyer", "Google Brain"],
    papers: ["An Image is Worth 16x16 Words"],
    icon: "🖼️", x: 32, y: 66,
  },
  diffusion: {
    id: "diffusion", label: "DIFFUSION", sub: "Generative · Image & Video", color: "#A78BFA",
    desc: "Learn to reverse a noise process to generate images. Iterative refinement beats GANs for quality and diversity. Now powers all major image and video generation systems.",
    algos: ["DDPM", "DDIM", "Stable Diffusion", "DALL-E 2/3", "Midjourney", "Sora", "ControlNet", "LoRA", "DreamBooth", "Imagen"],
    children: ["multimodal"], year: 2020, inventors: ["Jonathan Ho", "Robin Rombach", "William Peebles"],
    papers: ["Denoising Diffusion Probabilistic Models"],
    icon: "🎨", x: 14, y: 66,
  },
  multimodal: {
    id: "multimodal", label: "MULTIMODAL", sub: "Vision + Language + Audio", color: "#FF6EB4",
    desc: "Models that understand and generate across modalities. The fusion of vision, language, and audio into a single unified representation. Towards human-like perception.",
    algos: ["CLIP", "Flamingo", "GPT-4V", "Gemini", "Claude Vision", "ImageBind", "GATO", "DALL-E 3", "Sora"],
    children: ["llm"], year: 2021, inventors: ["Alec Radford", "Jean-Baptiste Alayrac", "Many others"],
    icon: "🎯", x: 23, y: 80,
  },
  embeddings: {
    id: "embeddings", label: "EMBEDDINGS", sub: "Semantic Representations", color: "#06B6D4",
    desc: "Dense vectors encoding meaning. Similar concepts cluster in vector space. The bridge between language and retrieval — the foundation of semantic search and RAG.",
    algos: ["text-embedding-3", "all-MiniLM", "BGE", "Cohere Embed", "Voyage", "E5", "Contriever", "FAISS"],
    children: ["rag", "semantic"], year: 2013, inventors: ["Tomas Mikolov", "Jeffrey Dean"],
    icon: "🔢", x: 86, y: 80,
  },
  semantic: {
    id: "semantic", label: "SEMANTIC", sub: "Knowledge Graphs", color: "#4F8EF7",
    desc: "Structured knowledge and ontologies: the classical approach to meaning, now hybridizing with vector search in Graph RAG for more explainable, precise retrieval.",
    algos: ["RDF", "SPARQL", "OWL", "Knowledge Graphs", "Wikidata", "ConceptNet", "Graph RAG", "Ontologies"],
    children: ["rag"], year: 2001, inventors: ["Tim Berners-Lee", "Semantic Web community"],
    icon: "🕸️", x: 96, y: 66,
  },
  llm: {
    id: "llm", label: "LLM", sub: "Large Language Models", color: "#34D399",
    desc: "Foundation models trained on massive text corpora. The operating system of modern AI. Predicts next tokens, yet capable of reasoning, coding, planning, and tool use at scale.",
    algos: ["GPT-4", "Claude 3", "Llama 3", "Gemini", "Mistral", "Qwen", "Mixtral", "Chain-of-Thought", "Self-Consistency", "Tree of Thoughts"],
    children: ["rag", "agents", "prompt"],
    year: 2020, inventors: ["OpenAI", "Anthropic", "Meta", "Google", "Mistral", "DeepSeek"],
    icon: "🧠", x: 62, y: 80,
  },
  rag: {
    id: "rag", label: "RAG", sub: "Retrieval-Augmented Generation", color: "#F87171",
    desc: "The key systems design pattern: retrieve relevant context at inference time, inject into prompt. No retraining needed. Connects LLMs to fresh, external knowledge bases.",
    algos: ["Vector DB (Pinecone, pgvector, Qdrant)", "Chunking strategies", "Hybrid search", "Reranking", "HyDE", "Self-RAG", "Corrective RAG"],
    children: [], year: 2020, inventors: ["Patrick Lewis", "Douwe Kiela", "Facebook AI"],
    papers: ["Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"],
    icon: "📚", x: 72, y: 93,
  },
  agents: {
    id: "agents", label: "AGENTS", sub: "Autonomous AI Systems", color: "#FBBF24",
    desc: "LLM + tools + memory + decision loop. The model doesn't just generate text — it acts. Can browse the web, use APIs, write and run code, and collaborate with other agents.",
    algos: ["ReAct", "Tool use", "Function calling", "LangChain", "LlamaIndex", "AutoGPT", "BabyAGI", "CrewAI", "Plan-and-Execute"],
    children: [], year: 2023, inventors: ["OpenAI (function calling)", "LangChain", "Open source community"],
    icon: "🤖", x: 52, y: 93,
  },
  prompt: {
    id: "prompt", label: "PROMPTING", sub: "Interface Engineering", color: "#86EFAC",
    desc: "The art and science of communicating with LLMs. How we steer, constrain, and elicit capabilities. The new programming paradigm — no compiler, just language.",
    algos: ["Few-shot", "Chain-of-Thought", "Zero-shot", "System prompts", "Role prompting", "Constitutional prompts", "Adversarial prompts"],
    children: [], year: 2021, inventors: ["OpenAI", "Anthropic", "Jason Wei", "Research community"],
    icon: "💬", x: 36, y: 93,
  },
};

const EDGES = [
  ["early","expert"],["early","connectionist"],
  ["connectionist","ml"],
  ["ml","rl"],["ml","nn"],
  ["nn","cv"],["nn","nlp"],["nn","rl"],
  ["rl","marl"],["rl","robotics"],
  ["nlp","transformer"],
  ["cv","vit"],["cv","diffusion"],
  ["transformer","gpt"],["transformer","bert"],["transformer","vit"],["transformer","diffusion"],["transformer","t5"],
  ["gpt","llm"],["t5","llm"],["bert","embeddings"],
  ["vit","multimodal"],["diffusion","multimodal"],
  ["multimodal","llm"],
  ["llm","rag"],["llm","agents"],["llm","prompt"],["llm","embeddings"],
  ["embeddings","rag"],["embeddings","semantic"],
  ["semantic","rag"],
];

const ERAS = [
  { label: "SYMBOLIC AI · 1956", y: 3, color: "#94A3B8" },
  { label: "LEARNING PARADIGMS · 1980s", y: 21, color: "#3B82F6" },
  { label: "DEEP LEARNING · 2012", y: 33, color: "#8B5CF6" },
  { label: "TRANSFORMER REVOLUTION · 2017", y: 52, color: "#34D399" },
  { label: "SPECIALIZATION · 2019–2021", y: 62, color: "#EC4899" },
  { label: "FOUNDATION MODELS · 2020+", y: 77, color: "#34D399" },
  { label: "AI SYSTEMS ERA · 2023+", y: 90, color: "#F87171" },
];

const W = 1100, H = 980;
const px = x => (x / 100) * W;
const py = y => (y / 100) * H;

function pulse(t, speed = 1) {
  return 0.5 + 0.5 * Math.sin(t * speed);
}

export default function AITree() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 0.04), 30);
    return () => clearInterval(id);
  }, []);

  const node = selected ? NODES[selected] : null;

  return (
    <div style={{
      minHeight: "100vh", background: "#07070F",
      color: "#E0E0F0",
      fontFamily: "'Fira Code', monospace",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 24px", borderBottom: "1px solid #13132A",
        background: "linear-gradient(90deg,#0D0D1E,#0A0A18)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        boxShadow: "0 2px 20px #00FF8808",
      }}>
        <div>
          <div style={{ fontSize: "9px", color: "#34D39960", letterSpacing: "4px", marginBottom: "3px" }}>
            AI4SWE · LECTURE 1 · INTERACTIVE MAP
          </div>
          <div style={{ fontSize: "18px", fontWeight: "800", color: "#FFF", letterSpacing: "1px" }}>
            The AI Evolution Tree
            <span style={{ fontSize: "11px", color: "#34D39980", marginLeft: "14px", fontWeight: "400" }}>
              1956 → 2024
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button onClick={() => setShowLabels(v => !v)} style={{
            background: showLabels ? "#34D39920" : "transparent",
            border: `1px solid ${showLabels ? "#34D39960" : "#1A1A2E"}`,
            padding: "6px 14px", borderRadius: "6px",
            color: showLabels ? "#34D399" : "#555",
            fontSize: "10px", cursor: "pointer", letterSpacing: "1px",
            transition: "all 0.2s",
          }}>
            {showLabels ? "LABELS ON" : "LABELS OFF"}
          </button>
          <div style={{ fontSize: "10px", color: "#333", letterSpacing: "1px" }}>
            {Object.keys(NODES).length} nodes · {EDGES.length} edges
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Canvas */}
        <div style={{ flex: 1, overflow: "auto", position: "relative", background: "#07070F" }}>
          {/* Scanline overlay */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #00000018 2px, #00000018 4px)",
          }}/>

          <svg width={W} height={H} style={{ display: "block" }}>
            <defs>
              {Object.values(NODES).map(n => (
                <filter key={n.id} id={`glow-${n.id}`} x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              ))}
              <filter id="softglow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <radialGradient id="bg-glow-green" cx="68%" cy="56%" r="20%">
                <stop offset="0%" stopColor="#34D39912"/>
                <stop offset="100%" stopColor="transparent"/>
              </radialGradient>
              <radialGradient id="bg-glow-red" cx="60%" cy="90%" r="15%">
                <stop offset="0%" stopColor="#F8717112"/>
                <stop offset="100%" stopColor="transparent"/>
              </radialGradient>
            </defs>

            {/* Background glows */}
            <rect width={W} height={H} fill="url(#bg-glow-green)"/>
            <rect width={W} height={H} fill="url(#bg-glow-red)"/>

            {/* Era bands */}
            {ERAS.map((era, i) => {
              const nextY = ERAS[i + 1]?.y ?? 100;
              return (
                <g key={i}>
                  <rect x={0} y={py(era.y) - 14} width={W} height={py(nextY - era.y)}
                    fill={era.color} opacity="0.025"/>
                  <line x1={0} y1={py(era.y) - 14} x2={W} y2={py(era.y) - 14}
                    stroke={era.color} strokeWidth="0.5" opacity="0.15"/>
                </g>
              );
            })}

            {/* Era labels */}
            {ERAS.map((era, i) => (
              <text key={i} x={8} y={py(era.y) - 3}
                fontSize="8" fill={era.color} opacity="0.55"
                letterSpacing="2" style={{ userSelect: "none" }}>
                {era.label}
              </text>
            ))}

            {/* Edges */}
            {EDGES.map(([a, b], i) => {
              const na = NODES[a], nb = NODES[b];
              if (!na || !nb) return null;
              const isActive = selected === a || selected === b || hovered === a || hovered === b;
              const animOpacity = isActive ? 0.9 : 0.12 + 0.04 * pulse(tick + i * 0.3, 0.5);
              return (
                <line key={i}
                  x1={px(na.x)} y1={py(na.y) + 20}
                  x2={px(nb.x)} y2={py(nb.y) - 20}
                  stroke={isActive ? na.color : "#FFFFFF"}
                  strokeWidth={isActive ? 2 : 0.8}
                  strokeDasharray={isActive ? "none" : "3 5"}
                  opacity={animOpacity}
                  style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
                />
              );
            })}

            {/* Nodes */}
            {Object.values(NODES).map(n => {
              const cx = px(n.x), cy = py(n.y);
              const isSel = selected === n.id;
              const isHov = hovered === n.id;
              const isAct = isSel || isHov;
              const r = 22;
              const glowPulse = 0.4 + 0.2 * pulse(tick, 1.2);

              return (
                <g key={n.id}
                  onClick={() => setSelected(selected === n.id ? null : n.id)}
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Animated outer glow ring */}
                  {isAct && (
                    <circle cx={cx} cy={cy} r={r + 12}
                      fill="none" stroke={n.color}
                      strokeWidth="1" opacity={glowPulse}
                      strokeDasharray="4 4"
                      filter={`url(#glow-${n.id})`}
                    />
                  )}
                  {/* Halo for non-selected */}
                  {!isAct && (
                    <circle cx={cx} cy={cy} r={r + 6}
                      fill="none" stroke={n.color}
                      strokeWidth="0.5"
                      opacity={0.08 + 0.06 * pulse(tick + n.x, 0.8)}
                    />
                  )}
                  {/* Main circle */}
                  <circle cx={cx} cy={cy} r={r}
                    fill={isSel ? n.color : "#0D0D1E"}
                    stroke={n.color}
                    strokeWidth={isAct ? 2.5 : 1.5}
                    opacity={1}
                    filter={isAct ? `url(#glow-${n.id})` : "none"}
                    style={{ transition: "all 0.25s" }}
                  />
                  {/* Inner highlight */}
                  <circle cx={cx - 5} cy={cy - 5} r={6}
                    fill={n.color} opacity={isSel ? 0.25 : 0.06}
                    style={{ transition: "all 0.25s" }}
                  />
                  {/* Icon */}
                  <text x={cx} y={cy + 5} textAnchor="middle"
                    fontSize={13} style={{ userSelect: "none" }}>
                    {n.icon}
                  </text>
                  {/* Label */}
                  {(showLabels || isAct) && (
                    <text x={cx} y={cy + r + 16} textAnchor="middle"
                      fontSize="10.5" fontWeight={isAct ? "800" : "600"}
                      fill={isAct ? n.color : "#FFFFFF"}
                      opacity={isAct ? 1 : 0.6}
                      letterSpacing="0.5"
                      style={{ userSelect: "none", transition: "all 0.2s" }}
                    >{n.label}</text>
                  )}
                  {/* Year badge on hover */}
                  {isHov && (
                    <g>
                      <rect x={cx - 18} y={cy - r - 22} width={36} height={14}
                        rx={3} fill={n.color} opacity="0.9"/>
                      <text x={cx} y={cy - r - 12} textAnchor="middle"
                        fontSize="8" fontWeight="bold" fill="#000"
                        style={{ userSelect: "none" }}>
                        {n.year}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Side Panel */}
        <div style={{
          width: "330px", borderLeft: "1px solid #13132A",
          background: "linear-gradient(180deg, #0A0A18, #080810)",
          overflowY: "auto", flexShrink: 0,
        }}>
          {!node ? (
            <div style={{ padding: "28px 20px" }}>
              <div style={{ fontSize: "9px", color: "#34D39950", letterSpacing: "3px", marginBottom: "20px" }}>
                NAVIGATION GUIDE
              </div>
              {["Each node is a milestone in AI history", "Edges show what led to what", "Click any node to explore its story", "Hover to see the year it emerged", "Use Labels toggle to reduce noise"].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
                  <span style={{ color: "#34D39960", fontSize: "11px", marginTop: "1px" }}>→</span>
                  <span style={{ fontSize: "12px", color: "#555", lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}

              <div style={{ height: "1px", background: "#13132A", margin: "24px 0" }}/>
              <div style={{ fontSize: "9px", color: "#34D39950", letterSpacing: "3px", marginBottom: "16px" }}>
                ERA GUIDE
              </div>
              {[
                { label: "Symbolic AI", color: "#94A3B8", desc: "Hand-coded rules" },
                { label: "Machine Learning", color: "#3B82F6", desc: "Rules from data" },
                { label: "Deep Learning", color: "#8B5CF6", desc: "Features from data" },
                { label: "Transformer Era", color: "#34D399", desc: "Architecture revolution" },
                { label: "Foundation Models", color: "#EC4899", desc: "Scale unlocks emergence" },
                { label: "Systems Era", color: "#F87171", desc: "LLMs + design patterns" },
              ].map(e => (
                <div key={e.label} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: e.color, flexShrink: 0, boxShadow: `0 0 8px ${e.color}` }}/>
                  <span style={{ fontSize: "11px", color: e.color, fontWeight: "700" }}>{e.label}</span>
                  <span style={{ fontSize: "10px", color: "#333", marginLeft: "auto" }}>{e.desc}</span>
                </div>
              ))}

              <div style={{ height: "1px", background: "#13132A", margin: "24px 0" }}/>
              <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", textAlign: "center" }}>
                {Object.keys(NODES).length} milestones · {EDGES.length} connections
              </div>
            </div>
          ) : (
            <div style={{ padding: "22px 18px" }}>
              {/* Node Header */}
              <div style={{
                padding: "16px", marginBottom: "18px",
                background: `linear-gradient(135deg, ${node.color}18, ${node.color}08)`,
                border: `1px solid ${node.color}35`,
                borderRadius: "10px",
                boxShadow: `0 0 20px ${node.color}12`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "22px" }}>{node.icon}</span>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: node.color, letterSpacing: "0.5px" }}>
                    {node.label}
                  </div>
                </div>
                <div style={{ fontSize: "11px", color: "#666", marginBottom: "6px" }}>{node.sub}</div>
                <div style={{ fontSize: "10px", color: "#444" }}>
                  <span style={{ color: node.color, opacity: 0.7 }}>{node.year}</span>
                  {node.inventors && (
                    <span style={{ marginLeft: "8px" }}>
                      {node.inventors.slice(0, 2).join(", ")}{node.inventors.length > 2 ? " et al." : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={{
                fontSize: "12px", color: "#8A8AAA", lineHeight: 1.75, marginBottom: "18px",
                borderLeft: `2px solid ${node.color}50`, paddingLeft: "12px",
              }}>
                {node.desc}
              </div>

              {/* Landmark Paper */}
              {node.papers && (
                <div style={{ marginBottom: "18px" }}>
                  <div style={{ fontSize: "8px", color: "#444", letterSpacing: "2px", marginBottom: "8px" }}>LANDMARK PAPER</div>
                  <div style={{
                    fontSize: "11px", padding: "8px 12px",
                    background: `${node.color}12`, border: `1px solid ${node.color}25`,
                    borderRadius: "6px", color: node.color,
                  }}>
                    📄 {node.papers[0]}
                  </div>
                </div>
              )}

              {/* Algorithms */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "8px", color: "#444", letterSpacing: "2px", marginBottom: "10px" }}>
                  KEY ALGORITHMS & MODELS
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {node.algos.map(a => (
                    <span key={a} style={{
                      fontSize: "10px", padding: "3px 8px",
                      background: `${node.color}12`, border: `1px solid ${node.color}25`,
                      color: node.color, borderRadius: "4px",
                    }}>{a}</span>
                  ))}
                </div>
              </div>

              {/* Led To */}
              {node.children.length > 0 && (
                <div style={{ marginBottom: "18px" }}>
                  <div style={{ fontSize: "8px", color: "#444", letterSpacing: "2px", marginBottom: "8px" }}>LED TO</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {node.children.map(cid => {
                      const ch = NODES[cid];
                      if (!ch) return null;
                      return (
                        <div key={cid} onClick={() => setSelected(cid)}
                          style={{
                            padding: "8px 12px", cursor: "pointer",
                            background: `${ch.color}10`, border: `1px solid ${ch.color}25`,
                            borderRadius: "7px", display: "flex", alignItems: "center", gap: "8px",
                            transition: "all 0.18s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = `${ch.color}22`}
                          onMouseLeave={e => e.currentTarget.style.background = `${ch.color}10`}
                        >
                          <span style={{ fontSize: "15px" }}>{ch.icon}</span>
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: "700", color: ch.color }}>{ch.label}</div>
                            <div style={{ fontSize: "9px", color: "#444" }}>{ch.year}</div>
                          </div>
                          <span style={{ marginLeft: "auto", color: "#333", fontSize: "12px" }}>→</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Comes From */}
              {(() => {
                const parents = Object.values(NODES).filter(p => p.children.includes(node.id));
                return parents.length > 0 ? (
                  <div style={{ marginBottom: "18px" }}>
                    <div style={{ fontSize: "8px", color: "#444", letterSpacing: "2px", marginBottom: "8px" }}>COMES FROM</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      {parents.map(p => (
                        <div key={p.id} onClick={() => setSelected(p.id)}
                          style={{
                            padding: "8px 12px", cursor: "pointer",
                            background: `${p.color}10`, border: `1px solid ${p.color}25`,
                            borderRadius: "7px", display: "flex", alignItems: "center", gap: "8px",
                            transition: "all 0.18s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = `${p.color}22`}
                          onMouseLeave={e => e.currentTarget.style.background = `${p.color}10`}
                        >
                          <span style={{ fontSize: "15px" }}>{p.icon}</span>
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: "700", color: p.color }}>{p.label}</div>
                            <div style={{ fontSize: "9px", color: "#444" }}>{p.year}</div>
                          </div>
                          <span style={{ marginLeft: "auto", color: "#333", fontSize: "12px" }}>←</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              <button onClick={() => setSelected(null)} style={{
                width: "100%", padding: "10px",
                background: "transparent", border: "1px solid #1A1A2E",
                borderRadius: "7px", color: "#444", cursor: "pointer",
                fontSize: "11px", letterSpacing: "1px",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1A1A2E"; e.currentTarget.style.color = "#888"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444"; }}
              >← BACK TO TREE</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
