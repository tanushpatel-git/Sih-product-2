# ML Prediction Service (`services/ml`)

FastAPI service that loads the **actual trained models** from `ml-models/` and
serves real predictions to the web frontend (patient `modelDisplay`).

## Hospital capacity forecast model

The hospital dashboard uses a separate persisted `RandomForestRegressor`, not
a hard-coded occupancy calculation. It is trained on reproducible multi-hospital
synthetic daily occupancy sequences and predicts ICU demand, general-bed demand,
OPD volume, emergency volume, and doctor demand for each of the next seven days.

Train or refresh the synthetic model artifact:

```bash
services/ml/venv/bin/python services/ml/train_capacity_model.py
```

This writes `ml-models/capacity-demand/synthetic_capacity_forecaster.joblib` and
the inspectable training dataset
`ml-models/capacity-demand/synthetic_hospital_capacity_training_data.csv`.
The endpoint is `POST /api/capacity/analyze`. Supply the latest daily
observations in `history`; their smoothed movement is included as forecast
features. In production, retain these observations in a hospital database and
periodically retrain the artifact only after validation confirms the new model
is better than the currently deployed version.

## Endpoints

| Method | Path               | Description                                  |
| ------ | ------------------ | -------------------------------------------- |
| GET    | `/health`          | Health + number of loaded models             |
| GET    | `/api/models`      | Metadata for every loaded model              |
| POST   | `/api/predict/{model}` | `{"features": [number, ...]}` → prediction   |

Supported model names: `stroke`, `anemia`, `breastCancer`, `diabetes`,
`heartDisease`, `heartFailure`, `kidneyDisease`, `liverDisease`.

### POST /api/predict/{model}

Body:

```json
{ "features": [53, 1, 0, 145, 233, 1, 2, 150, 0, 2.3, 0, 0, 1] }
```

Response:

```json
{
  "model": "heartDisease",
  "n_features": 13,
  "predicted_class": "0",
  "class_index": 0,
  "classes": ["0", "1"],
  "probabilities": [0.811, 0.189],
  "probability_percent": 18.9,
  "positive_index": 1,
  "raw_score": 1.447,
  "source": "heart-disease-model/heart_disease_model.pkl"
}
```

- `probability_percent` = probability of the **positive class** for binary models
  (class `1`), or of the predicted class for the multiclass kidney model.
- `positive_index`/`raw_score` are only present when the estimator exposes them
  (logistic decision function / XGBoost margin).
- The server applies exactly the preprocessing the training notebooks used
  (zero-value median imputation for diabetes, the separate `*_scaler.pkl`,
  and the internal `Pipeline`/`ColumnTransformer` steps).

## Run

```bash
cd services/ml
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Or from the repo root: `npm run dev:ml` (reads the root `.env`).

Config (env): `ML_SERVICE_PORT` (default `8001`), `ML_MODELS_DIR` (default repo
`ml-models/`).

Auth: none for local dev. The web frontend reaches this service **only** through
the Next.js proxy in `apps/web/app/api/ml/[model]/route.ts`, which reads
`ML_SERVICE_URL` (default `http://localhost:8001`).
