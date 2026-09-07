from typing import Any

from langchain_core.language_models.llms import BaseLLM
from langchain_ollama import ChatOllama
from langchain_ollama import OllamaEmbeddings

from .base import LLMProvider
from ..config import settings


class OllamaProvider(LLMProvider):
    """Chat + embeddings via a local Ollama server."""

    def __init__(
        self,
        base_url: str = settings.ollama_base_url,
        model: str = settings.ollama_model,
        embedding_model: str = settings.embedding_model,
    ) -> None:
        self.base_url = base_url
        self.model = model
        self.embedding_model = embedding_model
        self._chat: ChatOllama = ChatOllama(
            base_url=base_url, model=model, temperature=0.2, max_tokens=512
        )
        self._embeddings = OllamaEmbeddings(
            base_url=base_url, model=embedding_model
        )

    def chat(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 512,
    ) -> str:
        msg = [{"role": m["role"], "content": m["content"]} for m in messages]
        chat = ChatOllama(
            base_url=self.base_url, model=self.model, temperature=temperature, max_tokens=max_tokens
        )
        response = chat.invoke(msg)
        return getattr(response, "content", "")

    def embed(self, texts: list[str]) -> list[list[float]]:
        return self._embeddings.embed_documents(texts)

    def embed_query(self, text: str) -> list[float]:
        return self._embeddings.embed_query(text)


provider = OllamaProvider()

# Factory used by the prompts/chains layer if it needs a specific provider.
def get_provider() -> LLMProvider:
    return provider