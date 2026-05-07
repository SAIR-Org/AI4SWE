import { useState } from "react";

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#060609",
  surface: "#0D0D18",
  surface2: "#111120",
  border: "#1C1C30",
  borderLight: "#252538",
  accent: "#00FF88",
  cv: "#3B82F6",
  nlp: "#F59E0B",
  rl: "#EC4899",
  arch: "#00FF88",
  commercial: "#FF6B35",
  multi: "#9D71EA",
  bio: "#10B981",
  text: "#E2E2F0",
  muted: "#666880",
  dim: "#333348",
};

// ─── TIMELINE DATA ───────────────────────────────────────────────────────────
const EVENTS = [
  {
    id: "dark-ages",
    year: "1950s–2011",
    title: "The Dark Ages",
    track: "unified",
    color: "#6B7280",
    landmark: false,
    tagline: "Intelligence was written, not learned.",
    body: `AI existed for 60 years before it worked. Researchers hand-coded rules into expert systems. IBM Deep Blue beat Kasparov in 1997 using search trees — not learning. Neural networks existed on paper but were untrainable at scale: vanishing gradients, no data, no compute.\n\nTwo "AI winters" froze funding. The field had promised too much. Most researchers quietly moved on.`,
    technical: "Expert systems (MYCIN, Prolog), symbolic reasoning, A* search, genetic algorithms. Backpropagation discovered in 1986 but impractical — the gradients disappear before they reach early layers.",
    commercial: "Deep Blue chess (1997). Roomba (2002). Nothing that scales. Every decade a new wave of hype, every decade a crash.",
    terms: ["Expert System", "Backpropagation", "Vanishing Gradient", "Search Algorithm"],
    insight: "The fundamental limit: you can't encode what you don't understand. Humans were the bottleneck.",
  },
  {
    id: "imagenet",
    year: "2009",
    title: "ImageNet",
    track: "cv",
    color: C.cv,
    landmark: false,
    tagline: "Building the fuel.",
    body: `Fei-Fei Li and her team spend three years labeling 14 million images. 20,000 categories. A benchmark competition: ILSVRC. The rules are simple: your model gets the image, it has to guess the category. Top-5 error is the metric.\n\nNo one knows yet that this dataset will ignite the modern AI revolution.`,
    technical: "1.2M training images. The ILSVRC benchmark starts in 2010. State-of-the-art in 2011: hand-crafted features + SVMs. Top-5 error: ~26%.",
    commercial: "Zero commercial impact. Pure academia. But without this, nothing that follows is possible.",
    terms: ["Dataset", "Benchmark", "Top-5 Error", "ILSVRC"],
    insight: "Data is infrastructure. The ImageNet team built the road; AlexNet would be the first car.",
  },
  {
    id: "alexnet",
    year: "2012",
    title: "AlexNet",
    track: "cv",
    color: C.cv,
    landmark: true,
    tagline: "The moment the field cracked open.",
    body: `Alex Krizhevsky, Ilya Sutskever, and Geoffrey Hinton enter ILSVRC 2012. Their CNN achieves 15.3% top-5 error.\n\nThe previous best: 26.2%.\n\nThat gap — more than 10 percentage points — is not an improvement. It's a signal. The entire community looks at the result and understands simultaneously: scale + GPU + the right architecture = emergence. The rules just changed.`,
    technical: "8 layers. 60M parameters. Two key innovations: ReLU activations (solves vanishing gradient), dropout (regularization). Runs on two NVIDIA GTX 580s. The GPU is the unlock — for the first time, training is fast enough to iterate.",
    commercial: "Google buys the AlexNet team's company for $44M. Every tech company starts hiring ML researchers the next Monday. Computer vision goes from academic curiosity to the fastest-moving field in engineering.",
    terms: ["CNN", "ReLU", "Dropout", "GPU Training", "ILSVRC"],
    insight: "The signal: at sufficient scale, neural networks discover structure humans didn't put there. This is the epistemological break from symbolic AI.",
  },
  {
    id: "word2vec",
    year: "2013",
    title: "Word2Vec",
    track: "nlp",
    color: C.nlp,
    landmark: false,
    tagline: "Language finds shape.",
    body: `Tomas Mikolov at Google trains a neural network to predict words from context. A side effect: each word gets a dense vector representation. King − Man + Woman ≈ Queen.\n\nFor the first time, semantic meaning lives in geometric space. NLP researchers have their version of the AlexNet moment — not as loud, but just as structural.`,
    technical: "Skip-gram and CBOW architectures. Embeddings are 300-dimensional vectors. Cosine similarity measures semantic relationship. Pre-trained on Google News (100B words). The embedding space is linear and compositional.",
    commercial: "Enables much better search, recommendations, autocomplete. Google uses this internally for years before it becomes public knowledge.",
    terms: ["Embedding", "Vector Space", "Semantic Similarity", "Representation Learning"],
    insight: "NLP's version of the feature-learning insight: instead of engineering features for words, let the network discover the representation.",
  },
  {
    id: "seqseq",
    year: "2014",
    title: "seq2seq + Attention",
    track: "nlp",
    color: C.nlp,
    landmark: false,
    tagline: "Machines learn to translate.",
    body: `Sutskever et al. at Google build a model that reads a sentence and produces another sentence in a different language. The encoder–decoder architecture: compress input into a hidden state, decode into output.\n\nBahdanau then adds attention: instead of reading only the last hidden state, the decoder can "look back" at the entire input sequence. Translation quality improves dramatically.`,
    technical: "LSTM encoder → context vector → LSTM decoder. The bottleneck: the entire input is compressed into one fixed-size vector. Attention bypasses the bottleneck — a learned weighted sum over all encoder states.",
    commercial: "Google Translate improves by the equivalent of 10 years of traditional progress in one year. The paper is the paper everyone will cite when explaining the motivation for transformers.",
    terms: ["LSTM", "Encoder-Decoder", "Attention Mechanism", "Context Vector"],
    insight: "The attention mechanism is the key idea. It will escape the LSTM and become the thing in 2017.",
  },
  {
    id: "resnet",
    year: "2015",
    title: "ResNet",
    track: "cv",
    color: C.cv,
    landmark: false,
    tagline: "Going deeper, finally.",
    body: `Microsoft Research trains a network 152 layers deep. Previous attempts at very deep networks degraded — more layers made the model worse. Residual connections fix this: add the input directly to the output of each block.\n\nResNet achieves 3.6% top-5 error on ImageNet. Human-level is ~5%. The machine has surpassed human vision on this benchmark.`,
    technical: "Skip connections: y = F(x) + x. Gradients flow directly through the skip path — the vanishing gradient problem is structurally bypassed. 152 layers, 60M parameters. Winner of ILSVRC 2015 by a large margin.",
    commercial: "Superhuman image classification is now a solved problem. The field moves on — detection, segmentation, generation. VGG, GoogLeNet, ResNet become the standard feature extractors for all vision tasks.",
    terms: ["Residual Connection", "Skip Connection", "Deep Network", "Feature Extraction"],
    insight: "Scale works — if you fix the training pathology. The residual connection is a surgical fix that unlocks depth. This pattern will appear in every architecture that follows.",
  },
  {
    id: "alphago",
    year: "2016",
    title: "AlphaGo",
    track: "rl",
    color: C.rl,
    landmark: true,
    tagline: "The machine stunned the world.",
    body: `DeepMind's AlphaGo beats Lee Sedol 4–1 in Go. This was supposed to be impossible for at least a decade. The space is 10^170 — too large for search. Go requires intuition.\n\nWhat happened: convolutional networks learned to evaluate board positions. Reinforcement learning through self-play sharpened those networks to superhuman level. Two neural networks. One picks moves, one evaluates positions.\n\nMove 37 of Game 2 — AlphaGo plays a move no human would. Commentators think it's a mistake. Lee Sedol stares at the board and walks away.`,
    technical: "Policy network (picks moves) + value network (evaluates positions). Both are deep CNNs trained first on human expert games (supervised), then self-play (RL). Monte Carlo Tree Search guides search. No human knowledge encoded beyond the rules of the game.",
    commercial: "DeepMind's research budget is justified to Alphabet forever. Every government starts a national AI strategy. The narrative shifts: AI is real, it's faster than expected, and nobody fully understands it.",
    terms: ["Reinforcement Learning", "Self-play", "Policy Network", "Value Network", "MCTS"],
    insight: "RL + deep learning = superhuman performance on tasks requiring intuition, not just pattern matching. AlphaFold is six years away and this is the proof of concept.",
  },
  {
    id: "transformer",
    year: "2017",
    title: "Attention Is All You Need",
    track: "arch",
    color: C.arch,
    landmark: true,
    tagline: "The architecture that unified everything.",
    body: `Vaswani et al. at Google Brain publish a translation model with no recurrence and no convolution. Just attention, applied in parallel across the whole sequence.\n\nThe transformer processes every position simultaneously. Training on TPUs is 3× faster. Quality is better. And unlike CNNs or LSTMs, the same architecture generalizes across domains.\n\nThis is the moment the CV/NLP split ends. In three years, transformers will dominate both. In five years, they will dominate everything.`,
    technical: "Multi-head self-attention: Q, K, V matrices. Each position attends to every other position — O(n²) but fully parallelizable. Positional encoding replaces recurrence. Feed-forward layers + layer normalization. The same attention block stacks arbitrarily deep.",
    commercial: "Google uses it for translation immediately. The architecture papers start citing it within months. By 2019, every major NLP benchmark is held by a transformer. By 2021, so is every major vision benchmark.",
    terms: ["Self-Attention", "Multi-Head Attention", "Positional Encoding", "Layer Norm", "Feed-Forward"],
    insight: "This is the structural break. LLMs are not a new species — they're transformers scaled to absurdity. Every foundation model you'll ever use is built on this 8-page paper.",
  },
  {
    id: "bert-gpt",
    year: "2018",
    title: "BERT + GPT-1",
    track: "nlp",
    color: C.nlp,
    landmark: false,
    tagline: "Pretraining becomes the paradigm.",
    body: `Two bets on the same insight — pretrain a large transformer on unlabeled text, then fine-tune on specific tasks.\n\nBERT (Google): bidirectional, reads left and right, excels at understanding tasks. GPT (OpenAI): left-to-right, generative, excels at generation. They approach the same hypothesis from opposite ends.\n\nThe hypothesis: language modeling at scale forces the model to learn the structure of reality. Grammar, facts, reasoning — it's all in the pretraining signal.`,
    technical: "BERT: masked language model + next sentence prediction. 340M parameters. GPT-1: 117M parameters, 12 transformer blocks, causal attention. Both dominate NLP benchmarks. Fine-tuning requires only a few thousand examples.",
    commercial: "Google starts using BERT in search results in 2019. Almost every AI product is a fine-tuned BERT or GPT from this point forward. The era of training from scratch for NLP tasks is over.",
    terms: ["Pretraining", "Fine-tuning", "BERT", "GPT", "Masked Language Modeling"],
    insight: "Train on everything, specialize on very little. This remains the dominant paradigm — every model you use is pretrained.",
  },
  {
    id: "gpt3",
    year: "2020",
    title: "GPT-3",
    track: "nlp",
    color: C.nlp,
    landmark: true,
    tagline: "Scale as a new kind of intelligence.",
    body: `OpenAI scales GPT from 117M to 175 billion parameters. The result surprises everyone, including OpenAI.\n\nFew-shot learning: show the model three examples and it generalizes. The model was never trained on these tasks. It learns from the prompt alone.\n\nKaplan et al. publish the scaling laws: loss decreases predictably as you increase model size, data, and compute. Intelligence is not qualitative — it's a curve you can extrapolate.`,
    technical: "175B parameters. Trained on 570GB of filtered text (Common Crawl, Wikipedia, books). In-context learning: task examples in the prompt shift behavior without updating weights. The scaling law paper: L ∝ N^0.076 × D^0.095 × C^0.05.",
    commercial: "API waitlist fills immediately. Startups pivot to GPT-3 overnight. The term 'foundation model' is coined by Stanford. Every tech company reassesses what their AI strategy should be.",
    terms: ["Few-Shot Learning", "In-Context Learning", "Scaling Laws", "Foundation Model", "Prompt"],
    insight: "Scale changes the category, not just the score. GPT-3 does things GPT-2 couldn't — not because of new techniques, but because of more parameters and more data.",
  },
  {
    id: "clip-dalle",
    year: "2021",
    title: "CLIP + DALL-E",
    track: "multi",
    color: C.multi,
    landmark: false,
    tagline: "Vision and language collide.",
    body: `OpenAI trains CLIP on 400 million image-text pairs from the internet. The model learns a shared embedding space — text and images become directly comparable.\n\nDALL-E generates images from text descriptions. These two models prove the transformer generalizes beyond language. The modality doesn't matter — tokens are tokens.`,
    technical: "CLIP: contrastive learning — pull matching image/text embeddings together, push non-matching apart. DALL-E: autoregressive transformer generating image tokens. Both trained at scale on internet data.",
    commercial: "CLIP becomes the backbone of every text-to-image product. DALL-E 2 and Stable Diffusion will follow. The creative industry notices.",
    terms: ["Contrastive Learning", "Multimodal", "Zero-Shot Transfer", "Image Tokens"],
    insight: "The transformer is not an NLP architecture — it's a sequence architecture. Every domain that can be tokenized is now accessible.",
  },
  {
    id: "alphafold",
    year: "2022 (Jan)",
    title: "AlphaFold2",
    track: "bio",
    color: C.bio,
    landmark: true,
    tagline: "Science's 50-year problem, solved.",
    body: `Protein folding: given a sequence of amino acids, predict the 3D structure. This had been unsolved for 50 years. Structure determines function — solving it means being able to design drugs, understand disease, engineer biology.\n\nDeepMind's AlphaFold2 achieves near-experimental accuracy. In two years, it predicts the structure of virtually every known protein — 200 million structures. This is what deep learning looks like applied to hard science.`,
    technical: "Multiple sequence alignment + attention over residue pairs + iterative refinement. The Evoformer module processes co-evolutionary information. Fine-tuned with structural templates. AlphaFold Database released open-source.",
    commercial: "Pharmaceutical companies adopt it immediately. DeepMind releases the full database for free. Nature calls it 'the most important AI achievement' since chess and Go. Every biology PhD student's workflow changes.",
    terms: ["Protein Structure Prediction", "MSA", "Evoformer", "Structure Embeddings"],
    insight: "Deep learning doesn't just make products better — it solves problems that eluded science for generations. The same techniques building chatbots are curing disease.",
  },
  {
    id: "chatgpt",
    year: "2022 (Nov)",
    title: "ChatGPT",
    track: "commercial",
    color: C.commercial,
    landmark: true,
    tagline: "100 million users in 60 days.",
    body: `OpenAI wraps GPT-3.5 in a conversational interface. No API key needed. Just a text box.\n\nThe product crosses 1 million users in 5 days. 100 million in two months. Nothing in consumer internet history has grown this fast — not Instagram, not TikTok.\n\nEvery PM in every company books a meeting called "Our AI Strategy." Every engineer gets pulled into a project with "AI" in the name. The word loses all precision. The era you're in right now begins here.`,
    technical: "GPT-3.5 fine-tuned with RLHF: human raters evaluate outputs, a reward model is trained on those ratings, PPO RL fine-tunes the base model toward high-reward outputs. Safety alignment and helpful assistant behavior emerge from RLHF.",
    commercial: "Microsoft announces $10B investment in OpenAI. Google declares a 'Code Red.' Anthropic founded by former OpenAI alignment team. Llama leaked (then released) by Meta. The race is on.",
    terms: ["RLHF", "Fine-tuning", "Alignment", "Instruction Tuning", "PPO"],
    insight: "The interface is the product. GPT-3 existed for 2 years and reached specialists. ChatGPT reached everyone in 60 days. Distribution changed, not the model.",
  },
  {
    id: "agentic",
    year: "2023–Now",
    title: "The Agentic Wave",
    track: "arch",
    color: C.accent,
    landmark: false,
    tagline: "From chatbots to autonomous systems.",
    body: `GPT-4 and Claude 3 arrive. Llama goes open-source. The race to the frontier accelerates.\n\nBut the more important shift: LLMs gain tools. Function calling. Code interpreters. Browser control. The model stops answering questions and starts taking actions.\n\nCoding agents (Cursor, Devin, GitHub Copilot) write and run code autonomously. This is the application layer that AI engineers build. The foundation models are the infrastructure. What you build on top is the product.`,
    technical: "Tool calling: model outputs structured JSON specifying which tool to invoke and with what arguments. Orchestration loops: observe → plan → act → observe. ReAct, chain-of-thought, multi-agent frameworks.",
    commercial: "Every IDE ships an AI copilot. Cursor reaches $100M ARR. The term 'AI Engineer' enters job postings. Chip Huyen's 'AI Engineering' defines the discipline. Software development is changing faster than any point since the web.",
    terms: ["Tool Calling", "Agent", "Orchestration", "ReAct", "Multi-Agent", "Context Window"],
    insight: "You are here. The infrastructure is ready. The application layer is being built right now — by engineers exactly like you.",
  },
];

