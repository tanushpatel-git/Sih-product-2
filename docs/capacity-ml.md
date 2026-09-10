# Hospital Capacity Forecasting (ML) — How It Works

This file explains how the hospital capacity/forecast model makes predictions and
where it gets the hospital's daily data. It covers the whole path:

**Training → Model artifact → ML service → Web request payload → Daily observations**

## 1. Components involved

| Piece | File | Role |
| ----- | ---- | ---- |
| Training script | `services/ml/train_capacity_model.py` | Builds the persisted model |
| Model artifact | `ml-models/capacity-demand/synthetic_capacity_forecaster.joblib` | The trained RandomForest, loaded at runtime (not committed to git) |
| Training dataset | `ml-models/capacity-demand/synthetic_hospital_capacity_training_data.csv` | Inspectable rows the model learned from |
| ML service | `services/ml/app/capacity.py` | Loads the artifact and runs `analyze_capacity(payload)` |
| Request schema | `services/ml/app/api/capacity.py` | `POST /api/capacity/analyze` input validation |
| Next.js proxy | `apps/web/app/api/capacity/route.ts` | Forwards the browser request to the ML service on port 8001 |
| Hospital dashboard | `apps/web/app/hospital/dashboard/page.tsx` | Where hospital staff enter today's numbers |
| Seed records | `database/seeds/seed.js` (`hospitals`, `hospitalcapacitysnapshots`) | Synthetic daily observations per hospital |

## 2. What the model predicts

For **each of the next 7 days**, the model outputs 5 numbers:

- `icu_demand` — expected occupied ICU beds
- `ward_demand` / `general_demand` — expected occupied general beds
- `opd_patients` — expected OPD volume
- `emergency_patients` — expected emergency volume
- `doctor_demand` — expected clinicians needed

These are turned into a 0–100 `demand_score` and a `status` band
(`normal` / `moderate` / `high` / `critical`).

## 3. How the model is trained (synthetic data)

`train_capacity_model.py` does **not** use real hospital data. It generates a
reproducible synthetic world (seeded RNG, no randomness across runs):

1. Simulates **120 hospitals × 150+ days** of daily occupancy from a physical
   starting state (`icu_total`, `ward_total`, `doctors`).
2. Each day, occupancy evolves with injected patterns:
   - **weekday pressure** (`weekly` multipliers — Mondays/Tuesdays busier),
   - **seasonality** (`sin(day/365·2π)`),
   - **random shock** (small noise).
3. For every day it builds a **feature row** and a **label row**:

   **Features (13):**
   ```
   icu_total, icu_occupied, ward_total, ward_occupied, opd, emergency, doctors,
   weekday, day_ahead, icu_velocity, ward_velocity, opd_velocity, emergency_velocity
   ```
   `*_velocity` = the one-day change of each metric (today vs yesterday).

   **Targets (5):** the *actual future* values `ahead` days later.

4. Trains a `RandomForestRegressor` (100 trees, depth 15) on 85% of rows,
   evaluates MAE on the held-out 15% per target, and `joblib.dump`s
   `{model, features, targets, training metrics}` to
   `ml-models/capacity-demand/synthetic_capacity_forecaster.joblib`.

Rebuild it anytime with:

```bash
services/ml/venv/bin/python services/ml/train_capacity_model.py
```

## 4. How a prediction is made at runtime

`analyze_capacity(payload)` in `services/ml/app/capacity.py`:

1. **Current state** — takes today's occupancy from the request:
   ICU beds, general/ward beds, OPD, emergency, doctors.
2. **Current demand score** — a weighted composite of ICU % and ward % occupancy,
   OPD and emergency load.
3. **Trend (velocity) features** — `_recent_velocity()` reads the last **14 daily
   observations** from `history`, averages the daily deltas (favouring the latest
   7 days), and clamps the result to ±8% so one noisy day can't dominate. This is
   the key step that **calibrates the forecast to recent measured movement**.
