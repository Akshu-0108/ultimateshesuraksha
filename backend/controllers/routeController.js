const asyncHandler = require("../middleware/asyncHandler");
const { getRouteOptions } = require("../utils/safetyDataEngine");

// @route   POST /api/routes/plan
// @access  Public
const planRoute = asyncHandler(async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    res.status(400);
    throw new Error("Both 'origin' and 'destination' are required in the request body");
  }

  const result = getRouteOptions(origin.trim(), destination.trim());
  res.status(200).json(result);
});

module.exports = { planRoute };
