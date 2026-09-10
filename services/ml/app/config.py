import os
from pathlib import Path

from dotenv import load_dotenv

# Load root .env first, then service-level .env
_here = Path(__file__).resolve().parent
root_env = _here.parent.parent.parent / ".env"
load_dotenv(root_env)
load_dotenv(_here / ".env")

# Absolute path to the trained model artifacts (ml-models/ at repo root)
_default_models_dir = _here.parent.parent.parent / "ml-models"


class Settings:
    service_port: int = int(os.getenv("ML_SERVICE_PORT", "8001"))
    models_dir: Path = Path(os.getenv("ML_MODELS_DIR", str(_default_models_dir)))


settings = Settings()