// ─── STACK DATA ───────────────────────────────────────────────────────────────
const STACK_LAYERS = [
  {
    num: "L1",
    name: "Product / UI Layer",
    job: "Front-end / Full-stack Engineer",
    color: "#EC4899",
    entry: "Your existing skills transfer directly",
    what: "The interface users touch. Chat UI, embedded AI features, copilot inside your product. Response rendering, streaming display, prompt composition.",
    how: "Streaming API responses (SSE), React state for conversation history, markdown rendering, latency-aware UX. You're an API consumer here.",
    tools: ["Next.js", "Vercel AI SDK", "Streaming APIs", "shadcn/ui"],
    terms: ["System Prompt", "Streaming", "Response Formatting"],
    effort: "Low barrier. You already know how.",
    aiEngineer: false,
  },
  {
    num: "L2",
    name: "API / Orchestration Layer",
    job: "AI Engineer ← This is the role",
    color: "#00FF88",
    entry: "The primary home of AI Engineering",
    what: "Where you integrate intelligence into applications. Designing prompts, managing context, implementing retrieval, adding memory, defining how agents behave.",
    how: "Calling Anthropic/OpenAI APIs, building RAG pipelines, implementing tool calling, orchestrating multi-step agents, evaluating outputs, managing cost/latency.",
    tools: ["Anthropic SDK", "LangChain", "LlamaIndex", "Pinecone", "Weaviate", "Ollama"],
    terms: ["RAG", "Tool Calling", "Context Window", "Embeddings", "Agent", "Structured Output"],
    effort: "This is the craft. Engineering judgment matters enormously here.",
    aiEngineer: true,
  },
  {
    num: "L3",
    name: "Model / ML Layer",
    job: "ML Engineer",
    color: "#8B5CF6",
    entry: "Requires ML fundamentals",
    what: "Transformer architecture in PyTorch. Pretrained weights. Tokenizer. Forward pass. Fine-tuning. Evaluating model behavior at a mechanistic level.",
    how: "Fine-tuning with LoRA/PEFT, building training pipelines, evaluating on benchmarks, modifying architectures, working with Hugging Face model hub.",
    tools: ["PyTorch", "Hugging Face Transformers", "LoRA / PEFT", "Axolotl", "Weights & Biases"],
    terms: ["Fine-tuning", "Weights", "Tokenizer", "Temperature", "Perplexity"],
    effort: "Requires retraining. Takes months to become effective.",
    aiEngineer: false,
  },
  {
    num: "L4",
    name: "Systems / Infra Layer",
    job: "ML Systems Engineer",
    color: "#F59E0B",
    entry: "Deep systems programming background needed",
    what: "Below PyTorch. GPU memory management, kernel fusion, batching strategies, KV-cache optimization, serving infrastructure for inference at scale.",
    how: "Writing custom CUDA/Triton kernels, optimizing vLLM configurations, implementing continuous batching, quantization (GPTQ, AWQ), speculative decoding.",
    tools: ["CUDA", "Triton", "vLLM", "TensorRT", "DeepSpeed", "Flash Attention"],
    terms: ["KV Cache", "Quantization", "Continuous Batching", "Memory Bandwidth"],
    effort: "Highly specialized. PhD-level systems knowledge common.",
    aiEngineer: false,
  },
  {
    num: "L5",
    name: "Hardware Layer",
    job: "Hardware / Infrastructure Architect",
    color: "#6B7280",
    entry: "Infrastructure and hardware specialization",
    what: "GPU architecture, VRAM capacity, bandwidth, interconnect topology (NVLink, InfiniBand). Training cluster design, cost modeling.",
    how: "Selecting GPU types (H100, A100, MI300X), designing distributed training topologies, estimating compute budgets, negotiating cloud contracts.",
    tools: ["H100 / A100", "NVLink", "InfiniBand", "Kubernetes", "Ray"],
    terms: ["VRAM", "Memory Bandwidth", "Interconnect", "FLOPs", "Tensor Parallelism"],
    effort: "Rare specialization. Usually inside cloud providers or frontier labs.",
    aiEngineer: false,
  },
];

