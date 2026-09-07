const { Router } = require("express");
const { register, login, me } = require("../controllers/auth.controller");
const { asyncHandler } = require("../utils/async");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));

module.exports = router;