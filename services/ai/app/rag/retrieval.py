from typing import Any

import math

from ..config import settings
from .embeddings import embed_query
from ..db import get_collection, oid


def _cosine_distance(a: list[float], b: list[float]) -> float:
    """Cosine distance (1 - cosine similarity) between two vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 1.0
    return 1.0 - (dot / (na * nb))


def retrieve(
    query: str,
    doctor_id: str,
    top_k: int | None = None,
) -> list[dict[str, Any]]:
    """Return the most relevant document chunks for *this doctor only*.

    The `doctor_id` filter is applied against MongoDB before any similarity
    computation, so a vector search can never leak another doctor's
    knowledge. This is the multi-doctor isolation guarantee. Cosine
    similarity is computed in Python, making it portable to any MongoDB
    endpoint (no Atlas $vectorSearch required).
    """
    k = top_k or settings.rag_top_k
    query_vec = embed_query(query)

    chunks_collection = get_collection("documentchunks")

    # Doctor-scoped fetch only (isolation enforced here).
    rows = list(
        chunks_collection.find(
            {"doctor_id": doctor_id, "embedding": {"$ne": []}}
        )
    )

    results = []
    for r in rows:
        results.append(
            {
                "chunk_id": str(r["_id"]),
                "document_id": str(r.get("document_id")),
                "doctor_id": str(r.get("doctor_id")),
                "content": r.get("content", ""),
                "page_number": r.get("page_number"),
                "section": r.get("section"),
                "chunk_index": r.get("chunk_index"),
                "metadata": r.get("metadata", {}),
                "embedding": r.get("embedding", []),
            }
        )

    # Rank by cosine distance in Python.
    for r in results:
        r["distance"] = _cosine_distance(query_vec, r["embedding"] or [])
    results.sort(key=lambda r: r["distance"])
    top = results[:k]

    # Resolve document titles for source attribution.
    if top:
        docs_collection = get_collection("doctordocuments")
        doc_ids = {r["document_id"] for r in top}
        doc_map = {
            str(d.get("_id")): d.get("title")
            for d in docs_collection.find({"_id": {"$in": [oid(d) for d in doc_ids]}})
        }
        for r in top:
            r["title"] = doc_map.get(r["document_id"], "Unknown document")

    for r in top:
        r.pop("embedding", None)
    return top