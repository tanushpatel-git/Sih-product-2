from typing import Any

from ..rag.retrieval import retrieve
from ..prompts.builder import build_messages
from ..llm.provider import provider
from ..db import get_doctor_context
from ..safety.emergency import EMERGENCY_RESPONSE, detect_emergency
from ..safety.topic import (
    OFF_TOPIC_RESPONSE,
    DOMAIN_RESPONSE_TEMPLATE,
    classify_medical,
    is_fast_follow_up,
)
from ..safety.output import check_output
from ..grounding.relevance import check_relevance, relevance_response
from ..grounding.validator import (
    build_context_text,
    compute_grounding_scores,
    recompose_answer,
    validate_grounding,
)

# A chunk is only used as knowledge when it is close enough in embedding
# space. Irrelevant matches (distance ~0.6+) are the model refusing to
# attribute a different medical domain to this doctor.
DOMAIN_MAX_DISTANCE = 0.45

GROUNDING_FAILURE_RESPONSE = (
    "The available doctor-approved information does not contain enough "
    "information to answer this question safely. Please consult your doctor "
    "for personalized advice."
)

FOLLOW_UP_RESPONSE = (
    "I'm here if you have any other health questions. Let me know if there's "
    "anything else you'd like to understand about your symptoms."
)


def get_relevant(query: str, doctor_id: str, top_k: int | None = None) -> list[dict]:
    """Retrieved chunks that are actually within the doctor's knowledge."""
    return [
        c
        for c in retrieve(query, doctor_id=doctor_id, top_k=top_k)
        if c.get("distance", 1.0) < DOMAIN_MAX_DISTANCE
    ]


def _generate_grounded_answer(
    question: str,
    retrieved: list[dict[str, Any]],
    history: list[dict[str, Any]],
    summary: str | None,
    ai_config: dict[str, Any] | None,
    doctor_context: dict[str, Any],
) -> tuple[str, dict[str, Any], dict[str, Any]]:
    """Ask the LLM and enforce output grounding (architecture sections 18-19).

    Returns (answer, grounding validation result, grounded metrics).
    Blocked (unsupported-medical) claims are removed and, if any were found,
    the model is asked once to re-answer without them (Section 18
    'Remove / Regenerate'). If nothing safe remains, a fallback is returned.
    """
    context = build_context_text(retrieved)
    temperature = float((ai_config or {}).get("temperature", 0.2))
    max_tokens = int((ai_config or {}).get("max_tokens", 512))

    # Initial generation.
    messages = build_messages(
        question=question,
        retrieved=retrieved,
        history=history,
        summary=summary,
        ai_config=ai_config,
        doctor_context=doctor_context,
    )
    answer = provider.chat(messages, temperature=temperature, max_tokens=max_tokens)
    validation = validate_grounding(answer, context)
    output_flags = check_output(answer)

    # Corrective regeneration once, listing only grounded-unsupported claims.
    if validation.blocked_claims or output_flags.get("unsupported_diagnosis_or_advice"):
        messages = build_messages(
            question=question,
            retrieved=retrieved,
            history=history,
            summary=summary,
            ai_config=ai_config,
            doctor_context=doctor_context,
            unsupported_claims=validation.blocked_claims,
        )
        answer = provider.chat(messages, temperature=temperature, max_tokens=max_tokens)
        validation = validate_grounding(answer, context)
        output_flags = check_output(answer)

    # Remove whatever is still unsupported rather than dropping the answer.
    kept = [c for c in validation.kept_claims]
    safe_answer = recompose_answer(kept)
    if not safe_answer.strip():
        safe_answer = GROUNDING_FAILURE_RESPONSE
        validation = validate_grounding(safe_answer, context)

    metrics = compute_grounding_scores(safe_answer, retrieved, validation, output_flags)
    return safe_answer, validation, metrics


def run_rag_query(
    question: str,
    doctor_id: str,
    history: list[dict[str, Any]],
    summary: str | None = None,
    ai_config: dict[str, Any] | None = None,
    emergency: bool = False,
) -> dict[str, Any]:
    """Full RAG chain: emergency -> medical scope -> domain -> retrieve -> LLM
    -> grounding validation.

    - Emergency questions are short-circuited.
    - Non-medical questions are refused via an LLM classification.
    - Medical questions outside the doctor's specialty/uploaded knowledge
      are refused with a domain message (nothing is answered for them).
    - Questions whose intent the retrieved knowledge cannot support (e.g.
      medication with symptom-only docs) are refused (section 12/32).
    - The answer is grounded against the retrieved chunks; unsupported
      medical claims are removed / regenerated (sections 18-19).
    """
    if emergency or detect_emergency(question):
        return {
            "answer": EMERGENCY_RESPONSE,
            "sources": [],
            "emergency": True,
            "safety_flags": {"emergency": True},
        }

    if not classify_medical(question, history):
        return {
            "answer": OFF_TOPIC_RESPONSE,
            "sources": [],
            "emergency": False,
            "safety_flags": {"off_topic": True},
        }

    doctor_context = get_doctor_context(doctor_id)
    specialty = doctor_context["specialty"]

    retrieved = get_relevant(question, doctor_id)
    if not retrieved:
        # Greetings / short follow-ups stay conversational instead of being
        # treated as out-of-domain.
        if is_fast_follow_up(question):
            return {
                "answer": FOLLOW_UP_RESPONSE,
                "sources": [],
                "emergency": False,
                "safety_flags": {"follow_up": True},
            }
        return {
            "answer": DOMAIN_RESPONSE_TEMPLATE.format(specialty=specialty),
            "sources": [],
            "emergency": False,
            "safety_flags": {"off_topic": True, "out_of_domain": True},
        }

    relevance = check_relevance(question, retrieved)
    if not relevance.ok:
        return {
            "answer": relevance_response(relevance.reason),
            "sources": [],
            "emergency": False,
            "safety_flags": {"insufficient_information": True},
        }

    answer, validation, metrics = _generate_grounded_answer(
        question=question,
        retrieved=retrieved,
        history=history,
        summary=summary,
        ai_config=ai_config,
        doctor_context=doctor_context,
    )

    sources = [
        {
            "documentId": c["document_id"],
            "title": c.get("title"),
            "content": c["content"],
            "section": c.get("section"),
            "page": c.get("page_number"),
        }
        for c in retrieved
    ]

    return {
        "answer": answer,
        "sources": sources,
        "emergency": False,
        "safety_flags": {
            "grounded": validation.is_grounded,
            "grounding_claims_removed": bool(validation.blocked_claims),
        },
        "grounding_score": metrics,
        "grounding": {
            "grounded": validation.is_grounded,
            "blocked_claims": validation.blocked_claims,
            "ambiguous_claims": validation.ambiguous_claims,
        },
    }