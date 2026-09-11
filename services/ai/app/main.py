from fastapi import FastAPI

from .api.routes.query import router as query_router
from .api.routes.ingest import router as ingest_router
from .api.routes.extraction import router as extraction_router
from .api.routes.transcription import router as transcription_router
from .config import settings
from .db import get_collection, close_client


def ensure_indexes():
    get_collection("documentchunks").create_index([("doctor_id", 1), ("document_id", 1)])
    get_collection("documentchunks").create_index([("doctor_id", 1)])


app = FastAPI(
    title="MedChat AI Service",
    description="RAG + LangChain inference service for the medical chatbot",
    version="0.1.0",
    on_startup=[ensure_indexes],
)


@app.on_event("shutdown")
async def shutdown():
    close_client()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai", "model": settings.ollama_model}


app.include_router(query_router, prefix="/api", tags=["query"])
app.include_router(ingest_router, prefix="/api", tags=["ingest"])
app.include_router(extraction_router, prefix="/api", tags=["extraction"])
app.include_router(transcription_router, prefix="/api", tags=["transcription"])