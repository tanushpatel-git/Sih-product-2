from typing import Any

# Cap on how many recent messages to inline in the prompt.
MAX_RECENT_MESSAGES = 12


def build_context_messages(history: list[dict[str, Any]]) -> list[dict[str, str]]:
    """Convert recent stored messages into role/content pairs for the LLM.

    Only the most recent messages are included to bound context size.
    """
    recent = history[-MAX_RECENT_MESSAGES:]
    out: list[dict[str, str]] = []
    for msg in recent:
        role = "user" if msg.get("sender") in ("patient", "doctor") else "assistant"
        out.append({"role": role, "content": str(msg.get("content", ""))})
    return out