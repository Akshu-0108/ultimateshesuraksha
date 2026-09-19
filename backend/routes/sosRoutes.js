const express = require("express");
const router = express.Router();
const { createSOSAlert, getSOSAlert, getSOSHistory } = require("../controllers/sosController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createSOSAlert);
router.get("/history", protect, getSOSHistory);
router.get("/:id", protect, getSOSAlert);

module.exports = router;