const CAREER_MAPPINGS = [
  { from: "You know React/Next.js", lands: "L1 — Ship AI-powered interfaces today", color: "#EC4899" },
  { from: "You know Python + APIs", lands: "L2 — AI Engineering (the target zone)", color: "#00FF88" },
  { from: "You know ML theory + Python", lands: "L3 — Fine-tune and evaluate models", color: "#8B5CF6" },
  { from: "You know C++ / systems", lands: "L4 — Optimize inference infra", color: "#F59E0B" },
  { from: "You know HW / VLSI", lands: "L5 — Design training clusters", color: "#6B7280" },
];

// ─── CODE LAB DATA ────────────────────────────────────────────────────────────
const CODE_SESSIONS = [
  {
    num: "01",
    title: "Hello, Foundation Model",
    color: "#00FF88",
    desc: "Your first API call. Understand the request/response structure, token counting, and what a system prompt actually does.",
    concepts: ["API key setup", "Messages array structure", "System vs user role", "Token estimation", "Model selection"],
    preview: `import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    system="You are a senior engineer.",
    messages=[{"role": "user", "content": "Explain RAG in one paragraph."}]
)

print(message.content[0].text)`,
  },
  {
    num: "02",
    title: "Prompt Engineering",
    color: "#F59E0B",
    desc: "The most underrated engineering skill in AI. We'll explore system prompts, few-shot examples, chain-of-thought, and output structuring.",
    concepts: ["Zero-shot vs few-shot", "Chain-of-thought", "Structured output (JSON)", "Role prompting", "Prompt injection basics"],
    preview: `# Structured output via XML tags
system = """Extract entities. Return JSON:
{"entities": [{"text": str, "type": str}]}"""

message = client.messages.create(
    model="claude-opus-4-5",
    system=system,
    messages=[{"role": "user", "content": doc}]
)`,
  },
  {
    num: "03",
    title: "Embeddings + RAG",
    color: "#9D71EA",
    desc: "Ground the model in your data. Build a retrieval pipeline: chunk documents, embed them, store in a vector DB, retrieve at query time.",
    concepts: ["Embedding model", "Chunking strategy", "Vector similarity search", "Context injection", "Semantic vs keyword search"],
    preview: `# Embed + store
texts = chunk_document(doc)
embeddings = embed_batch(texts)  # 1536-dim vectors
vector_db.upsert(zip(ids, embeddings, texts))

# At query time
query_vec = embed(user_query)
results = vector_db.query(query_vec, top_k=5)
context = "\\n".join(results)
# → inject context into prompt`,
  },
  {
    num: "04",
    title: "Tool Calling + Agents",
    color: "#EC4899",
    desc: "Give the model hands. Define tools, let the model decide when to call them, handle results, and build a basic ReAct loop.",
    concepts: ["Tool definition schema", "Function calling", "Tool result injection", "ReAct pattern", "Agent loop"],
    preview: `tools = [{
    "name": "search_docs",
    "description": "Search company documentation",
    "input_schema": {
        "type": "object",
        "properties": {"query": {"type": "string"}},
        "required": ["query"]
    }
}]

response = client.messages.create(
    model="claude-opus-4-5",
    tools=tools, messages=[...]
)
# If response.stop_reason == "tool_use" → call tool → loop`,
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

function Landmark({ show }) {
  if (!show) return null;
  return (
    <span style={{
      fontSize: "9px", fontWeight: "900", letterSpacing: "2px",
      padding: "2px 8px", borderRadius: "3px",
      background: "#FF6B3520", border: "1px solid #FF6B3560",
      color: "#FF6B35", marginLeft: "8px",
    }}>LANDMARK</span>
  );
}

// ─── CHAPTER 1: THE STORY ─────────────────────────────────────────────────────

const TRACK_LABELS = { cv: "Computer Vision", nlp: "NLP", rl: "Reinforcement Learning", arch: "Architecture", multi: "Multimodal", bio: "Science / Bio", commercial: "Commercial", unified: "All Tracks" };

function StoryChapter() {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");

  const splitEvents = EVENTS.filter(e => ["cv","nlp","rl"].includes(e.track) && e.id !== "alphago");
  const unifiedBefore = EVENTS.filter(e => e.id === "dark-ages" || e.id === "imagenet");
  const alphago = EVENTS.find(e => e.id === "alphago");
  const merge = EVENTS.find(e => e.id === "transformer");
  const after = EVENTS.filter(e => ["bert-gpt","gpt3","clip-dalle","alphafold","chatgpt","agentic"].includes(e.id));

  const cvEvents = splitEvents.filter(e => e.track === "cv");
  const nlpEvents = splitEvents.filter(e => e.track === "nlp");

  return (
    <div>
      {/* Hook */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "3px", marginBottom: "12px" }}>CHAPTER 01 — THE STORY</div>
        <h2 style={{ fontSize: "26px", fontWeight: "900", color: "#FFF", marginBottom: "16px", lineHeight: 1.2 }}>
          It didn't start with ChatGPT.
        </h2>
        <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.8, maxWidth: "600px" }}>
          The path to the model in your API call took 70 years. Understanding that path is what separates engineers who build intelligently from those who build by accident.
        </p>
        <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.8, maxWidth: "600px", marginTop: "8px" }}>
          Follow the story. Every term you learn here maps directly to something you'll configure in code.
        </p>
      </div>

      {/* Phase 1: Unified (before the split) */}
      <EraLabel label="The Foundations" years="1950s–2011" color="#6B7280" note="Symbolic AI. No learning." />
      {unifiedBefore.map(e => (
        <EventCard key={e.id} event={e} expanded={expanded === e.id} onToggle={() => setExpanded(expanded === e.id ? null : e.id)} />
      ))}

      {/* Split visualization */}
      <div style={{ margin: "32px 0 8px", padding: "20px 24px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px" }}>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "2px", marginBottom: "10px" }}>2012–2016 — THE GREAT SPLIT</div>
        <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.6, margin: 0 }}>
          After AlexNet, deep learning explodes in two parallel universes.{" "}
          <span style={{ color: C.cv }}>Computer Vision</span> and <span style={{ color: C.nlp }}>NLP</span>{" "}
          have different architectures (CNNs vs RNNs/LSTMs), different conferences (CVPR vs ACL), different communities.
          A researcher in one barely reads papers from the other.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "8px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "700", color: C.cv, letterSpacing: "2px", marginBottom: "10px", textAlign: "center" }}>
            ◎ COMPUTER VISION TRACK
          </div>
          {cvEvents.map(e => (
            <EventCard key={e.id} event={e} expanded={expanded === e.id} onToggle={() => setExpanded(expanded === e.id ? null : e.id)} compact />
          ))}
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "700", color: C.nlp, letterSpacing: "2px", marginBottom: "10px", textAlign: "center" }}>
            ◎ NLP TRACK
          </div>
          {nlpEvents.map(e => (
            <EventCard key={e.id} event={e} expanded={expanded === e.id} onToggle={() => setExpanded(expanded === e.id ? null : e.id)} compact />
          ))}
        </div>
      </div>

      {/* AlphaGo - spans full width, separate track */}
      {alphago && (
        <>
          <div style={{ textAlign: "center", fontSize: "11px", color: C.rl, letterSpacing: "2px", margin: "16px 0 8px" }}>◎ DEEPMIND / REINFORCEMENT LEARNING</div>
          <EventCard event={alphago} expanded={expanded === alphago.id} onToggle={() => setExpanded(expanded === alphago.id ? null : alphago.id)} />
        </>
      )}

      {/* Merge point */}
      <div style={{ textAlign: "center", margin: "32px 0 8px" }}>
        <div style={{ display: "inline-block", fontSize: "11px", color: "#6B7280", marginBottom: "8px", letterSpacing: "2px" }}>↓ MERGE POINT ↓</div>
      </div>

      <EraLabel label="The Unification" years="2017" color={C.arch} note="One architecture to rule them all." />
      {merge && <EventCard event={merge} expanded={expanded === merge.id} onToggle={() => setExpanded(expanded === merge.id ? null : merge.id)} />}

      <EraLabel label="The Scaling Era" years="2018–2021" color={C.nlp} note="Bigger = smarter. Scaling laws emerge." />
      {after.slice(0, 3).map(e => (
        <EventCard key={e.id} event={e} expanded={expanded === e.id} onToggle={() => setExpanded(expanded === e.id ? null : e.id)} />
      ))}

      <EraLabel label="The Explosion" years="2022" color={C.commercial} note="AlphaFold + ChatGPT. The world changes." />
      {after.slice(3, 5).map(e => (
        <EventCard key={e.id} event={e} expanded={expanded === e.id} onToggle={() => setExpanded(expanded === e.id ? null : e.id)} />
      ))}

      <EraLabel label="The Agentic Wave" years="2023–Now" color={C.accent} note="You are here. Build." />
      {after.slice(5).map(e => (
        <EventCard key={e.id} event={e} expanded={expanded === e.id} onToggle={() => setExpanded(expanded === e.id ? null : e.id)} />
      ))}
    </div>
  );
}

