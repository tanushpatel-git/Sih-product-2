const { AppError } = require("../utils/async");
const { config } = require("../config");

function errorHandler(err, _req, res, _next) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  if (statusCode >= 500) {
    console.error(`[error] ${err.message}`);
  }
  res.status(statusCode).json({ error: err.message || "Internal server error" });
}

/** Structured logging helper - never logs medical content. */
function logRequest(req, res, start) {
  res.on("finish", () => {
    const latency = Date.now() - start;
    const userId = req.user?.id ?? "anon";
    console.log(
      JSON.stringify({
        request_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        user_id: userId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        latency,
        node_env: config.nodeEnv,
      })
    );
  });
}

function authAiKey(req, _res, next) {
  next();
}

module.exports = { errorHandler, logRequest, authAiKey };