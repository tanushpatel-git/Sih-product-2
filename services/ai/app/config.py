import os
from pathlib import Path

from dotenv import load_dotenv

# Load root .env first, then service-level .env
_here = Path(__file__).resolve().parent
root_env = _here.parent.parent.parent / ".env"
load_dotenv(root_env)
load_dotenv(_here / ".env")


class Settings:
    service_port: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    # Accept the API's variable name too. This prevents a doctor upload from
    # being rejected when a deployment sets only AI_SERVICE_API_KEY.
    api_key: str = os.getenv("AI_SERVICE_API_KEY") or os.getenv(
        "API_KEY_FOR_AI", "dev-ai-key"
    )

    mongo_uri: str = os.getenv(
        "MONGODB_URI", "mongodb://localhost:27017/medchat"
    )
    mongo_db_name: str = os.getenv("MONGODB_DB", "medchat")

    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model: str = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "bge-m3")
    rag_top_k: int = int(os.getenv("RAG_TOP_K", "5"))
    embedding_dim: int = int(os.getenv("EMBEDDING_DIM", "1024"))

    # Local Whisper speech-to-text (multilingual / Hinglish compatible)
    whisper_model: str = os.getenv("WHISPER_MODEL", "small")
    whisper_device: str = os.getenv("WHISPER_DEVICE", "cpu")
    whisper_compute_type: str = os.getenv("WHISPER_COMPUTE_TYPE", "int8")

    default_temperature: float = 0.2
    default_max_tokens: int = 512


settings = Settings()
