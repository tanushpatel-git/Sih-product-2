from ..llm.provider import provider


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    return provider.embed(texts)


def embed_query(text: str) -> list[float]:
    return provider.embed_query(text)