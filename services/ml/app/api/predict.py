from fastapi import APIRouter, HTTPException

from ..registry import MLRegistryError, registry
from ..schemas import ModelInfo, PredictRequest, PredictResponse

router = APIRouter()


@router.get("/models", response_model=list[ModelInfo], tags=["models"])
async def list_models():
    return registry.list()


@router.post(
    "/predict/{model}",
    response_model=PredictResponse,
    tags=["predict"],
)
async def predict_model(model: str, payload: PredictRequest):
    try:
        return registry.predict(model, payload.features)
    except MLRegistryError as exc:
        raise HTTPException(status_code=422 if "expects" in str(exc) else 404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))