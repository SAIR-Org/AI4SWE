"""
Generates lecture1.excalidraw from the lecture content.

Layout: 3 frames side by side (Story | Stack | Demo), each 1400px wide x variable height.
Each frame contains a hero card, content cards, and a sidebar panel.
"""

import json
import random

# ── data ──────────────────────────────────────────────────────────────────────

TIMELINE = [
    ("1950s–1980s",       "AI begins as a reasoning project",              "Rules over learning",         "Early AI was dominated by symbolic methods, search, and expert systems. The core idea: encode enough rules, machines can appear intelligent."),
    ("1990s–early 2010s", "The field splits into subfields",               "Vision and language diverge", "Before transformers, computer vision and NLP felt like different worlds. Vision pushed by CNNs; NLP by n-grams, embeddings, RNNs."),
    ("2012",              "AlexNet turns deep learning into the main event","Perception gets real",        "AlexNet's ImageNet result proved that data + GPUs + deep nets beat years of hand-engineered features."),
    ("2016",              "AlphaGo expands the public imagination",        "Learning plus search",        "DeepMind combined deep learning, RL, and search to beat Lee Sedol — moving AI toward planning under uncertainty."),
    ("2017–2020",         "Transformers unify the stack",                  "One architecture, many tasks","The transformer scaled extremely well and became the backbone of modern language systems."),
    ("2020–2021",         "AlphaFold shows real scientific leverage",      "Deep learning enters science","AlphaFold proved model-driven systems could accelerate serious scientific work far outside chat interfaces."),
    ("2022",              "ChatGPT becomes the commercial inflection point","The interface reaches everyone","ChatGPT was not the first LLM, but the product event that made LLMs legible to the market."),
    ("2023 onward",       "The wave shifts from generation to action",     "From GenAI to agents",        "Now the question is whether developers can wrap models with tools, memory, retrieval, and workflows to build reliable agentic systems."),
]

TERMS = [
    ("symbolic AI",            "Rule-based reasoning systems"),
    ("deep learning",          "Neural networks trained from data"),
    ("computer vision",        "Learning from images and video"),
    ("NLP",                    "Learning from and generating language"),
    ("transformers",           "Attention-based architecture behind modern LLMs"),
    ("foundation models",      "Large pretrained models reused across tasks"),
    ("generative AI",          "Models that generate text, image, audio, code"),
    ("agents",                 "Systems that use models to take multi-step actions"),
]

LAYERS = [
    ("L1", "Product layer",           "ChatGPT, Claude, Cursor, Perplexity",          "UX, workflow design, trust, latency masking, product packaging."),
    ("L2", "Model API layer",         "OpenAI API, Anthropic API, Gemini, Groq",       "Prompts, parameters, structured outputs, tool calls, retries, cost control."),
    ("L3", "Orchestration layer",     "LangChain, LlamaIndex, DSPy, agent runtimes",  "Retrieval, memory, routing, evaluation, guardrails, multi-step flows."),
    ("L4", "Model operations layer",  "Hugging Face, tokenizers, inference servers",   "Serving, adapters, benchmarking, checkpoint handling, data-aware iteration."),
    ("L5", "Training framework layer","PyTorch, JAX, distributed training stacks",     "Architectures, optimization, pretraining, finetuning, large-scale data pipelines."),
    ("L6", "Systems layer",           "CUDA, Triton, C++, custom kernels",            "Hardware-adjacent: throughput, memory layout, quantization, scheduling."),
]

ROLES = [
    ("Application engineer", "Builds product features, integrates APIs, owns UX and reliability."),
    ("AI engineer",          "Builds model-powered systems with retrieval, tools, orchestration, evals."),
    ("ML engineer",          "Owns serving, training pipelines, fine-tuning, production model infra."),
    ("Research engineer",    "Works on architectures, experiments, scaling, novel model capability."),
]

DEMOS = [
    ("Step 1",   "L1 → L2",   "01_the_ui_is_just_an_api_call.py", "Demystify the product",   "Show that chat UIs are wrappers around a model API call."),
    ("Step 2",   "L2",        "02_api_parms.py",                  "Expose the control surface","Show how system prompts, temperature, max tokens change behavior."),
    ("Step 3",   "L2.5",      "04_tokens_are_not_words.py",       "Explain the cost unit",    "Show that context windows and billing are token-based, not word-based."),
    ("Optional", "L2 → L3",   "bonus_api.py",                     "Swap the backend",         "Show that vendors change but the orchestration pattern remains."),
]

TALKING_POINTS = [
    "Do not teach everything. Teach one durable mental model.",
    "Every polished AI product is still requests, responses, context, and system design.",
    "Agents are not magic. They are software systems built around model calls.",
]

# ── colours ───────────────────────────────────────────────────────────────────

