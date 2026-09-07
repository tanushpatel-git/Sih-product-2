#!/usr/bin/env python3
"""Dev utility: ingest a local medical document for a doctor.

Usage:
    python scripts/ingest_documents.py --doctor-id <uuid> --file path.pdf [--title "Name"]
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "services" / "ai"))

from app.config import settings  # noqa: E402
from app.rag.ingestion import ingest_document  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest a medical document into RAG.")
    parser.add_argument("--doctor-id", required=True, help="doctor UUID")
    parser.add_argument("--file", required=True, help="path to PDF/TXT/MD document")
    parser.add_argument("--title", default=None, help="display title")
    parser.add_argument("--document-id", default=None, help="existing document UUID (new if omitted)")
    args = parser.parse_args()

    data = Path(args.file).read_bytes()
    count = ingest_document(
        document_id=args.document_id or "00000000-0000-0000-0000-000000000000",
        doctor_id=args.doctor_id,
        file_name=Path(args.file).name,
        file_bytes=data,
        title=args.title,
    )
    print(f"Stored {count} chunks (doctor={args.doctor_id})")


if __name__ == "__main__":
    main()