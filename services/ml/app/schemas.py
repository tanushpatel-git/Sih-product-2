from typing import List

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    features: List[float] = Field(
        ..., min_length=1, description="Raw feature vector in the model's expected order"
    )


class PredictResponse(BaseModel):
    model: str
    n_features: int
    predicted_class: object
    class_index: int
    classes: List[object]
    probabilities: List[float]
    probability_percent: float
    positive_index: int | None = None
    raw_score: float | None = None
    source: str


class ModelInfo(BaseModel):
    name: str
    n_features: int
    multiclass: bool
    classes: List[object]
    estimator: str
    model_file: str
    loaded_at: str | None = None


class HealthResponse(BaseModel):
    status: str
    service: str
    models_loaded: int
    models_dir: str