C = {
    "bg":          "#0D0E14",
    "card":        "#13141A",
    "border":      "#2A2B33",
    "white":       "#FFF7EC",
    "dim":         "#9C8E7A",
    "gold":        "#F0C674",
    "green":       "#9EE6BE",
    "orange":      "#FFB48A",
    "text":        "#D9D1C4",
    "frame_story": "#F0C674",
    "frame_stack": "#9EE6BE",
    "frame_demo":  "#FFB48A",
}

# ── id generator ──────────────────────────────────────────────────────────────

_counter = [1000]

def new_id():
    _counter[0] += 1
    return f"el_{_counter[0]:06d}"

def seed():
    return random.randint(100000, 999999)

# ── base element factories ────────────────────────────────────────────────────

def rect(x, y, w, h, bg=C["card"], stroke=C["border"], radius=12, opacity=100):
    return {
        "id": new_id(), "type": "rectangle",
        "x": x, "y": y, "width": w, "height": h,
        "angle": 0,
        "strokeColor": stroke, "backgroundColor": bg,
        "fillStyle": "solid", "strokeWidth": 1, "strokeStyle": "solid",
        "roughness": 0, "opacity": opacity,
        "groupIds": [], "frameId": None, "index": "a0",
        "roundness": {"type": 3, "value": radius},
        "seed": seed(), "version": 1, "versionNonce": seed(),
        "isDeleted": False, "boundElements": [], "updated": 1,
        "link": None, "locked": False,
    }

def text(x, y, content, size=14, color=C["white"], bold=False, width=None, align="left"):
    w = width or max(len(content) * size * 0.62, 120)
    return {
        "id": new_id(), "type": "text",
        "x": x, "y": y, "width": w, "height": size * 1.4,
        "angle": 0,
        "strokeColor": "transparent", "backgroundColor": "transparent",
        "fillStyle": "solid", "strokeWidth": 1, "strokeStyle": "solid",
        "roughness": 0, "opacity": 100,
        "groupIds": [], "frameId": None, "index": "a0",
        "roundness": None,
        "seed": seed(), "version": 1, "versionNonce": seed(),
        "isDeleted": False, "boundElements": [], "updated": 1,
        "link": None, "locked": False,
        "text": content,
        "fontSize": size,
        "fontFamily": 3,
        "textAlign": align,
        "verticalAlign": "top",
        "containerId": None,
        "originalText": content,
        "lineHeight": 1.4,
        "autoResize": True,
        "fontWeight": "bold" if bold else "normal",
        "color": color,
        "strokeSharpness": "sharp",
    }

def frame(x, y, w, h, label, color):
    return {
        "id": new_id(), "type": "frame",
        "x": x, "y": y, "width": w, "height": h,
        "angle": 0,
        "strokeColor": color, "backgroundColor": "transparent",
        "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
        "roughness": 0, "opacity": 100,
        "groupIds": [], "frameId": None, "index": "a0",
        "roundness": None,
        "seed": seed(), "version": 1, "versionNonce": seed(),
        "isDeleted": False, "boundElements": [], "updated": 1,
        "link": None, "locked": False,
        "name": label,
    }

def wrap(s, max_chars=55):
    """Naïve word-wrap into \n-separated lines."""
    words = s.split()
    lines, cur = [], []
    for w in words:
        if sum(len(x) + 1 for x in cur) + len(w) > max_chars and cur:
            lines.append(" ".join(cur))
            cur = [w]
        else:
            cur.append(w)
    if cur:
        lines.append(" ".join(cur))
    return "\n".join(lines)

# ── card builders ─────────────────────────────────────────────────────────────

PAD = 20          # inner card padding
CARD_W = 860      # main column card width
SIDE_W = 460      # sidebar card width
FRAME_W = 1400    # frame total width
GAP = 16          # gap between cards

def hero_card(ox, oy, eyebrow, headline, subtitle, accent):
    els = []
    h = 200
    els.append(rect(ox, oy, FRAME_W - PAD * 2, h, stroke=accent, radius=20))
    els.append(text(ox + PAD, oy + PAD,      eyebrow.upper(), 10, accent, bold=True,  width=300))
    els.append(text(ox + PAD, oy + PAD + 22, headline,        28, C["white"], bold=True, width=FRAME_W - PAD * 4))
    sub_wrapped = wrap(subtitle, 90)
    els.append(text(ox + PAD, oy + PAD + 60, sub_wrapped,     14, C["text"], width=FRAME_W - PAD * 4))
    return els, oy + h + GAP

