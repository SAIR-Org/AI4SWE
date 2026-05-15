# =============================================================================
# DEMO 06 — Calling Your Own Code: Custom Logic as Tools
# AI4SWE · Lecture 3
# =============================================================================
# Your own functions — with real state and business rules — can be tools too.
# The model drives your code; your code does the real work.
# RUN: python 06_custom_logic.py
# =============================================================================

import os
import json
import uuid
from datetime import datetime
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL  = "llama-3.1-8b-instant"

TASKS: dict[str, dict] = {}
PRIORITY_ORDER = {"high": 0, "medium": 1, "low": 2}


def add_task(title: str, priority: str = "medium") -> dict:
    if priority not in PRIORITY_ORDER:
        return {"error": f"invalid priority {priority!r} — use high, medium, or low"}
    task_id = str(uuid.uuid4())[:8]
    TASKS[task_id] = {
        "id":         task_id,
        "title":      title,
        "priority":   priority,
        "status":     "pending",
        "created_at": datetime.now().isoformat(timespec="seconds"),
    }
    return {"added": task_id, "title": title, "priority": priority}


def list_tasks(status: str = "all") -> dict:
    if status not in {"all", "pending", "done"}:
        return {"error": f"invalid status {status!r} — use all, pending, or done"}
    filtered = [t for t in TASKS.values() if status == "all" or t["status"] == status]
    filtered.sort(key=lambda t: (PRIORITY_ORDER[t["priority"]], t["created_at"]))
    return {"count": len(filtered), "tasks": filtered}


def mark_done(title: str) -> dict:
    for task in TASKS.values():
        if title.lower() in task["title"].lower() and task["status"] == "pending":
            task["status"] = "done"
            task["done_at"] = datetime.now().isoformat(timespec="seconds")
            return {"marked_done": task["title"], "priority": task["priority"]}
    return {"error": f"no pending task matching '{title}' found"}


def get_stats() -> dict:
    if not TASKS:
        return {"total": 0, "pending": 0, "done": 0, "completion_pct": 0, "by_priority": {}}
    total = len(TASKS)
    done  = sum(1 for t in TASKS.values() if t["status"] == "done")
    return {
        "total":          total,
        "pending":        total - done,
        "done":           done,
        "completion_pct": round(done / total * 100),
        "by_priority": {
            p: sum(1 for t in TASKS.values() if t["priority"] == p)
            for p in ("high", "medium", "low")
            if any(t["priority"] == p for t in TASKS.values())
        },
    }


TOOL_MAP = {
    "add_task":   add_task,
    "list_tasks": list_tasks,
    "mark_done":  mark_done,
    "get_stats":  get_stats,
}

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Add a new task with a title and priority level.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title":    {"type": "string"},
                    "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                },
                "required": ["title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "List tasks, optionally filtered by status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "enum": ["all", "pending", "done"]},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "mark_done",
            "description": "Mark a pending task as completed by searching for its title.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                },
                "required": ["title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_stats",
            "description": "Get summary statistics: total, done count, completion percentage, breakdown by priority.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
]

SYSTEM = "You are a task management assistant. Use the available tools to manage tasks."


def run(query: str) -> str:
    messages = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": query}]
    while True:
        response   = client.chat.completions.create(model=MODEL, tools=TOOLS, messages=messages)
        choice     = response.choices[0]
        tool_calls = choice.message.tool_calls or []

        if not tool_calls:
            return choice.message.content

        messages.append(choice.message)
        for tc in tool_calls:
            args   = json.loads(tc.function.arguments or "{}") or {}
            result = TOOL_MAP[tc.function.name](**args)
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": json.dumps(result)})


if __name__ == "__main__":
    print(run("Add these tasks: 'Fix login bug' (high), 'Update README' (low), 'Write unit tests' (medium)."))
    print()
    print(run("Mark the 'Fix login bug' task as done. Then give me the completion stats."))
