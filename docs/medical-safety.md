# Medical Safety

Safety is implemented as an application-level layer (`services/ai/app/safety/`),
not left to the LLM alone.

## Layers

### Input safety — `safety/input.py`
- Rejects empty / oversized input.
- Detects emergency keywords (`safety/emergency.py`).

### Emergency handling
When emergency keywords are detected the request never reaches the LLM. The
chain short-circuits to a fixed escalation response and the conversation is
marked `escalated` by the Express API.

### Output grounding — `grounding/validator.py`
After generation, the answer is split into claims and each claim is verified
against the retrieved chunks (LLM verifier + a deterministic lexical backstop
for medication/dose/diagnosis claims). Unsupported medical claims are removed
and the answer regenerated once; if nothing safe remains, a fallback is
returned. Only medical facts need grounding — safe guidance like "consult your
doctor" always passes.

### Output safety — `safety/output.py`
Flags LLM answers that:

- make an unsupported diagnosis or give medication advice,
- are overly certain,
- mention self-harm,
- appear to leak system-prompt / sensitive data.

Flags are stored on the message row (`safety_flags`) and surfaced to the UI.

## Escalation

Conversations with emergency flags in the API flow are automatically set to
`status = 'escalated'` (`apps/api/src/controllers/conversations.controller.ts`).

## Roadmap

Emergency rules should be reviewed and extended by qualified clinicians. The
keyword list lives in `services/ai/app/safety/emergency.py` and is designed to
be data-driven.