def timeline_card(ox, oy, idx, era, title, signal, body, accent):
    els = []
    body_w = wrap(body, 62)
    body_lines = body_w.count("\n") + 1
    h = 30 + 24 + 20 + body_lines * 22 + PAD * 2
    els.append(rect(ox, oy, CARD_W, h, radius=14))
    els.append(text(ox + PAD,       oy + PAD,       era,                10, C["dim"],  width=200))
    els.append(text(ox + PAD + 220, oy + PAD,       f"{idx:02d} · {signal}", 10, accent, bold=True, width=300))
    els.append(text(ox + PAD,       oy + PAD + 20,  title,              18, C["white"], bold=True, width=CARD_W - PAD * 2))
    els.append(text(ox + PAD,       oy + PAD + 46,  body_w,             13, C["text"],  width=CARD_W - PAD * 2))
    return els, oy + h + GAP

def stack_layer_card(ox, oy, layer_id, name, examples, fit):
    els = []
    fit_w = wrap(fit, 62)
    fit_lines = fit_w.count("\n") + 1
    h = 24 + 18 + 20 + fit_lines * 20 + PAD * 2
    els.append(rect(ox, oy, CARD_W, h, radius=14))
    badge_size = 54
    els.append(rect(ox + PAD, oy + PAD, badge_size, badge_size, bg="#0D2218", stroke="#3DAA72", radius=10))
    els.append(text(ox + PAD + 12,           oy + PAD + 15,     layer_id,  16, C["green"], bold=True, width=badge_size))
    els.append(text(ox + PAD + badge_size + 14, oy + PAD,       name,      18, C["white"], bold=True, width=CARD_W - badge_size - PAD * 3))
    els.append(text(ox + PAD + badge_size + 14, oy + PAD + 24,  examples,  12, "#8DC1A7",  width=CARD_W - badge_size - PAD * 3))
    els.append(text(ox + PAD + badge_size + 14, oy + PAD + 44,  fit_w,     13, C["text"],  width=CARD_W - badge_size - PAD * 3))
    return els, oy + h + GAP

def demo_step_card(ox, oy, step, layer, filename, title, point, accent):
    els = []
    point_w = wrap(point, 62)
    point_lines = point_w.count("\n") + 1
    h = 24 + 24 + 20 + 20 + point_lines * 20 + PAD * 2
    els.append(rect(ox, oy, CARD_W, h, radius=14))
    els.append(text(ox + PAD,       oy + PAD,      step.upper(), 10, accent, bold=True, width=200))
    els.append(text(ox + PAD + 180, oy + PAD,      layer,        10, C["dim"],          width=200))
    els.append(text(ox + PAD,       oy + PAD + 20, title,        18, C["white"], bold=True, width=CARD_W - PAD * 2))
    els.append(text(ox + PAD,       oy + PAD + 44, filename,     12, accent,     width=CARD_W - PAD * 2))
    els.append(text(ox + PAD,       oy + PAD + 64, point_w,      13, C["text"],  width=CARD_W - PAD * 2))
    return els, oy + h + GAP

def sidebar_card(ox, oy, eyebrow, items, accent, item_is_tuple=False):
    """items: list of strings or (title, body) tuples."""
    els = []
    content_lines = 0
    for item in items:
        if item_is_tuple:
            t_lines = 1
            b_lines = wrap(item[1], 38).count("\n") + 1
            content_lines += t_lines + b_lines + 1
        else:
            content_lines += wrap(item, 38).count("\n") + 1 + 1
    h = PAD * 2 + 18 + 12 + content_lines * 18
    els.append(rect(ox, oy, SIDE_W, h, radius=14))
    els.append(text(ox + PAD, oy + PAD, eyebrow.upper(), 10, accent, bold=True, width=SIDE_W - PAD * 2))
    cy = oy + PAD + 22
    for item in items:
        if item_is_tuple:
            title, body = item
            els.append(text(ox + PAD, cy, title, 13, C["white"], bold=True, width=SIDE_W - PAD * 2))
            cy += 18
            bw = wrap(body, 38)
            els.append(text(ox + PAD, cy, bw, 12, C["text"], width=SIDE_W - PAD * 2))
            cy += (bw.count("\n") + 1) * 16 + 10
        else:
            iw = wrap(item, 38)
            els.append(rect(ox + PAD, cy - 4, SIDE_W - PAD * 2, (iw.count("\n") + 1) * 18 + 14,
                            bg="#FFFFFF0D", stroke="#FFFFFF12", radius=8))
            els.append(text(ox + PAD + 10, cy, iw, 13, C["white"], width=SIDE_W - PAD * 2 - 20))
            cy += (iw.count("\n") + 1) * 18 + 20
    return els, oy + h + GAP

# ── frame builders ────────────────────────────────────────────────────────────

FX = {1: 40, 2: 1500, 3: 2960}   # frame x offsets