function EraLabel({ label, years, color, note }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "28px 0 12px" }}>
      <div style={{ flex: 1, height: "1px", background: color + "30" }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: "800", color, letterSpacing: "2px" }}>{label.toUpperCase()}</div>
        <div style={{ fontSize: "10px", color: C.muted, marginTop: "2px" }}>{years} · {note}</div>
      </div>
      <div style={{ flex: 1, height: "1px", background: color + "30" }} />
    </div>
  );
}

function EventCard({ event: e, expanded, onToggle, compact }) {
  return (
    <div
      onClick={onToggle}
      style={{
        marginBottom: "6px", background: expanded ? C.surface2 : C.surface,
        border: `1px solid ${expanded ? e.color + "50" : C.border}`,
        borderLeft: `4px solid ${e.color}`,
        borderRadius: "8px", cursor: "pointer", transition: "all 0.15s",
      }}
    >
      <div style={{ padding: compact ? "12px 14px" : "16px 18px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: e.color, fontFamily: "monospace" }}>{e.year}</span>
            <span style={{ fontSize: compact ? "14px" : "16px", fontWeight: "800", color: "#FFF" }}>{e.title}</span>
            <Landmark show={e.landmark} />
          </div>
          <div style={{ fontSize: "12px", color: C.muted, fontStyle: "italic" }}>{e.tagline}</div>
        </div>
        <span style={{ color: C.dim, fontSize: "11px", flexShrink: 0, marginTop: "2px" }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div style={{ padding: "0 18px 20px" }}>
          <p style={{ fontSize: "14px", color: "#AAA", lineHeight: "1.8", whiteSpace: "pre-line", borderLeft: `2px solid ${e.color}40`, paddingLeft: "14px", margin: "0 0 16px" }}>
            {e.body}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            <div style={{ padding: "12px", background: "#0A0A12", border: `1px solid ${C.border}`, borderRadius: "6px" }}>
              <div style={{ fontSize: "10px", color: e.color, letterSpacing: "2px", marginBottom: "6px" }}>TECHNICAL</div>
              <div style={{ fontSize: "12px", color: "#888", lineHeight: 1.6 }}>{e.technical}</div>
            </div>
            <div style={{ padding: "12px", background: "#0A0A12", border: `1px solid ${C.border}`, borderRadius: "6px" }}>
              <div style={{ fontSize: "10px", color: "#FF6B35", letterSpacing: "2px", marginBottom: "6px" }}>COMMERCIAL</div>
              <div style={{ fontSize: "12px", color: "#888", lineHeight: 1.6 }}>{e.commercial}</div>
            </div>
          </div>
          <div style={{ padding: "10px 14px", background: e.color + "08", border: `1px solid ${e.color}25`, borderRadius: "6px", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", color: e.color, fontWeight: "700" }}>⚡ KEY INSIGHT: </span>
            <span style={{ fontSize: "12px", color: "#999" }}>{e.insight}</span>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {e.terms.map(t => <Tag key={t} text={t} color={e.color} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CHAPTER 2: THE STACK ─────────────────────────────────────────────────────

function StackChapter() {
  const [active, setActive] = useState("L2");
  const activeLayer = STACK_LAYERS.find(l => l.num === active);

  return (
    <div>
      {/* Definition */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "3px", marginBottom: "12px" }}>CHAPTER 02 — THE MODERN AI STACK</div>
        <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#FFF", marginBottom: "16px", lineHeight: 1.2 }}>
          You don't need to be an ML researcher.
        </h2>
        <div style={{
          padding: "20px 24px", background: C.surface, border: `1px solid ${C.accent}30`,
          borderLeft: `4px solid ${C.accent}`, borderRadius: "8px", marginBottom: "20px",
        }}>
          <div style={{ fontSize: "10px", color: C.accent, letterSpacing: "2px", marginBottom: "8px" }}>FROM CHIP HUYEN — "AI ENGINEERING" (2024)</div>
          <p style={{ fontSize: "16px", color: "#DDD", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
            "AI Engineering is the practice of building applications on top of foundation models."
          </p>
          <p style={{ fontSize: "13px", color: C.muted, marginTop: "10px", margin: "10px 0 0" }}>
            The model already exists. The training is done. Your job is to <strong style={{ color: "#FFF" }}>use</strong> it to build products — not to understand every weight in the network.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {[
            { label: "ML Researcher", desc: "Invents new architectures. Writes papers. Requires PhD or equivalent.", color: "#6B7280" },
            { label: "ML Engineer", desc: "Fine-tunes models, builds training pipelines. Python + PyTorch + ML theory.", color: "#8B5CF6" },
            { label: "AI Engineer", desc: "Uses foundation models to build apps. Your existing skills + API + orchestration.", color: C.accent },
          ].map(role => (
            <div key={role.label} style={{
              padding: "14px 16px", background: C.surface,
              border: `1px solid ${role.color}30`, borderTop: `3px solid ${role.color}`,
              borderRadius: "8px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: role.color, marginBottom: "6px" }}>{role.label}</div>
              <div style={{ fontSize: "12px", color: C.muted, lineHeight: 1.5 }}>{role.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stack layers */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "2px", marginBottom: "14px" }}>THE FIVE LAYERS — CLICK ANY TO EXPLORE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {STACK_LAYERS.map((layer) => (
            <button
              key={layer.num}
              onClick={() => setActive(active === layer.num ? null : layer.num)}
              style={{
                textAlign: "left", background: active === layer.num ? "#111120" : C.surface,
                border: `1px solid ${active === layer.num ? layer.color + "60" : C.border}`,
                borderLeft: `5px solid ${layer.color}`,
                borderRadius: "8px", cursor: "pointer", transition: "all 0.12s",
                padding: 0,
              }}
            >
              <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{
                  fontSize: "11px", fontWeight: "900", letterSpacing: "1px", color: layer.color,
                  background: layer.color + "15", padding: "3px 8px", borderRadius: "3px", fontFamily: "monospace",
                }}>{layer.num}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#FFF" }}>{layer.name}</div>
                  <div style={{ fontSize: "11px", color: layer.aiEngineer ? layer.color : C.muted, marginTop: "2px" }}>{layer.job}</div>
                </div>
                {layer.aiEngineer && (
                  <span style={{
                    fontSize: "9px", fontWeight: "900", color: layer.color, letterSpacing: "1.5px",
                    background: layer.color + "15", border: `1px solid ${layer.color}30`,
                    padding: "3px 8px", borderRadius: "3px",
                  }}>TARGET ZONE</span>
                )}
                <span style={{ color: C.dim, fontSize: "11px" }}>{active === layer.num ? "▲" : "▼"}</span>
              </div>

              {active === layer.num && (
                <div style={{ padding: "0 18px 20px", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "14px" }}>
                    <div>
                      <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "1.5px", marginBottom: "6px" }}>WHAT HAPPENS HERE</div>
                      <div style={{ fontSize: "13px", color: "#AAA", lineHeight: 1.6 }}>{layer.what}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "1.5px", marginBottom: "6px" }}>HOW YOU OPERATE</div>
                      <div style={{ fontSize: "13px", color: "#AAA", lineHeight: 1.6 }}>{layer.how}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "1.5px", marginBottom: "8px" }}>TOOLS</div>
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        {layer.tools.map(t => <Tag key={t} text={t} color={layer.color} />)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "1.5px", marginBottom: "8px" }}>KEY TERMS</div>
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        {layer.terms.map(t => <Tag key={t} text={t} color="#666" />)}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    marginTop: "14px", padding: "10px 14px",
                    background: layer.color + "08", border: `1px solid ${layer.color}25`,
                    borderRadius: "6px", fontSize: "12px", color: layer.color,
                  }}>
                    {layer.aiEngineer ? "⭐" : "→"} {layer.effort}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Where you fit */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "2px", marginBottom: "14px" }}>WHERE DO YOU FIT?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {CAREER_MAPPINGS.map(m => (
            <div key={m.from} style={{
              display: "flex", alignItems: "center", gap: "16px",
              padding: "12px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px",
            }}>
              <div style={{ fontSize: "13px", color: "#AAA", flex: 1 }}>{m.from}</div>
              <div style={{ fontSize: "10px", color: C.muted }}>→</div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: m.color }}>{m.lands}</div>
            </div>
          ))}
        </div>
      </div>

      {/* The AI Engineering Loop */}
      <div style={{ padding: "24px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px" }}>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "2px", marginBottom: "14px" }}>THE AI ENGINEERING LOOP</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0", overflowX: "auto" }}>
          {[
            { step: "User Intent", color: "#EC4899" },
            { step: "Prompt Design", color: "#F59E0B" },
            { step: "Retrieval (RAG)", color: "#3B82F6" },
            { step: "API Call", color: C.accent },
            { step: "Parse Output", color: "#9D71EA" },
            { step: "Eval + Improve", color: "#FF6B35" },
          ].map((s, i, arr) => (
            <div key={s.step} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                padding: "8px 12px", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap",
                background: s.color + "12", border: `1px solid ${s.color}30`,
                color: s.color,
                borderRadius: i === 0 ? "6px 0 0 6px" : i === arr.length - 1 ? "0 6px 6px 0" : "0",
              }}>{s.step}</div>
              {i < arr.length - 1 && <div style={{ fontSize: "10px", color: C.dim }}>→</div>}
            </div>
          ))}
          <div style={{ fontSize: "10px", color: C.dim, marginLeft: "4px" }}>↺</div>
        </div>
        <p style={{ fontSize: "12px", color: C.muted, marginTop: "12px", marginBottom: 0, lineHeight: 1.6 }}>
          This loop is your job. Not architecture design — iteration on prompts, retrieval quality, output parsing, and evaluation. This is engineering, not research.
        </p>
      </div>
    </div>
  );
}

// ─── CHAPTER 3: CODE LAB ──────────────────────────────────────────────────────

function CodeChapter() {
  const [activeSession, setActiveSession] = useState(0);
  const s = CODE_SESSIONS[activeSession];

  return (
    <div>
      <div style={{ marginBottom: "36px" }}>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "3px", marginBottom: "12px" }}>CHAPTER 03 — CODE LAB</div>
        <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#FFF", marginBottom: "12px", lineHeight: 1.2 }}>
          Live session. Bring your laptop.
        </h2>
        <p style={{ fontSize: "14px", color: C.muted, lineHeight: 1.7, maxWidth: "580px" }}>
          Theory is Chapter 1 and 2. This is where you write code. Four sessions, each building on the last — from your first API call to a working agent.
        </p>
      </div>

      {/* Setup */}
      <div style={{ marginBottom: "28px", padding: "20px 24px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px" }}>
        <div style={{ fontSize: "11px", color: C.accent, letterSpacing: "2px", marginBottom: "12px" }}>SETUP — DO THIS BEFORE THE SESSION</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[
            { step: "1", text: "Create free Anthropic account → console.anthropic.com", done: false },
            { step: "2", text: "Generate API key and save it securely", done: false },
            { step: "3", text: "pip install anthropic python-dotenv", done: false },
            { step: "4", text: "Clone the course repo (link shared in session)", done: false },
          ].map(s => (
            <div key={s.step} style={{ display: "flex", gap: "10px", padding: "10px 12px", background: "#0A0A12", border: `1px solid ${C.border}`, borderRadius: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: "900", color: C.accent, fontFamily: "monospace", minWidth: "16px" }}>{s.step}</span>
              <span style={{ fontSize: "12px", color: "#AAA", lineHeight: 1.5 }}>{s.text}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "12px", padding: "10px 14px", background: "#0A120A", border: "1px solid #1A301A", borderRadius: "6px", fontFamily: "monospace", fontSize: "12px", color: "#77BB77" }}>
          $ python -c "import anthropic; print('✓ Ready')"
        </div>
      </div>

      {/* Session selector */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
        {CODE_SESSIONS.map((session, i) => (
          <button
            key={session.num}
            onClick={() => setActiveSession(i)}
            style={{
              padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "700",
              background: activeSession === i ? session.color + "20" : "transparent",
              border: `1px solid ${activeSession === i ? session.color + "60" : C.border}`,
              color: activeSession === i ? session.color : C.muted,
            }}
          >{session.num} — {session.title}</button>
        ))}
      </div>

      {/* Active session */}
      <div style={{ background: C.surface, border: `1px solid ${s.color}30`, borderTop: `3px solid ${s.color}`, borderRadius: "8px", padding: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#FFF", marginBottom: "8px" }}>Session {s.num}: {s.title}</h3>
        <p style={{ fontSize: "14px", color: C.muted, marginBottom: "20px", lineHeight: 1.6 }}>{s.desc}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "2px", marginBottom: "10px" }}>CONCEPTS COVERED</div>
            {s.concepts.map(c => (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
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
            }}>{s.preview}</pre>
          </div>
        </div>
      </div>

      {/* Course outcomes */}
      <div style={{ marginTop: "28px", padding: "24px", background: "#070710", border: `1px solid ${C.border}`, borderRadius: "10px" }}>
        <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "2px", marginBottom: "14px" }}>BY THE END OF THIS COURSE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[
            { item: "You understand the full AI stack from GPU to product", color: C.accent },
            { item: "You can call any foundation model API with confidence", color: C.accent },
            { item: "You can build a working RAG pipeline from scratch", color: C.accent },
            { item: "You can define and run a tool-calling agent loop", color: C.accent },
            { item: "You can evaluate your AI features systematically", color: C.accent },
            { item: "You know which layer of the stack your work lives in", color: C.accent },
          ].map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "6px" }}>
              <span style={{ color: o.color, fontSize: "14px", flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: "13px", color: "#AAA", lineHeight: 1.5 }}>{o.item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "story", label: "01 — The Story", sub: "70 years → today", icon: "📜", color: "#F59E0B" },
  { id: "stack", label: "02 — The Stack", sub: "5 layers, your role", icon: "🔧", color: C.accent },
  { id: "code", label: "03 — Code Lab", sub: "4 live sessions", icon: "⌨️", color: "#EC4899" },
];

export default function Lecture1Enhanced() {
  const [tab, setTab] = useState("story");

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
          <div style={{ fontSize: "17px", fontWeight: "900", color: "#FFF", letterSpacing: "-0.3px" }}>Lecture 1: The Landscape</div>
        </div>
        <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: C.dim }}>
          <span>90 min</span>
          <span>·</span>
          <span>15+ terms</span>
          <span>·</span>
          <span>5 stack layers</span>
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
        {tab === "story" && <StoryChapter />}
        {tab === "stack" && <StackChapter />}
        {tab === "code" && <CodeChapter />}
      </div>
    </div>
  );
}
