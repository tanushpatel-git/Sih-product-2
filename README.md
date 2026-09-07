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