def build_story_frame():
    els = []
    ox, oy = FX[1], 40
    acc = C["frame_story"]

    # hero
    e, cy = hero_card(ox + PAD, oy + PAD,
                      "Part 1 · Story",
                      "The story of AI is a story of\nchanging capability",
                      "Tell this as a movement from rules → perception → generation → action. Technical, commercially relevant, easy to remember.",
                      acc)
    els += e

    main_x = ox + PAD
    side_x = ox + PAD + CARD_W + GAP

    # timeline cards
    for i, (era, title, signal, body) in enumerate(TIMELINE):
        e, cy = timeline_card(main_x, cy, i + 1, era, title, signal, body, acc)
        els += e

    # sidebar: speaker flow
    speaker_flow = [
        "Start with a simple contrast: old AI tried to encode intelligence, modern AI learns it from data.",
        "AlexNet made deep learning credible. AlphaGo made it undeniable. ChatGPT made it usable by everyone.",
        "Close on the present: gravity has shifted to productization, orchestration, and agents.",
    ]
    side_y = oy + PAD + 200 + GAP
    e, side_y = sidebar_card(side_x, side_y, "Speaker Thread", speaker_flow, acc)
    els += e

    # sidebar: terms
    e, side_y = sidebar_card(side_x, side_y, "Correct Terms", TERMS, acc, item_is_tuple=True)
    els += e

    total_h = max(cy, side_y) - oy + PAD * 2
    fr = frame(ox, oy, FRAME_W, total_h, "01 · Story — AI History", acc)
    return [fr] + els, total_h

def build_stack_frame():
    els = []
    ox, oy = FX[2], 40
    acc = C["frame_stack"]

    e, cy = hero_card(ox + PAD, oy + PAD,
                      "Part 2 · Stack",
                      "Most developers should move up the\nstack, not down to kernels",
                      "AI research builds better models. AI engineering builds better applications with models. Strong SWEs already have a place here.",
                      acc)
    els += e

    main_x = ox + PAD
    side_x = ox + PAD + CARD_W + GAP

    for lid, name, examples, fit in LAYERS:
        e, cy = stack_layer_card(main_x, cy, lid, name, examples, fit)
        els += e

    side_y = oy + PAD + 200 + GAP
    e, side_y = sidebar_card(side_x, side_y, "Lecture Message",
                              ["You do not need a career reset. Your leverage is still engineering judgment: product design, APIs, backend reliability, data contracts, testing, observability, and user trust. The model is a new dependency, not a replacement."],
                              acc)
    els += e

    e, side_y = sidebar_card(side_x, side_y, "Role Map", ROLES, acc, item_is_tuple=True)
    els += e

    total_h = max(cy, side_y) - oy + PAD * 2
    fr = frame(ox, oy, FRAME_W, total_h, "02 · Stack — Where Devs Fit", acc)
    return [fr] + els, total_h

def build_demo_frame():
    els = []
    ox, oy = FX[3], 40
    acc = C["frame_demo"]

    e, cy = hero_card(ox + PAD, oy + PAD,
                      "Part 3 · Demo",
                      "Bridge the lecture to code\nin three moves",
                      "The demo converts abstraction into engineering instinct: the UI is just an API call, then the API exposes control, then tokens explain cost and limits.",
                      acc)
    els += e

    main_x = ox + PAD
    side_x = ox + PAD + CARD_W + GAP

    for step, layer, filename, title, point in DEMOS:
        e, cy = demo_step_card(main_x, cy, step, layer, filename, title, point, acc)
        els += e

    side_y = oy + PAD + 200 + GAP
    e, side_y = sidebar_card(side_x, side_y, "Talking Points", TALKING_POINTS, acc)
    els += e

    ending = ["The model is only one layer. The product is the system around it."]
    e, side_y = sidebar_card(side_x, side_y, "Ending Line", ending, acc)
    els += e

    total_h = max(cy, side_y) - oy + PAD * 2
    fr = frame(ox, oy, FRAME_W, total_h, "03 · Demo — Live Code Bridge", acc)
    return [fr] + els, total_h

# ── assemble ──────────────────────────────────────────────────────────────────

def build():
    all_elements = []

    story_els, _ = build_story_frame()
    stack_els, _ = build_stack_frame()
    demo_els,  _ = build_demo_frame()

    all_elements += story_els + stack_els + demo_els

    doc = {
        "type": "excalidraw",
        "version": 2,
        "source": "generated",
        "elements": all_elements,
        "appState": {
            "viewBackgroundColor": C["bg"],
            "gridSize": None,
        },
        "files": {},
    }
    return doc

if __name__ == "__main__":
    doc = build()
    out = "/home/silva/SILVA.AI/Projects/AI4SWE/1-Introduction and Terms/lecture1.excalidraw"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)
    print(f"Written → {out}  ({len(doc['elements'])} elements)")
