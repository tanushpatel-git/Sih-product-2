import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.predict import router as predict_router
from .api.capacity import router as capacity_router
from .config import settings
from .registry import load_all, registry

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

app = FastAPI(
    title="MedChat ML Prediction Service",
    description="Serves predictions from the trained clinical ML models in ml-models/",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    load_all()


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ml",
        "models_loaded": len(registry.list()),
        "models_dir": str(settings.models_dir),
    }


app.include_router(predict_router, prefix="/api", tags=["predict"])
app.include_router(capacity_router, prefix="/api", tags=["capacity"])
