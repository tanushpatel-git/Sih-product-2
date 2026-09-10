"""Registry of the trained clinical ML models shipped in `ml-models/`.

Each entry describes how to load the serialized artifact(s) and how many raw
features the model expects, plus any specialised pre-processing that the
training notebooks applied *before* the estimator was fitted (median
zero-imputation for the Pima diabetes dataset, separate StandardScalers for
the XGBoost-only models).
"""
from __future__ import annotations

import datetime as _dt
import logging

import joblib
import numpy as np
import pandas as pd

from .config import settings

logger = logging.getLogger("ml")

MODEL_SPECS = {
    "stroke": {
        "model": "Stroke-model/best_stroke_model.pkl",
        "n_features": 16,
        "multiclass": False,
    },
    "anemia": {
        "model": "anemia-model/best_anemia_model.pkl",
        "n_features": 5,
        "multiclass": False,
    },
    "breastCancer": {
        "model": "breast-cancer-model/best_breast_cancer_model.pkl",
        "n_features": 30,
        "multiclass": False,
    },
    "diabetes": {
        "model": "diabetes-model/diabetes_model.pkl",
        "scaler": "diabetes-model/diabetes_scaler.pkl",
        # Pima dataset: a 0-value means "not measured"; training replaced them
        # with the column median before scaling. Feature order follows
        # DIABETES_FEATURE_KEYS: [pregnancies, glucose, bloodPressure,
        # skinThickness, insulin, bmi, diabetesPedigree, age].
        "impute": {1: 117.0, 2: 72.0, 3: 29.0, 4: 125.0, 5: 32.3},
        "n_features": 8,
        "multiclass": False,
    },
    "heartDisease": {
        "model": "heart-disease-model/heart_disease_model.pkl",
        "n_features": 13,
        "multiclass": False,
    },
    "heartFailure": {
        "model": "heart-failure-model/pipeline.pkl",
        "n_features": 12,
        "multiclass": False,
    },
    "kidneyDisease": {
        "model": "kidney-disease-model/kidney_disease_model.pkl",
        "scaler": "kidney-disease-model/kidney_disease_scaler.pkl",
        "label_map": "kidney-disease-model/kidney_disease_label_map.pkl",
        "n_features": 35,
        "multiclass": True,
    },
    "liverDisease": {
        "model": "liver-model/best_liver_model.pkl",
        "n_features": 10,
        "multiclass": False,
    },
}


class MLRegistryError(Exception):
    pass


def _estimator_of(model):
    """Pull the final estimator out of a Pipeline (returns itself otherwise)."""
    probe = model
    steps = getattr(probe, "named_steps", None)
    while steps is not None:
        candidate = steps.get("classifier") or steps.get("model")
        if candidate is None or candidate is probe:
            break
        probe = candidate
        steps = getattr(probe, "named_steps", None)
    return probe


def _raw_score(model, X):
    """Log-odds (decision function) / XGBoost margin for the fitted model.

    When `model` is a Pipeline, call its own decision_function so the internal
    transforms are applied — never the bare estimator with raw features.
    """
    try:
        if hasattr(model, "decision_function"):
            return float(np.asarray(model.decision_function(X)).reshape(-1)[0])
    except Exception:
        pass
    try:
        if "XGB" in type(model).__name__ and hasattr(model, "predict"):
            return float(
                np.asarray(model.predict(X, output_margin=True)).reshape(-1)[0]
            )
    except Exception:
        pass
    return None


