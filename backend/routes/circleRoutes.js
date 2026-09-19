const express = require("express");
const router = express.Router();
const { createTravelRequest, getMatches, getMyRequests } = require("../controllers/circleController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createTravelRequest);
router.get("/matches", protect, getMatches);
router.get("/mine", protect, getMyRequests);

module.exports = router;
