const express = require("express");
const { saveRoute, getSavedRoutes, deleteSavedRoute } = require("../controllers/savedRouteController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getSavedRoutes).post(protect, saveRoute);
router.delete("/:id", protect, deleteSavedRoute);

module.exports = router;
