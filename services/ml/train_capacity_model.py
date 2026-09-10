"""Train the hospital-capacity forecast model on reproducible synthetic data.

Run with: services/ml/venv/bin/python services/ml/train_capacity_model.py
The generated model is intentionally not committed: it is a build artifact in
`ml-models/capacity-demand/`, like the other trained models in this project.
"""
from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error


RNG = np.random.default_rng(20260911)
FEATURES = ["icu_total", "icu_occupied", "ward_total", "ward_occupied", "opd", "emergency", "doctors", "weekday", "day_ahead", "icu_velocity", "ward_velocity", "opd_velocity", "emergency_velocity"]
TARGETS = ["icu_demand", "ward_demand", "opd_demand", "emergency_demand", "doctor_demand"]


def make_training_set(hospitals: int = 120, days: int = 150, horizon: int = 7):
    rows, labels = [], []
    for _ in range(hospitals):
        icu_total = int(RNG.integers(40, 360))
        ward_total = int(RNG.integers(max(180, icu_total * 4), max(500, icu_total * 12)))
        doctors = int(RNG.integers(20, 170))
        icu = icu_total * RNG.uniform(0.45, 0.88)
        ward = ward_total * RNG.uniform(0.45, 0.82)
        opd = RNG.uniform(100, 900)
        emergency = RNG.uniform(25, 260)
        states = []
        for day in range(days + horizon):
            weekday = day % 7
            weekly = [0.05, 0.065, 0.04, 0.02, 0.0, -0.035, -0.045][weekday]
            seasonal = np.sin(day / 365 * 2 * np.pi) * 0.018
            shock = RNG.normal(0, 0.012)
            icu = np.clip(icu * (1 + weekly * 0.30 + seasonal + shock), 0, icu_total * 1.18)
            ward = np.clip(ward * (1 + weekly * 0.42 + seasonal + shock), 0, ward_total * 1.15)
            opd = max(0, opd * (1 + weekly + seasonal + RNG.normal(0, 0.025)))
            emergency = max(0, emergency * (1 + weekly * 0.35 + RNG.normal(0, 0.03)))
            states.append((icu, ward, opd, emergency, weekday))
        for day in range(7, days):
            icu_v = states[day][0] - states[day - 1][0]
            ward_v = states[day][1] - states[day - 1][1]
            opd_v = states[day][2] - states[day - 1][2]
            emergency_v = states[day][3] - states[day - 1][3]
            for ahead in range(1, horizon + 1):
                target = states[day + ahead]
                doctor_need = max(1, (target[0] * 1.7 + target[1] * 0.35 + target[2] * 0.12 + target[3] * 0.5) / 12)
                rows.append([icu_total, states[day][0], ward_total, states[day][1], states[day][2], states[day][3], doctors, states[day][4], ahead, icu_v, ward_v, opd_v, emergency_v])
                labels.append([target[0], target[1], target[2], target[3], doctor_need])
    return np.asarray(rows, dtype=float), np.asarray(labels, dtype=float)


def main():
    X, y = make_training_set()
    split = int(len(X) * 0.85)
    model = RandomForestRegressor(n_estimators=100, max_depth=15, min_samples_leaf=3, n_jobs=-1, random_state=20260911)
    model.fit(X[:split], y[:split])
    predicted = model.predict(X[split:])
    scores = {name: round(float(value), 2) for name, value in zip(TARGETS, mean_absolute_error(y[split:], predicted, multioutput="raw_values"))}
    destination = Path(__file__).resolve().parents[2] / "ml-models" / "capacity-demand"
    destination.mkdir(parents=True, exist_ok=True)
    dataset_path = destination / "synthetic_hospital_capacity_training_data.csv"
    pd.DataFrame(np.column_stack((X, y)), columns=FEATURES + TARGETS).to_csv(dataset_path, index=False)
    joblib.dump({"model": model, "features": FEATURES, "targets": TARGETS, "training": {"dataset": "reproducible multi-hospital synthetic occupancy data", "dataset_file": dataset_path.name, "samples": int(len(X)), "validation_mae": scores, "seed": 20260911}}, destination / "synthetic_capacity_forecaster.joblib")
    print(f"Trained {len(X):,} synthetic examples. Dataset: {dataset_path}. Validation MAE: {scores}")


if __name__ == "__main__":
    main()
