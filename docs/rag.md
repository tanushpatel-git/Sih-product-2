# RAG

End-to-end RAG pipeline implemented in `services/ai`:

```
Upload (Express API)
  └── /api/ingest (FastAPI)
      ├── extract_text()         PDF / TXT / MD
      ├── split_text()           RecursiveCharacterTextSplitter (600/75)
      ├── embed_texts()          bge-m3 embeddings via Ollama
      └── insert documentchunks  ({embedding: [float]}, doctor_id scoped)

Query (patient message)
  └── /api/query (FastAPI)
      ├── check_input()          safety + emergency
      ├── retrieve()             doctor-scoped fetch + Python cosine distance
      ├── check_relevance()      refuse if intent needs knowledge the docs lack
      ├── build_messages()       system + safety + doctor config + chunks
      │                          + summary + recent messages + question
      ├── provider.chat()        llama3.2 via Ollama
      ├── validate_grounding()   claim extraction + LLM verification + lexical
      │                          backstop (blocked claims removed / regenerated)
      └── check_output()         output safety flags
```

## Key files

- `services/ai/app/rag/ingestion.py` — extract (LangChain loaders) → chunk → embed → store
- `services/ai/app/rag/retrieval.py` — guarded vector search
- `services/ai/app/prompts/builder.py` — prompt assembly
- `services/ai/app/chains/rag.py` — orchestration
- `services/ai/app/grounding/validator.py` — claim extraction + grounding verification
- `services/ai/app/grounding/relevance.py` — retrieval-relevance gate (sec 12/32)

## Isolation

Every retrieval fetches candidates filtered by `doctor_id`, then ranks them by
cosine distance computed in Python (no Atlas `$vectorSearch` needed, so it
works against any MongoDB endpoint):

```python
rows = chunks.find({"doctor_id": doctor_id, "embedding": {"$ne": []}})
ranked = sorted(rows, key=lambda r: cosine_distance(query_vec, r["embedding"]))
```

## Testing

```
source services/ai/venv/bin/activate
python scripts/test_rag.py --doctor-id <uuid>
```