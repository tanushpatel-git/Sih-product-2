from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from ..llm.provider import provider

# Gating limits (architecture sections 18-19).
MAX_CLAIMS_PER_ANSWER = 12

_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")

# Clinical-safety language carries no medical fact and is always allowed:
# it directs the patient to a clinician (or states the info is insufficient)
# instead of inventing facts. These claims skip the verifier entirely.
ALLOWABLE_REFUSAL_PATTERNS = (
    re.compile(r"doctor-approved information", re.I),
    re.compile(r"consult(ing)? (your|a|their|the) doctor", re.I),
    re.compile(r"see (your|a|the|their) doctor", re.I),
    re.compile(r"recommend(ed)? consult", re.I),
    re.compile(r"recommend(ed)? advising", re.I),
    re.compile(r"medical emergency", re.I),
    re.compile(r"emergency services", re.I),
    re.compile(r"does not (provide|contain)", re.I),
    re.compile(r"insufficient", re.I),
    re.compile(r"cannot (provide|give|offer|help with)", re.I),
    re.compile(r"seek (immediate )?(emergency )?care", re.I),
    re.compile(r"not a (doctor|medical professional)", re.I),
    re.compile(r"personalized (advice|recommendations?|treatment)", re.I),
    re.compile(r"not sure", re.I),
    re.compile(r"cannot diagnose", re.I),
)

# Medical assertions that MUST be grounded in the context. Used as a second
# signal when the verifier is AMBIGUOUS: a clear medication/dose/diagnosis
# recommendation must never pass just because the model was unsure.
_STRONG_MEDICAL_CLAIM = re.compile(
    r"\b(mg|milligram|ml|mcg|dose|dosage|tablet|pill|capsule|prescri|"
    r"medication|medicine|drug|injection|surgery|diagnos|"
    r"you (should|must) take|take \d|you have|caused by)\b",
    re.I,
)

_VERIFIER_SYSTEM = """You classify each claim from a medical assistant's reply.
The KNOWLEDGE CONTEXT is the doctor-approved source of truth, but NOT every
sentence is a medical fact that must appear in it.

Reply with ONE line per claim, nothing else. Line format:
<n>: SUPPORTED | UNSUPPORTED | AMBIGUOUS

SUPPORTED - the claim is stated in, entailed by, or directly paraphrased from
the context, OR the claim is not a medical fact at all. Safely steering the
patient (expressing uncertainty, saying the information is insufficient,
advising them to consult their doctor, suggesting a follow-up) is ALWAYS
acceptable and must be marked SUPPORTED.

UNSUPPORTED - the claim asserts a medical fact (a symptom, medication,
dosage, duration, number, diagnosis, cause, treatment, test, or anatomy) that
is not present in the context.

AMBIGUOUS - only when you truly cannot decide.

Never derive a medical fact from your own general knowledge. Advising the
patient to see a clinician is NEVER UNSUPPORTED.

Examples:
CONTEXT: Migraine is a recurrent unilateral headache lasting 4 to 72 hours.
Claims:
"Migraine usually lasts 4 to 72 hours." -> 1: SUPPORTED
"Take ibuprofen 400 mg." -> 2: UNSUPPORTED
"Please see your doctor for a check-up." -> 3: SUPPORTED
"Migraine lasts 2 to 3 weeks." -> 4: UNSUPPORTED"""


@dataclass
class GroundingResult:
    """Result of grounding an LLM answer against retrieved knowledge."""

    claims: list[dict[str, Any]] = field(default_factory=list)
    kept_claims: list[str] = field(default_factory=list)
    blocked_claims: list[str] = field(default_factory=list)
    ambiguous_claims: list[str] = field(default_factory=list)
    is_grounded: bool = True
    groundedness: float = 1.0
    error: str | None = None


def recompose_answer(kept_claims: list[str]) -> str:
    """Rebuild the answer from only the allowed claims (Section 18 'remove')."""
    return " ".join(c.strip() for c in kept_claims if c and c.strip())


def extract_claims(answer: str) -> list[str]:
    """Split an answer into individual claims (sentences)."""
    if not (answer or "").strip():
        return []
    sentences = [s.strip() for s in _SENTENCE_SPLIT.split(answer) if s and s.strip()]
    claims: list[str] = []
    seen: set[str] = set()
    for s in sentences:
        key = s.lower().strip().rstrip(".")
        if len(s) < 3 or key in seen:
            continue
        seen.add(key)
        claims.append(s)
        if len(claims) >= MAX_CLAIMS_PER_ANSWER:
            break
    return claims


def _is_allowable_refusal(text: str) -> bool:
    return any(p.search(text) for p in ALLOWABLE_REFUSAL_PATTERNS)


# Common tokens that don't establish medical grounding.
_IGNORED_TOKENS = {
    "take", "takea", "taking", "taken", "twice", "daily", "once", "per",
    "day", "days", "week", "weeks", "hour", "hours", "month", "months",
    "your", "yourself", "should", "could", "would", "with", "without",
    "over", "under", "then", "they", "them", "this", "that", "have",
    "also", "such", "from", "when", "after", "before", "recommend",
    "recommended", "consider", "considering", "may", "might", "lowest",
    "effective", "dose", "pain", "relief",
}


def _substantive_tokens(text: str) -> set[str]:
    return {
        w
        for w in re.findall(r"[a-z0-9]{4,}", text.lower())
        if w not in _IGNORED_TOKENS
    }


def _lexically_grounded(claim: str, context: str) -> bool:
    """True if the claim shares substantive vocabulary with the context.

    A deterministic backstop for medical-signature claims (medications,
    dosages): the verifier can hallucinate support, but if the specific
    words in the claim do not appear in the doctor-approved knowledge at
    all, the claim must not reach the patient.
    """
    claim_tokens = _substantive_tokens(claim)
    if not claim_tokens:
        return True
    context_tokens = _substantive_tokens(context)
    return bool(claim_tokens & context_tokens)


def _parse_verdicts(reply: str) -> dict[int, str]:
    # Small models sometimes duplicate a verdict line; a contradictory or
    # repeated verdict is treated as AMBIGUOUS (conservative = not allowed).
    per_index: dict[int, set[str]] = {}
    for m in re.finditer(r"(?im)^\s*(\d{1,3})\s*[:.)]\s*(SUPPORTED|UNSUPPORTED|AMBIGUOUS)\s*$", reply or ""):
        idx = int(m.group(1))
        per_index.setdefault(idx, set()).add(m.group(2).upper())
    verdicts: dict[int, str] = {}
    for idx, verdicts_set in per_index.items():
        verdicts[idx] = "SUPPORTED" if verdicts_set == {"SUPPORTED"} else (
            "UNSUPPORTED" if verdicts_set == {"UNSUPPORTED"} else "AMBIGUOUS"
        )
    return verdicts


def verify_claims(claims: list[str], context: str) -> list[dict[str, Any]]:
    """Ask the LLM whether each claim is supported by the context.

    Only called for claims that are not clearly allowable disclaimers.
    """
    if not claims:
        return []
    numbered = "\n".join(f"{i + 1}. {c}" for i, c in enumerate(claims))
    user = (
        "KNOWLEDGE CONTEXT:\n"
        f"{context}\n\n"
        "CLAIMS:\n"
        f"{numbered}\n\n"
        "For each claim, write exactly '<number>: SUPPORTED', "
        "'<number>: UNSUPPORTED' or '<number>: AMBIGUOUS'."
    )
    messages = [
        {"role": "system", "content": _VERIFIER_SYSTEM},
        {"role": "user", "content": user},
    ]
    reply = provider.chat(messages, temperature=0.0, max_tokens=1024)
    verdicts = _parse_verdicts(reply)
    results: list[dict[str, Any]] = []
    for i, claim in enumerate(claims, start=1):
        verdict = verdicts.get(i, "AMBIGUOUS")
        results.append(
            {
                "claim": claim,
                "verdict": verdict,
                "supported": verdict == "SUPPORTED",
            }
        )
    return results


