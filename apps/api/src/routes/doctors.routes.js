const { Router } = require("express");
const { listDoctors, getDoctor } = require("../controllers/doctors.controller");
const { asyncHandler } = require("../utils/async");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.get("/", requireAuth, asyncHandler(listDoctors));
router.get("/:id", requireAuth, asyncHandler(getDoctor));

module.exports = router;