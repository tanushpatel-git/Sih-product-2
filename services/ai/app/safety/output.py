from typing import Any

# Phrases that indicate the model tried to answer outside its role.
RISKY_PATTERNS = [
    "i am a doctor",
    "i can prescribe",
    "here is your prescription",
    "take 500 mg",
    "diagnosis:",
    "you have cancer",
    "your diagnosis is",
]

ESCALATE_PATTERNS = [
    "call emergency",
    "emergency services",
    "go to the emergency room",
    "seek immediate medical attention",
]

HARMFUL_PATTERNS = ["suicide", "self-harm"]


def check_output(text: str) -> dict[str, Any]:
    """Validate the LLM response before it is returned to the patient."""
    lowered = (text or "").lower()
    flags: dict[str, Any] = {}

    if any(p in lowered for p in RISKY_PATTERNS):
        flags["unsupported_diagnosis_or_advice"] = True

    if any(p in lowered for p in ESCALATE_PATTERNS):
        flags["emergency_escalation_mentioned"] = True

    if any(p in lowered for p in HARMFUL_PATTERNS):
        flags["concerning_content"] = True

    # Guard: response should not leak obviously sensitive data patterns
    if "password" in lowered and "system prompt" in lowered:
        flags["possible_leak"] = True

    return flags