# MedChat — Medical AI Consultation Chatbot

A privacy-focused medical consultation chatbot built around **RAG + LangChain
with no fine-tuning**. Patients chat with an AI assistant whose answers are
grounded in doctor-approved documents; doctors upload knowledge and configure
response behavior per patient relationship.

```
Next.js              Node/Express          FastAPI + LangChain          MongoDB
Patient / Doctor  →  Auth · RBAC ·      →  RAG · memory · safety   →   users · documents ·
       UI               business logic        · LLM (Ollama)              chunks · conversations
```

## Repository layout

```
apps/web        Next.js 16 frontend (patient chat, doctor dashboard)
apps/api        Node/Express backend (plain JavaScript, Mongoose)
services/ai     Python FastAPI + LangChain AI service
database        MongoDB seed data
docs            architecture / security / rag / medical-safety
scripts         ingestion + RAG smoke-test helpers
tlux-agent      working architecture document (source of truth)
```

## Tech stack

| Layer | Technology | Details |
| ----- | ---------- | ------- |
| **Frontend** | Next.js 16.3 (App Router), React 19, TypeScript | `apps/web` — patient / doctor / hospital portals, JWT auth on `localStorage`, centralized `fetch` API client (`lib/api.ts`) |
| | Tailwind CSS v4, framer-motion, lucide-react | Utility styling, UI animation, icon set |
| | 8 client-side clinical ML engines | Diabetes (XGBoost JSON trees), Stroke/Heart Disease/Anemia/Breast Cancer (logistic regression), Heart Failure (Random Forest, 800 JSON trees), Kidney (rule-based CKD staging), Liver (tuned ensemble) |
| **Backend API** | Node.js ≥ 20, Express 4.21 | `apps/api` — plain JavaScript, REST on port 5001 |
| | Mongoose 8 | MongoDB ODM + schemas (users, doctors, patients, documents, chunks, conversations, messages) |
| | jsonwebtoken, bcryptjs | JWT auth + password hashing |
| | multer, uuid, cors, dotenv | File uploads, IDs, CORS, env config |
| **AI Service** | Python ≥ 3.11, FastAPI + Uvicorn | `services/ai` — RAG/LLM service on port 8000 |
| | LangChain 0.3 (ollama, community, text-splitters) | Document ingestion, chunking, retrieval chains |
| | Ollama (llama3.1:8b chat, bge-m3 embeddings, 1024-dim) | Fully local inference + embeddings |
| | PyMongo, pydantic v2, pypdf, httpx | DB access, request models, PDF parsing, HTTP |
| **Database** | MongoDB (Atlas / local) | Collections: `users`, `doctors`, `patients`, `doctordocuments`, `documentchunks`, `conversations`, `messages`; seeded from `database/` |
| **Orchestration** | npm workspaces (monorepo) | Shared root scripts (`dev:web`, `dev:api`, `dev:ai`) |
| **Service auth** | `X-AI-Key` header | Shared secret between Express API and FastAPI (`AI_SERVICE_API_KEY` / `API_KEY_FOR_AI`) |

### Ports & service map

```
:3000  Next.js web app (apps/web)  ──▶  :5001  Express API (apps/api)
:5001  Express API (apps/api)      ──▶  :8000  FastAPI AI service (services/ai)
:8000  FastAPI AI service          ──▶  Ollama (:11434) — llama3.1:8b + bge-m3
MongoDB  ◀──  Express API + AI service (documents, chunks, users, conversations)
```

### Frontend (apps/web) dependencies

- **Runtime:** `next`, `react`, `react-dom`, `framer-motion`, `lucide-react`
- **Dev:** `typescript`, `tailwindcss`, `@tailwindcss/postcss`, `eslint`, `eslint-config-next`, `@types/*`

### Backend (apps/api) dependencies

