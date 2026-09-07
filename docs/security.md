# Security

The full security requirements are in `tlux-agent/working.md` (§20–26). What is
implemented in code:

## Authentication & authorization

- Passwords hashed with bcrypt (12 rounds).
- JWT bearer tokens; role-based access control (`ADMIN` / `DOCTOR` / `PATIENT`).
- Route guards in `apps/api/src/middleware/auth.ts`.
- The Express API checks the caller's *own* profile id from the JWT before
  allowing access to a conversation (`assertConversationAccess`), so a
  `patient_id`/`conversation_id` supplied by the browser is never trusted.

## Multi-tenant isolation

- RAG retrieval is filtered by `doctor_id` in SQL (`services/ai/.../retrieval.py`).
- Document delete/upload routes verify the doctor owns the row.
- The AI service authenticates the API with a shared `X-AI-Key` header.

## Logging

- Structured logs contain only `request_id, timestamp, user_id, method, path,
  status, latency` — never medical message content (`apps/api/src/middleware/error.ts`).

## Encryption

- HTTPS/TLS at the edge in production; DB storage encryption and encrypted
  backups are deployment-level concerns (see `working.md` §20–21).

## Not yet implemented (roadmap)

- Prompt-injection test suite.
- Output validator hardening with a clinician-reviewed rule set.
- Encryption-at-rest for individual message rows.
- Secret rotation and vault-based key management.