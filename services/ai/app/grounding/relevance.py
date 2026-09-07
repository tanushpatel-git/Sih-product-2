from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

# Section 12 / 32 relevance gate: before sending retrieved chunks to the LLM,
# check that they actually contain what the question asks for. In particular,
# a medication/treatment question must never be answered with symptom-only
# chunks, otherwise the LLM will fill the gap from its own knowledge.

MEDICATION_INTENT_PATTERNS = [
    "what medicine",
    "what medication",
    "which medicine",
    "what drug",
    "should i take",
    "what should i take",
    "what do i take",
    "medicine for",
    "medication for",
    "drug for",
    "prescription",
    "prescribed",
    "prescribe",
    "dosage",
    "dosages",
    "dose of",
    "how much",
    "tablet",
    "tablets",
    "pill",
    "pills",
    "capsule",
    "capsules",
    "take for",
]

MEDICATION_EVIDENCE_PATTERNS = [
    " mg",
    "mg ",
    "mg/",
    "dosage",
    "dosages",
    "dose",
    "doses",
    "tablet",
    "tablets",
    "pill",
    "pills",
    "capsule",
    "capsules",
    "prescription",
    "prescribed",
    "prescribe",
    "medication",
    "medications",
    "medicine",
    "medicines",
    "drug",
    "drugs",
    "should take",
]

INSUFFICIENT_INFO_RESPONSE = (
    "The available doctor-approved information does not contain enough "
    "information to answer this question. Please consult your doctor for "
    "personalized advice, or ask me to rephrase using your doctor's materials."
)

INSUFFICIENT_MEDICATION_RESPONSE = (
    "The available doctor-approved information does not contain medication "
    "recommendations for this condition. Please consult your doctor for "
    "personalized treatment advice."
)


@dataclass
class RelevanceResult:
    ok: bool
    reason: str | None = None


def _mentions(text: str, patterns: list[str]) -> bool:
    lowered = (text or "").lower()
    return any(p.lower() in lowered for p in patterns)


def check_relevance(question: str, chunks: list[dict[str, Any]]) -> RelevanceResult:
    """Return the safe refusal before the LLM when the retrieved knowledge
    cannot support the question's intent."""
    if not chunks:
        return RelevanceResult(False, "no_knowledge")

    if _mentions(question, MEDICATION_INTENT_PATTERNS):
        evidence = any(
            _mentions(c.get("content", ""), MEDICATION_EVIDENCE_PATTERNS)
            for c in chunks
        )
        if not evidence:
            return RelevanceResult(False, "medication_not_supported")

    return RelevanceResult(True)


def relevance_response(reason: str | None) -> str:
    if reason == "medication_not_supported":
        return INSUFFICIENT_MEDICATION_RESPONSE
    return INSUFFICIENT_INFO_RESPONSE