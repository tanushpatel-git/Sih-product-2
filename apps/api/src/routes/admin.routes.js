const { Router } = require("express");
const { listUsers, setUserActive, listAuditLogs } = require("../controllers/admin.controller");
const { asyncHandler } = require("../utils/async");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/users", asyncHandler(listUsers));
router.patch("/users/:id/active", asyncHandler(setUserActive));
router.get("/audit-logs", asyncHandler(listAuditLogs));

module.exports = router;