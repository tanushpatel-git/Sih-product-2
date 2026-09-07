from abc import ABC, abstractmethod
from typing import Any


class LLMProvider(ABC):
    """Abstraction over a chat LLM so inference backends can be swapped."""

    @abstractmethod
    def chat(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 512,
    ) -> str:
        """Take an OpenAI-style message list and return the assistant text."""
        ...

    @abstractmethod
    def embed(self, texts: list[str]) -> list[list[float]]:
        ...