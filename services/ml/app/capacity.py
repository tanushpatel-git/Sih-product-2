"""Capacity-demand forecasting for hospital operations.

This is intentionally separate from the clinical diagnostic models.  It starts
with a deterministic synthetic baseline (weekday pressure, admissions trend and
seasonality) and adapts the forecast to recent operational observations.  The
output is decision support: it never authorises a transfer or a staffing move.
"""
from __future__ import annotations

from datetime import date, timedelta
from pathlib import Path

import joblib
import numpy as np


_MODEL_PATH = Path(__file__).resolve().parents[3] / "ml-models" / "capacity-demand" / "synthetic_capacity_forecaster.joblib"
_MODEL_ARTIFACT = None


def _forecast_model():
    """Load the persisted model trained by train_capacity_model.py once."""
    global _MODEL_ARTIFACT
    if _MODEL_ARTIFACT is None:
        if not _MODEL_PATH.exists():
            raise RuntimeError("Capacity model artifact is missing. Run services/ml/train_capacity_model.py first.")
        _MODEL_ARTIFACT = joblib.load(_MODEL_PATH)
    return _MODEL_ARTIFACT


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _status(percent: float) -> str:
    if percent >= 92:
        return "critical"
    if percent >= 80:
        return "high"
    if percent >= 65:
        return "moderate"
    return "normal"


def _recent_velocity(history: list[dict], field: str, fallback: float) -> float:
    """Smoothed daily movement, capped so a noisy day cannot dominate."""
    values = [float(row.get(field, fallback)) for row in history[-14:] if row.get(field) is not None]
    if len(values) < 2:
        return 0.0
    deltas = [values[i] - values[i - 1] for i in range(1, len(values))]
    # Favor the latest week, but retain a stabilising historic component.
    recent = deltas[-7:]
    velocity = sum(recent) / len(recent)
    return _clamp(velocity, -fallback * 0.08, fallback * 0.08)


def analyze_capacity(payload: dict) -> dict:
    artifact = _forecast_model()
    model = artifact["model"]
    icu = payload["icu"]
    ward = payload["general_ward"]
    opd_patients = payload["opd_patients"]
    emergency_patients = payload["emergency_patients"]
    doctors_available = payload["doctors_available"]
    history = payload.get("history", [])
    nearby = payload.get("nearby_hospitals", [])

    icu_pct = icu["occupied_beds"] / icu["total_beds"] * 100
    ward_pct = ward["occupied_beds"] / ward["total_beds"] * 100
    demand_score = 0.45 * icu_pct + 0.30 * ward_pct + min(opd_patients / 7, 100) * 0.15 + min(emergency_patients / 2, 100) * 0.10

    icu_velocity = _recent_velocity(history, "icu_occupied", icu["occupied_beds"])
    ward_velocity = _recent_velocity(history, "general_occupied", ward["occupied_beds"])
    opd_velocity = _recent_velocity(history, "opd_patients", opd_patients)
    emergency_velocity = _recent_velocity(history, "emergency_patients", emergency_patients)
    today = date.today()
    forecast = []

    for day_offset in range(1, 8):
        forecast_date = today + timedelta(days=day_offset)
        # The persisted RandomForest was trained on multi-hospital synthetic daily
        # sequences. Recent measured movement is supplied as a feature, so real
        # observations continually calibrate future requests.
        features = np.asarray([[icu["total_beds"], icu["occupied_beds"], ward["total_beds"], ward["occupied_beds"], opd_patients, emergency_patients, doctors_available, forecast_date.weekday(), day_offset, icu_velocity, ward_velocity, opd_velocity, emergency_velocity]])
        prediction = model.predict(features)[0]
        icu_demand = round(max(0, prediction[0]))
        ward_demand = round(max(0, prediction[1]))
        predicted_opd = round(max(0, prediction[2]))
        predicted_emergency = round(max(0, prediction[3]))
        doctor_demand = round(max(1, prediction[4]))
        composite = (icu_demand / icu["total_beds"] * 50 + ward_demand / ward["total_beds"] * 35 + min(predicted_opd / 7, 100) * 0.10 + min(predicted_emergency / 2, 100) * 0.05)
        forecast.append({
            "date": forecast_date.isoformat(), "day": forecast_date.strftime("%a"),
            "icu_demand": icu_demand, "general_demand": ward_demand,
            "opd_patients": predicted_opd, "emergency_patients": predicted_emergency,
            "doctor_demand": doctor_demand, "demand_score": round(_clamp(composite, 0, 100)),
            "status": _status(_clamp(composite, 0, 100)),
        })

    peak = max(forecast, key=lambda item: item["demand_score"])
    candidates = []
    for hospital in nearby:
        distance = float(hospital["distance_km"])
        nearby_icu_pct = hospital["icu_occupied"] / hospital["icu_total"] * 100
        nearby_ward_pct = hospital["general_occupied"] / hospital["general_total"] * 100
        spare_icu = hospital["icu_total"] - hospital["icu_occupied"]
        spare_ward = hospital["general_total"] - hospital["general_occupied"]
        if distance <= 10 and nearby_icu_pct < 75 and nearby_ward_pct < 80:
            candidates.append({"name": hospital["name"], "distance_km": distance, "available_icu_beds": spare_icu, "available_general_beds": spare_ward, "status": _status(max(nearby_icu_pct, nearby_ward_pct))})
    candidates.sort(key=lambda item: (item["distance_km"], -item["available_icu_beds"]))

    shortage_risk = peak["icu_demand"] >= icu["total_beds"] or peak["general_demand"] >= ward["total_beds"]
    actions = []
    if peak["icu_demand"] >= icu["total_beds"] * 0.92:
        actions.append("Review ICU admissions and surge staffing before the projected peak.")
    if peak["doctor_demand"] > doctors_available:
        actions.append(f"Plan for approximately {peak['doctor_demand'] - doctors_available} additional clinicians on {peak['day']}.")
    if candidates:
        actions.append(f"Coordinate with {candidates[0]['name']} ({candidates[0]['distance_km']:.1f} km) as a potential support option; confirm capacity directly before any transfer.")
    if not actions:
        actions.append("Maintain daily monitoring; no capacity intervention is predicted in the next seven days.")

    return {
        "model": {"name": "synthetic-capacity-random-forest-v1", "history_observations_used": len(history), "method": "persisted RandomForest trained on reproducible multi-hospital synthetic data + recent trend features", "training_samples": artifact["training"]["samples"], "validation_mae": artifact["training"]["validation_mae"]},
        "current": {"icu_occupancy_percent": round(icu_pct, 1), "icu_available_beds": icu["total_beds"] - icu["occupied_beds"], "general_occupancy_percent": round(ward_pct, 1), "general_available_beds": ward["total_beds"] - ward["occupied_beds"], "overall_demand_score": round(demand_score), "status": _status(demand_score)},
        "forecast": forecast, "peak": peak, "shortage_risk": shortage_risk,
        "nearby_support_candidates": candidates, "recommended_actions": actions,
        "disclaimer": "Forecast is operational decision support based on supplied and synthetic data. Validate with clinical and operations leadership before changing admissions, staffing, or transfers.",
    }