`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `multer`, `uuid`, `cors`, `dotenv`

### AI service (services/ai) dependencies

`fastapi`, `uvicorn[standard]`, `pydantic>=2.10`, `langchain>=0.3,<1.0`, `langchain-core`, `langchain-community`, `langchain-ollama`, `langchain-text-splitters`, `pymongo[srv]`, `pypdf`, `python-multipart`, `httpx`, `faster-whisper`

## Prerequisites

- Node.js ≥ 20.9, npm
- Python ≥ 3.11
- MongoDB Atlas database (set `MONGODB_URI` in `.env`)
- Ollama with a chat model (`llama3.2`) and embedding model (`bge-m3`)

## Setup

One-time install. No Docker required.

```bash
# 1. Start Ollama and pull the models (one-time)
#    macOS: brew install ollama   |   Linux/WSL: curl -fsSL https://ollama.com/install.sh | sh
brew install ollama            # skip if already installed
ollama serve                   # leave running (defaults to :11434)
ollama pull llama3.2           # chat model
ollama pull bge-m3             # embedding model

# 2. Environment — copy and fill in
cp .env.example .env
# .env: set MONGODB_URI to your Atlas connection string (e.g. mongodb+srv://<user>:<pass>@cluster...).

# 3. JS workspaces (web + api)
npm install

# 4. Python AI service
cd services/ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ../..

# 5. Seed the database
npm run db:seed
```

## Run (three terminals, in this order)

The AI service must be up before the API (uploads and chat call it).

```bash
# Terminal 1 — AI service      http://localhost:8000
npm run dev:ai

# Terminal 2 — API             http://localhost:5001
npm run dev:api

# Terminal 3 — Web app         http://localhost:3000
npm run dev:web
```

Sanity check after start:

```bash
curl http://localhost:8000/health   # {"status":"ok","service":"ai",...}
curl http://localhost:5001/health   # {"status":"ok","service":"api","db":"mongodb"}
```

## Seed logins

| Role    | Email               | Password       |
| ------- | ------------------- | -------------- |
| Admin   | admin@medchat.dev   | admin12345     |
| Doctor  | sharma@medchat.dev  | doctor12345    |
| Doctor  | iyer@medchat.dev    | doctor12345    |
| Patient | rohan@medchat.dev   | patient12345   |
| Patient | priya@medchat.dev   | patient12345   |

## Adding a doctor's medical knowledge

As a doctor, upload a PDF/TXT/MD from the **Knowledge documents** tab. The
document is chunked, embedded (bge-m3), and stored in MongoDB scoped to that
doctor. A patient's questions then retrieve **only that doctor's** documents
via doctor-scoped cosine similarity.

## API surface (Express, port 5001)

```
POST /api/auth/register     POST /api/auth/login      GET /api/auth/me
GET  /api/doctors           GET /api/doctors/:id
GET  /api/conversations     GET /api/conversations/:id
POST /api/conversations     POST /api/conversations/:id/messages
GET/POST /api/documents     DELETE /api/documents/:id
GET/PUT /api/ai-config
GET /api/admin/users        PATCH /api/admin/users/:id/active   GET /api/admin/audit-logs
```

## AI service (FastAPI, port 8000)

```
GET  /health            POST /api/query   (RAG chat)   POST /api/ingest   (document ingestion)
```

The API and AI service authenticate to each other via the shared
`X-AI-Key` header (`API_KEY_FOR_AI` / `AI_SERVICE_API_KEY`).

### Consultation audio speech-to-text

Doctor consultation audio is transcribed **on-premise** by `faster-whisper`
(multilingual / Hinglish compatible, auto language detection — override with
`WHISPER_MODEL` / `WHISPER_DEVICE` / `WHISPER_COMPUTE_TYPE` in `.env`). The model
(default `small`) downloads from HuggingFace on first transcribe. During live
recording the web UI streams captured audio to this endpoint every few seconds
so the **Raw Consultation Transcript (STT Output)** section fills in as the
doctor and patient speak — independent of browser speech-recognition support.

## Verification

```bash
# doctor id via the API
DOCTOR_ID=$(curl -s http://localhost:5001/api/doctors \
  -H "Authorization: Bearer $(curl -s -X POST http://localhost:5001/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"email":"sharma@medchat.dev","password":"doctor12345"}' \
     | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')" \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["doctors"][0]["id"])')
source services/ai/venv/bin/activate
python scripts/test_rag.py --doctor-id "$DOCTOR_ID"
```

## Roadmap (from the architecture doc)

Encryption-at-rest, prompt-injection test suite, clinician-reviewed safety
rules, production GPU inference behind the private network.