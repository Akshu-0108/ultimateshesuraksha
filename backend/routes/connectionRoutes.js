const express = require("express");
const router = express.Router();
const {
  sendRequest,
  acceptRequest,
  declineRequest,
  getMyConnections,
  getPendingRequests,
} = require("../controllers/connectionController");
const { protect } = require("../middleware/authMiddleware");

router.post("/request", protect, sendRequest);
router.put("/:id/accept", protect, acceptRequest);
router.put("/:id/decline", protect, declineRequest);
router.get("/requests", protect, getPendingRequests);
router.get("/", protect, getMyConnections);

module.exports = router;
