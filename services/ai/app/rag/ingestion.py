import tempfile
from typing import BinaryIO

from langchain_core.documents import Document
from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
)
from langchain_community.document_loaders.word_document import Docx2txtLoader

from ..config import settings
from .chunking import split_documents
from .embeddings import embed_texts
from ..db import get_collection

SUPPORTED_EXTENSIONS = (".pdf", ".txt", ".md", ".markdown", ".docx")


def load_documents(file_name: str, file_bytes: bytes) -> list[Document]:
    """Load an uploaded file into LangChain Documents via loaders.

    TextLoader / PyPDFLoader / Docx2txtLoader follow LangChain's loader
    pattern (.load() -> List[Document]) and carry useful metadata (e.g. page
    numbers for PDFs), preserved by split_documents(). The loaders are
    swapped per file type.
    """
    name = file_name.lower()
    suffix = _suffix_for(name)

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        if suffix == ".pdf":
            return PyPDFLoader(tmp_path).load()
        if suffix == ".docx":
            return Docx2txtLoader(tmp_path).load()
        if suffix in (".txt", ".md", ".markdown"):
            return _load_text(tmp_path)
        raise ValueError(f"Unsupported document type: {file_name}")
    finally:
        import os
        os.unlink(tmp_path)


def _load_text(tmp_path: str) -> list[Document]:
    """Load a plain-text file, tolerating encodings other than UTF-8.

    TextLoader defaults to UTF-8 and fails on files saved in older Windows
    encodings (e.g. ANSI/Windows-1252). We first try UTF-8, then fall back to
    Latin-1, which can decode any byte sequence, so a doctor's .txt upload
    never dies on a decode error.
    """
    try:
        return TextLoader(tmp_path).load()
    except (RuntimeError, UnicodeDecodeError):
        return TextLoader(tmp_path, encoding="latin-1").load()


def _suffix_for(file_name: str) -> str:
    for ext in SUPPORTED_EXTENSIONS:
        if file_name.endswith(ext):
            return ext
    raise ValueError(f"Unsupported document type: {file_name}")


def ingest_document(
    document_id: str,
    doctor_id: str,
    file_name: str,
    file_bytes: bytes,
    title: str | None = None,
) -> int:
    """Extract, chunk, embed and store a doctor's document in MongoDB.

    Returns the number of vector chunks stored. Embeddings are stored as a
    plain list[float] on each chunk so vector similarity is computed in
    Python (portable to any MongoDB endpoint, no Atlas $vectorSearch needed).
    """
    chunks_collection = get_collection("documentchunks")

    documents = load_documents(file_name, file_bytes)
    chunks = split_documents([d for d in documents if d.page_content.strip()])

    # Skip empty documents instead of storing zero-vector chunks.
    chunks = [c for c in chunks if c["content"].strip()]
    if not chunks:
        return 0

    vectors = embed_texts([c["content"] for c in chunks])

    # Delete old chunks for this document (re-ingestion updates knowledge).
    chunks_collection.delete_many({"document_id": document_id})

    docs = [
        {
            "document_id": document_id,
            "doctor_id": doctor_id,
            "content": chunk["content"],
            "embedding": vector,
            "page_number": chunk["page_number"],
            "section": chunk.get("section"),
            "chunk_index": chunk["chunk_index"],
            "metadata": {
                **(chunk.get("metadata") or {}),
                "title": title or file_name,
            },
        }
        for chunk, vector in zip(chunks, vectors)
    ]
    if docs:
        chunks_collection.insert_many(docs)
    return len(chunks)