4. **Per-day forecast** — loops `day_offset` 1→7, builds the 13-feature vector
   (today's state + target weekday + `day_offset` + the velocities), calls
   `model.predict(...)`, clamps negatives to 0, converts to the 5 demand values.
5. **Surfaces** the peak day, a `shortage_risk` flag (projected demand ≥ total
   beds), **nearby support candidates** (≤ 10 km, < 75% ICU / < 80% ward load),
   and **recommended actions** (e.g. surge staffing, coordination hospitals).

The model never returns raw probabilities — it's existing-data + a learned
synthetic baseline, and everything is labelled operational decision support.

## 5. How the model "sees" the hospital's daily info

The ML service has **no database access**. All daily data arrives in the request
body to `POST /api/capacity/analyze`:

```jsonc
{
  "icu":                { "total_beds": 300, "occupied_beds": 280 },
  "general_ward":       { "total_beds": 1500, "occupied_beds": 1200 },
  "opd_patients":       400,
  "emergency_patients": 150,
  "doctors_available":  85,
  "history": [                // ≤ 90 recent daily observations, oldest→newest
    { "icu_occupied": 249, "general_occupied": 1120, "opd_patients": 360, "emergency_patients": 126 },
    { "icu_occupied": 255, "general_occupied": 1140, "opd_patients": 372, "emergency_patients": 130 }
    // ...
  ],
  "nearby_hospitals": [
    { "name": "Green Valley Medical Centre", "distance_km": 4.8,
      "icu_total": 120, "icu_occupied": 62, "general_total": 500, "general_occupied": 275 }
  ]
}
```

Flow today:

```
Hospital staff enter today's ICU / ward / OPD / emergency / doctors
        ↓  (apps/web/app/hospital/dashboard/page.tsx form)
Fetch POST /api/capacity   ← Next.js proxy (apps/web/app/api/capacity/route.ts)
        ↓  forwards JSON to http://localhost:8001
POST ML service /api/capacity/analyze   ← validated by Pydantic (CapacityRequest)
        ↓
analyze_capacity(payload) → 7-day forecast JSON → dashboard renders it
```

## 6. Current data sources (dev) vs. intended (production)

- **Developer dashboard** (`hospital/dashboard/page.tsx`): the hospital user
  types today's snapshot into the form. The `history` and `nearby_hospitals`
  arrays are currently **hardcoded consts in the page** (see `history` at
  `page.tsx:11` and the payload at `page.tsx:29`).
- **Seed data**: `database/seeds/seed.js` writes the `hospitals` collection and
  14 daily rows per hospital into `hospitalcapacitysnapshots`. These are exactly
  the daily observations the model's `history` field needs.
- **To go production**: the dashboard should **load its real history from
  `hospitalcapacitysnapshots`** (the hospital's own daily records, matching the
  `icucapacity/icu_occupied`, `general_occupied`, `opd_patients`,
  `emergency_patients` fields) and send that in `history`, instead of the
  hardcoded array. The README (`services/ml/README.md`) recommends keeping these
  observations in the hospital database and only retraining the artifact after
  validation shows the new model beats the deployed one.

## 7. Retraining / refreshing the artifact

```bash
npm run dev:ml                      # or: cd services/ml && uvicorn app.main:app --port 8001
services/ml/venv/bin/python services/ml/train_capacity_model.py   # (re)train + rewrite the .joblib
```

The running service caches the artifact in memory on first use
(`_forecast_model()` in `capacity.py`); after retraining you must restart the ML
service so it reloads the new file.

## Key source references

- `services/ml/train_capacity_model.py:19` — feature/target lists, synthetic generation
- `services/ml/app/capacity.py:45` — `_recent_velocity` (how history becomes a feature)
- `services/ml/app/capacity.py:79` — the 7-day prediction loop + features vector
- `services/ml/app/api/capacity.py:30` — `CapacityRequest` payload schema
- `apps/web/app/hospital/dashboard/page.tsx:25` — the `analyse()` call feeding the model
- `database/seeds/seed.js:186` — the daily `hospitalcapacitysnapshots`