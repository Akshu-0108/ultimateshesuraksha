const express = require("express");
const router = express.Router();
const { getAreaAudit } = require("../controllers/areaController");

router.get("/", getAreaAudit);

module.exports = router;
