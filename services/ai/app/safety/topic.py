from typing import Any

from ..llm.provider import provider

# What the assistant replies when a question is clearly outside medical scope.
OFF_TOPIC_RESPONSE = (
    "I'm a medical consultation assistant, so I can only help with health "
    "and medical questions related to your doctor. For anything outside "
    "medicine (for example coding, recipes, sports, or homework), please "
    "consult an appropriate source."
)

DOMAIN_RESPONSE_TEMPLATE = (
    "This question is not within my doctor's domain. {specialty} is their "
    "specialty, and this topic falls outside the medical knowledge they "
    "cover, so I cannot help with it. Please consult the appropriate "
    "specialist for this concern."
)

# Classifier determining whether a question is medical/health at all.
MEDICAL_CLASSIFIER_PROMPT = (
    "You are the topic classifier for a medical consultation chatbot. The "
    "user is chatting with their doctor's medical assistant.\n"
    "Reply with exactly one word: YES or NO.\n\n"
    "YES if the message is within the scope of health and medicine:\n"
    "- it describes a symptom, condition, medication, test, or treatment\n"
    "- it asks for medical advice or what to do about a health problem\n"
    "- it is a greeting, thanks, or a natural follow-up in an ongoing "
    "medical consultation\n\n"
    "NO only if it is clearly unrelated to health or medicine, such as "
    "programming, cooking, sports, movies, general knowledge, math, or "
    "translation.\n\n"
    "Examples:\n"
    '- "write hello world in python" -> NO\n'
    '- "give me a pasta recipe" -> NO\n'
    '- "I have a headache for 2 days, what should I do?" -> YES\n'
    '- "what is the capital of France" -> NO\n'
    '- "thanks, that is helpful" (after medical talk) -> YES'
)

# Short acknowledgements / follow-ups are handled directly so a consultation
# keeps flowing without burning an LLM classification call.
FOLLOW_UP_ALLOWED = [
    "ok", "okay", "thanks", "thank you", "thankyou", "hello", "hi", "hey",
    "tell me more", "more details", "explain", "repeat", "again", "yes",
    "no", "what does that mean", "is that serious", "anything else",
    "go on", "continue", "can you clarify", "got it", "sure",
]


def _is_fast_follow_up(text: str) -> bool:
    lowered = (text or "").lower().strip()
    if not lowered:
        return True
    return any(lowered == a or lowered.startswith(a) for a in FOLLOW_UP_ALLOWED)


def is_fast_follow_up(text: str) -> bool:
    """Public wrapper: is this message just a greeting / short follow-up?"""
    return _is_fast_follow_up(text)


def build_medical_messages(
    question: str, history: list[dict[str, Any]]
) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = [
        {"role": "system", "content": MEDICAL_CLASSIFIER_PROMPT}
    ]
    # Last turns of the conversation give the classifier medical context.
    for m in history[-6:]:
        role = "assistant" if m.get("sender") == "ai" else "user"
        messages.append({"role": role, "content": str(m.get("content", ""))[:500]})
    messages.append({"role": "user", "content": question})
    return messages


def _parse_yes_no(reply: str) -> str:
    word = (reply or "").strip().upper().split()[0] if (reply or "").strip() else ""
    word = word.strip(".,!?;:")
    if word.startswith("YES"):
        return "yes"
    if word.startswith("NO"):
        return "no"
    return "unknown"


def classify_medical(question: str, history: list[dict[str, Any]] | None = None) -> bool:
    """Ask the LLM whether a question is within the medical scope.

    Returns True (medical) or False (refuse). Greetings/follow-ups are
    accepted directly without an LLM round-trip. On an ambiguous reply or
    error we stay permissive and let the RAG prompt rule handle it.
    """
    if _is_fast_follow_up(question):
        return True

    messages = build_medical_messages(question, history or [])
    try:
        reply = provider.chat(messages, temperature=0.0, max_tokens=8)
        label = _parse_yes_no(reply)
        return label != "no"  # "yes" or "unknown" -> allow
    except Exception:
        return True