class ModelHandle:
    def __init__(self, name: str, spec: dict, models_dir):
        self.name = name
        self.spec = spec
        self.models_dir = models_dir
        self.model_file = str(models_dir / spec["model"])
        self.scaler_file = (
            str(models_dir / spec["scaler"]) if spec.get("scaler") else None
        )
        self.label_map_file = (
            str(models_dir / spec["label_map"]) if spec.get("label_map") else None
        )
        self.n_features = int(spec["n_features"])
        self.multiclass = bool(spec["multiclass"])
        self.impute = spec.get("impute") or {}

        self._model = None
        self._scaler = None
        self._label_map = None
        self._classes = None
        self._class_names = None
        self._loaded_at = None

    def _require(self):
        if self._model is None:
            self._model = joblib.load(self.model_file)
            if self.scaler_file:
                self._scaler = joblib.load(self.scaler_file)
            if self.label_map_file:
                self._label_map = joblib.load(self.label_map_file)

            if self._label_map is not None:
                # label_map: { "Healthy Kidney": 0, "Mild CKD...": 1, ... }
                items = sorted(self._label_map.items(), key=lambda kv: kv[1])
                self._classes = [kv[1] for kv in items]
                self._class_names = [kv[0] for kv in items]
            else:
                estimator = _estimator_of(self._model)
                if hasattr(estimator, "classes_"):
                    self._classes = [int(c) for c in estimator.classes_.tolist()]
                    self._class_names = [str(c) for c in self._classes]
                else:
                    raise MLRegistryError(
                        f"Model '{self.name}' does not expose classes"
                    )
            self._loaded_at = _dt.datetime.now(_dt.timezone.utc).isoformat()
            logger.info("Loaded model %s (%s)", self.name, type(_estimator_of(self._model)).__name__)
        return self._model, self._scaler

    def predict(self, features):
        model, scaler = self._require()
        if len(features) != self.n_features:
            raise MLRegistryError(
                f"Model '{self.name}' expects {self.n_features} features, "
                f"got {len(features)}"
            )
        X = np.asarray(features, dtype=float).reshape(1, -1)

        # Zero-value imputation (as done during training) before scaling.
        if self.impute:
            row = X[0].copy()
            for idx, median in self.impute.items():
                if row[idx] == 0.0:
                    row[idx] = median
            X = row.reshape(1, -1)

        if scaler is not None:
            X = np.asarray(scaler.transform(X))

        # ColumnTransformer-based pipelines reference columns by name, so feed
        # a DataFrame with the exact pre-transform training column order (the
        # top-level model's feature_names_in_), when available.
        if hasattr(model, "feature_names_in_"):
            X = pd.DataFrame(X, columns=list(model.feature_names_in_))

        if hasattr(model, "predict_proba"):
            proba = np.asarray(model.predict_proba(X))[0]
        else:
            proba = np.asarray(model.predict(X)).astype(float)

        pred_idx = int(np.argmax(proba))
        pred_class = self._class_names[pred_idx]
        probabilities = [float(p) for p in proba]

        probability_percent = float(proba[pred_idx] * 100.0)
        positive_index = None
        raw_score = None
        if not self.multiclass and len(self._classes) >= 2:
            positive_index = 1  # sklearn binary classes are sorted [0, 1]
            probability_percent = float(proba[1] * 100.0)
            raw_score = _raw_score(model, X)

        return {
            "model": self.name,
            "n_features": self.n_features,
            "predicted_class": pred_class,
            "class_index": pred_idx,
            "classes": self._class_names,
            "probabilities": probabilities,
            "probability_percent": probability_percent,
            "positive_index": positive_index,
            "raw_score": raw_score,
            "source": str(self.spec["model"]),
        }

    def info(self):
        model, _ = self._require()
        return {
            "name": self.name,
            "n_features": self.n_features,
            "multiclass": self.multiclass,
            "classes": self._class_names,
            "estimator": type(_estimator_of(model)).__name__,
            "model_file": self.spec["model"],
            "loaded_at": self._loaded_at,
        }


class ModelRegistry:
    def __init__(self, models_dir=settings.models_dir):
        self.models_dir = models_dir
        self._handles = {}

    def load_all(self):
        for name in MODEL_SPECS:
            self.get(name)  # forces lazy load + warm cache

    def get(self, name: str) -> ModelHandle:
        if name not in MODEL_SPECS:
            raise MLRegistryError(f"Unknown model '{name}'")
        handle = self._handles.get(name)
        if handle is None:
            handle = ModelHandle(name, MODEL_SPECS[name], self.models_dir)
            handle._require()
            self._handles[name] = handle
        return handle

    def predict(self, name: str, features):
        return self.get(name).predict(features)

    def list(self):
        return [self.get(name).info() for name in sorted(MODEL_SPECS)]


registry = ModelRegistry()


def load_all():
    registry.load_all()
    logger.info(
        "Loaded %d clinical models from %s", len(registry.list()), registry.models_dir
    )


def predict(name, features):
    try:
        return registry.predict(name, features)
    except MLRegistryError as exc:
        raise exc
    except Exception as exc:  # wrap infra errors (bad pickle, np conversion)
        raise MLRegistryError(f"Prediction failed for '{name}': {exc}") from exc