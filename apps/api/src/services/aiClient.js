const { config } = require("../config");
const { AppError } = require("../utils/async");

/**
 * Client that calls the FastAPI AI service. The Express backend is the only
 * component allowed to talk to the LLM.
 */
async function queryAiService(payload) {
  const res = await fetch(`${config.aiServiceUrl}/api/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-AI-Key": config.aiServiceApiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new AppError(
      `AI service error ${res.status}: ${text}`,
      res.status >= 500 ? 500 : 400
    );
  }
  return res.json();
}

async function ingestDocument(documentId, doctorId, fileBuffer, fileName) {
  const body = new FormData();
  body.append("document_id", documentId);
  body.append("doctor_id", doctorId);
  body.append(
    "file",
    new Blob([new Uint8Array(fileBuffer)], { type: "application/octet-stream" }),
    fileName
  );

  const res = await fetch(`${config.aiServiceUrl}/api/ingest`, {
    method: "POST",
    headers: {
      "X-AI-Key": config.aiServiceApiKey,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new AppError(
      `AI ingest error ${res.status}: ${text}`,
      res.status >= 500 ? 500 : 400
    );
  }
  return res.json();
}

module.exports = { queryAiService, ingestDocument };