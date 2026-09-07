# Architecture

See `tlux-agent/working.md` for the full design document. This file summarizes
how the implemented code maps to that architecture.

## Services

| Component  | Directory               | Port (dev) | Stack                        |
| ---------- | ----------------------- | ---------- | ---------------------------- |
| Web        | `apps/web`              | 3000       | Next.js 16, React 19, Tailwind |
| API        | `apps/api`              | 5001       | Node.js, Express (JavaScript, Mongoose) |
| AI service | `services/ai`           | 8000       | Python, FastAPI, LangChain   |
| Database   | MongoDB Atlas          | —          | MongoDB, embeddings as `[float]` |
| Inference  | local Ollama            | 11434      | llama3.2 + bge-m3            |

## Data flow

```
Browser
  └── HTTPS ── Next.js (apps/web)
      └── Express API (apps/api)      ── auth, RBAC, business logic
          ├── MongoDB (Mongoose)      ── users, docs, conversations, chunks
          └── FastAPI AI service (services/ai)
              ├── LangChain RAG       ── retrieve → prompt → LLM
              └── Ollama              ── local open-weight LLM + embeddings
```

The frontend never calls the LLM directly; every interaction is proxied through
the Express API which owns authentication and authorization.

## Isolation guarantees

- **Multi-doctor RAG isolation**: retrieval is always filtered by `doctor_id`
  before cosine similarity is computed in Python
  (`services/ai/app/rag/retrieval.py`).
- **Patient isolation**: the API resolves the caller's patient/doctor profile
  from the JWT and rejects cross-tenant access with HTTP 403.

## No fine-tuning

Medical knowledge updates via document upload → chunk → embed → store (RAG).
Doctor behavior changes via the `aiconfigs` document (prompt-time), and the LLM
model can be swapped through the LLM provider abstraction
(`services/ai/app/llm/`).