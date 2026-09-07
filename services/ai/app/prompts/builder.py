from typing import Any

from .system import SYSTEM_PROMPT, MEDICAL_SAFETY_POLICY
from ..memory.conversation import build_context_messages


def build_messages(
    question: str,
    retrieved: list[dict[str, Any]],
    history: list[dict[str, Any]],
    summary: str | None = None,
    ai_config: dict[str, Any] | None = None,
    doctor_context: dict[str, Any] | None = None,
    unsupported_claims: list[str] | None = None,
) -> list[dict[str, str]]:
    """Build the final chat message list for the LLM.

    Structure (architecture section 16):
      system instructions + medical safety
      + doctor configuration + doctor domain
      + retrieved knowledge (RAG)
      + conversation summary
      + recent messages
      + patient question

    `unsupported_claims` (grounding regenerate pass) adds a corrective note
    telling the model which statements to drop.
    """
    system_parts: list[str] = [SYSTEM_PROMPT, MEDICAL_SAFETY_POLICY]

    if doctor_context and doctor_context.get("specialty"):
        lines = [f"DOCTOR DOMAIN: {doctor_context['specialty']}"]
        if doctor_context.get("documents"):
            lines.append(
                "AVAILABLE KNOWLEDGE: " + ", ".join(doctor_context["documents"])
            )
        lines.append(
            "Only answer within this domain. If the question belongs to a "
            "different specialty, say it is outside the doctor's domain."
        )
        system_parts.append("\n".join(lines))

    if ai_config:
        config_lines = ["DOCTOR CONFIGURATION:"]
        if ai_config.get("system_prompt"):
            config_lines.append(ai_config["system_prompt"])
        if ai_config.get("response_style"):
            config_lines.append(f"Response style: {ai_config['response_style']}")
        if ai_config.get("language"):
            config_lines.append(f"Language: {ai_config['language']}")
        if ai_config.get("emergency_policy"):
            config_lines.append(f"Emergency policy: {ai_config['emergency_policy']}")
        system_parts.append("\n".join(config_lines))

    knowledge = []
    for chunk in retrieved:
        title = chunk.get("title") or "Knowledge source"
        knowledge.append(f"[{title}]\n{chunk['content']}")
    system_parts.append("RETRIEVED KNOWLEDGE:\n" + "\n\n".join(knowledge))

    if summary:
        system_parts.append(f"CONVERSATION SUMMARY:\n{summary}")

    if unsupported_claims:
        listed = "\n".join(f"- {c}" for c in unsupported_claims)
        system_parts.append(
            "CORRECTION FROM THE GROUNDING CHECK:\n"
            "Your previous answer contained claims that are not supported by "
            "the RETRIEVED KNOWLEDGE. Do NOT repeat any of the following, and "
            "do not replace them with other invented facts:\n"
            f"{listed}\n"
            "Re-answer using ONLY the RETRIEVED KNOWLEDGE. If it does not "
            "support an answer, say the doctor-approved information is "
            "insufficient."
        )

    system = "\n\n".join(system_parts)

    messages = [{"role": "system", "content": system}]
    messages.extend(build_context_messages(history))
    messages.append({"role": "user", "content": question})
    return messages