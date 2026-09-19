const asyncHandler = require("../middleware/asyncHandler");
const SavedRoute = require("../models/SavedRoute");

const serializeRoute = (route) => ({
  savedRouteId: route._id,
  routeId: route.routeId,
  routeName: route.routeName,
  origin: route.origin,
  destination: route.destination,
  distanceKm: route.distanceKm,
  estimatedTimeMinutes: route.estimatedTimeMinutes,
  safetyScore: route.safetyScore,
  riskLevel: route.safetyScore >= 80 ? "Low" : route.safetyScore >= 60 ? "Moderate" : "High",
  createdAt: route.createdAt,
});

// @route   POST /api/saved-routes
// @access  Private
const saveRoute = asyncHandler(async (req, res) => {
  const { routeId, routeName, origin, destination, distanceKm, estimatedTimeMinutes, safetyScore } = req.body;

  if (![routeId, routeName, origin, destination].every((value) => typeof value === "string" && value.trim())) {
    res.status(400);
    throw new Error("routeId, routeName, origin, and destination are required");
  }

  const numericFields = { distanceKm, estimatedTimeMinutes, safetyScore };
  if (Object.values(numericFields).some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    res.status(400);
    throw new Error("distanceKm, estimatedTimeMinutes, and safetyScore must be valid numbers");
  }
  if (distanceKm < 0 || estimatedTimeMinutes < 0 || safetyScore < 0 || safetyScore > 100) {
    res.status(400);
    throw new Error("Route distance/time must be positive and safetyScore must be between 0 and 100");
  }

  const route = await SavedRoute.findOneAndUpdate(
    { user: req.user._id, routeId: routeId.trim() },
    {
      routeName: routeName.trim(),
      origin: origin.trim(),
      destination: destination.trim(),
      distanceKm,
      estimatedTimeMinutes,
      safetyScore,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(serializeRoute(route));
});

// @route   GET /api/saved-routes
// @access  Private
const getSavedRoutes = asyncHandler(async (req, res) => {
  const routes = await SavedRoute.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ routes: routes.map(serializeRoute) });
});

// @route   DELETE /api/saved-routes/:id
// @access  Private
const deleteSavedRoute = asyncHandler(async (req, res) => {
  const route = await SavedRoute.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!route) {
    res.status(404);
    throw new Error("Saved route not found");
  }
  res.status(204).send();
});

module.exports = { saveRoute, getSavedRoutes, deleteSavedRoute };
