from typing import Any

# Simple, clinically-reviewed-in-principle keyword rules. In production these
# should be designed and reviewed by qualified clinicians.
EMERGENCY_KEYWORDS = [
    "chest pain",
    "shortness of breath",
    "difficulty breathing",
    "trouble breathing",
    "can't breathe",
    "can't catch my breath",
    "cannot breathe",
    "unable to breathe",
    "severe bleeding",
    "unconscious",
    "passed out",
    "loss of consciousness",
    "fainted",
    "sudden weakness",
    "weakness on one side",
    "numbness on one side",
    "slurred speech",
    "facial droop",
    "face drooping",
    "stroke",
    "seizure",
    "suicidal",
    "suicide",
    "overdose",
    "calling emergency",
    "heart attack",
    "severe allergic reaction",
    "anaphylaxis",
    "swelling of the face",
    "swelling of the tongue",
    "911",
    "112",
    "999",
]

EMERGENCY_RESPONSE = (
    "Your symptoms could be signs of a medical emergency. Please stop using "
    "this chat and seek immediate emergency care by calling emergency "
    "services right away. This assistant cannot provide emergency help."
)


def detect_emergency(text: str) -> bool:
    lowered = text.lower()
    return any(kw in lowered for kw in EMERGENCY_KEYWORDS)