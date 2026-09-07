const { verifyToken } = require("../utils/jwt");
const { AppError } = require("../utils/async");

function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Missing authentication token", 401));
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError("Unauthenticated", 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };