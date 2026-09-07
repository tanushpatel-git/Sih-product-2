from typing import Any

from fastapi import APIRouter, Depends, Request

from ...chains.rag import run_rag_query
from ...safety.input import check_input
from ...safety.emergency import detect_emergency
from ..deps import verify_ai_key

router = APIRouter()


@router.post("/query")
async def query(
    body: dict[str, Any],
    _req: Request = Depends(verify_ai_key),
):
    question = str(body.get("question") or "").strip()
    doctor_id = str(body.get("doctorId") or "")
    conversation_id = str(body.get("conversationId") or "")
    patient_id = str(body.get("patientId") or "")

    if not question:
        return {"error": "question is required"}
    if not doctor_id:
        return {"error": "doctorId is required"}

    history = body.get("history") or []
    summary = body.get("summary")
    ai_config = body.get("aiConfig")

    # Safety: input validation
    flags = check_input(question)
    emergency = flags.get("emergency", False)

    result = run_rag_query(
        question=question,
        doctor_id=doctor_id,
        history=history,
        summary=summary,
        ai_config=ai_config,
        emergency=emergency,
    )
    # merge input flags into safety flags
    result["safety_flags"].update({k: v for k, v in flags.items() if k != "emergency"})
    result["conversation_id"] = conversation_id
    result["patient_id"] = patient_id
    return result