def validate_grounding(answer: str, context: str) -> GroundingResult:
    """Validate every claim in the answer against the retrieved context.

    Rules:
    - Safe clinical-navigation language (see a doctor, insufficient info,
      uncertainty) is always kept, without an LLM round-trip.
    - A claim is BLOCKED only if it asserts a medical fact (medication,
      dosage, diagnosis, cause, number, duration...) that the context does
      not support. Verdict falls back to the medical-signature regex when
      the verifier is AMBIGUOUS or unavailable.
    - Non-medical / uncertain sentences are kept (tracked as ambiguous) so a
      mostly-good answer is not destroyed by one noisy verdict.
    """
    claims = extract_claims(answer)
    if not claims:
        return GroundingResult()

    to_verify = [c for c in claims if not _is_allowable_refusal(c)]
    verdicts = {}
    try:
        verdicts = {v["claim"]: v for v in verify_claims(to_verify, context)}
    except Exception:
        pass

    verified: list[dict[str, Any]] = []
    blocked: list[str] = []
    kept: list[str] = []
    ambiguous: list[str] = []

    for claim in claims:
        # Safe clinical-navigation language is always kept, no further gates.
        if _is_allowable_refusal(claim):
            kept.append(claim)
            verified.append({"claim": claim, "verdict": "SUPPORTED", "supported": True})
            continue

        v = verdicts.get(claim, {"verdict": "AMBIGUOUS", "supported": False})
        verdict, supported = v["verdict"], v["supported"]

        med_signature = _STRONG_MEDICAL_CLAIM.search(claim)

        # A medical-fact claim (medication, dose, diagnosis...) is only kept
        # if the verifier supports it AND its vocabulary also appears in the
        # knowledge (deterministic backstop against verifier hallucination).
        if med_signature and not _lexically_grounded(claim, context):
            blocked.append(claim)
            verified.append({"claim": claim, "verdict": "UNSUPPORTED", "supported": False})
            continue

        if not supported and (
            verdict == "UNSUPPORTED" or bool(med_signature)
        ):
            blocked.append(claim)
            verified.append({"claim": claim, "verdict": verdict, "supported": False})
        else:
            if verdict == "AMBIGUOUS" or (not supported):
                ambiguous.append(claim)
                verdict = "AMBIGUOUS"
            kept.append(claim)
            verified.append({"claim": claim, "verdict": verdict, "supported": True})

    groundedness = round(len(kept) / len(claims), 2) if claims else 1.0
    return GroundingResult(
        claims=verified,
        kept_claims=kept,
        blocked_claims=blocked,
        ambiguous_claims=ambiguous,
        is_grounded=not blocked,
        groundedness=groundedness,
    )


def build_context_text(chunks: list[dict[str, Any]]) -> str:
    """Build the canonical ground-truth text from retrieved chunks."""
    parts: list[str] = []
    for chunk in chunks:
        title = chunk.get("title") or "Knowledge source"
        header = f"[{title}]"
        if chunk.get("section"):
            header += f" — Section: {chunk['section']}"
        parts.append(f"{header}\n{chunk['content']}")
    return "\n\n".join(parts)


def _token_overlap(answer: str, context: str) -> float:
    """Rough coverage heuristic: fraction of substantive answer tokens that
    also appear in the context. A coarse stand-in for answer completeness."""
    def tokens(text: str) -> set[str]:
        return {t for t in re.findall(r"[a-z0-9]{3,}", text.lower())}
    ans = tokens(answer)
    if not ans:
        return 1.0
    ctx = tokens(context)
    return round(len(ans & ctx) / len(ans), 2)


def compute_grounding_scores(
    answer: str,
    chunks: list[dict[str, Any]],
    validation: GroundingResult,
    safety_flags: dict[str, Any],
) -> dict[str, Any]:
    """Expose the evaluation-style metrics from architecture section 19."""
    distances = [c.get("distance", 0.5) for c in chunks] or [0.5]
    avg_distance = sum(distances) / len(distances)

    return {
        "retrieval_relevance": round(max(0.0, min(1.0, 1.0 - avg_distance)), 2),
        "answer_groundedness": validation.groundedness,
        "answer_completeness": _token_overlap(answer, build_context_text(chunks)),
        "safety": "PASS" if not safety_flags else "REVIEW",
    }