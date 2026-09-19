const express = require("express");
const router = express.Router();
const { planRoute } = require("../controllers/routeController");

router.post("/plan", planRoute);

module.exports = router;
