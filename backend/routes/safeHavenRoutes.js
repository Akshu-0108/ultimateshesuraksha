const express = require("express");
const { getSafeHavens } = require("../controllers/safeHavenController");

const router = express.Router();
router.get("/", getSafeHavens);

module.exports = router;
