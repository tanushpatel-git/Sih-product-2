from typing import Any

from .emergency import detect_emergency

MAX_INPUT_LENGTH = 2000


def check_input(text: str) -> dict[str, Any]:
    """Validate patient input before it reaches RAG/LLM.

    Returns a dict of flags, including whether an emergency keyword was hit.
    Topic (medical vs non-medical) is classified by the LLM later in the
    chain, where conversation history is available.
    """
    flags: dict[str, Any] = {}
    text = text or ""

    if len(text) > MAX_INPUT_LENGTH:
        flags["too_long"] = True

    if detect_emergency(text):
        flags["emergency"] = True

    if len(text.strip()) == 0:
        flags["empty"] = True

    return flags