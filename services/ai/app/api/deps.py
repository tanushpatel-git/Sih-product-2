from fastapi import Header, HTTPException

from ..config import settings


def verify_ai_key(x_ai_key: str | None = Header(default=None)) -> str:
    if not x_ai_key or x_ai_key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid AI service key")
    return x_ai_key