from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from ...rag.ingestion import ingest_document
from ..deps import verify_ai_key

router = APIRouter()


@router.post("/ingest")
async def ingest(
    document_id: str = Form(...),
    doctor_id: str = Form(...),
    file: UploadFile = File(...),
    _req = Depends(verify_ai_key),
):
    try:
        data = await file.read()
        count = ingest_document(
            document_id=document_id,
            doctor_id=doctor_id,
            file_name=file.filename or "document.txt",
            file_bytes=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {e}")

    return {"ok": True, "document_id": document_id, "chunkCount": count}