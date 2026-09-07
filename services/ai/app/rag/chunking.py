from typing import Any

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Chunking tuned for medical documents: smaller chunks keep snippets
# focused on a single clinical topic.
DEFAULT_CHUNK_SIZE = 600
DEFAULT_CHUNK_OVERLAP = 75


def split_text(text: str, chunk_size: int = DEFAULT_CHUNK_SIZE, chunk_overlap: int = DEFAULT_CHUNK_OVERLAP) -> list[dict[str, Any]]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_text(text)
    return [
        {"content": chunk, "chunk_index": i, "page_number": None}
        for i, chunk in enumerate(chunks)
    ]


def split_documents(
    documents: list[Document],
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> list[dict[str, Any]]:
    """Chunk LangChain Documents via split_documents().

    Each chunk keeps the source Document's metadata, so page_number / section
    information from the loaders survive into the vector store (working2.md
    section 8-9).
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    split_docs = splitter.split_documents(documents)
    return [
        {
            "content": doc.page_content,
            "chunk_index": i,
            "page_number": doc.metadata.get("page"),
            "section": doc.metadata.get("section"),
            "metadata": dict(doc.metadata),
        }
        for i, doc in enumerate(split_docs)
    ]