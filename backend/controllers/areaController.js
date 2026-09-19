const asyncHandler = require("../middleware/asyncHandler");
const { getAreaSafetyStats } = require("../utils/safetyDataEngine");

const getModelPrediction = async (locality) => {
  const serviceUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${serviceUrl}/predict?area_name=${encodeURIComponent(locality)}`, {
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (_) {
    // Crime-data scoring remains available if the optional local ML service
    // is not running, rather than making the Safety Check unusable.
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

// @route   GET /api/area-audit?locality=Koramangala&radiusKm=2
// @access  Public
// radiusKm is optional (defaults to 2) — controls how far to search for
// nearby crime records when computing safetyScore.
const getAreaAudit = asyncHandler(async (req, res) => {
  const { locality, radiusKm } = req.query;

  if (!locality || !locality.trim()) {
    res.status(400);
    throw new Error("Query param 'locality' is required, e.g. /api/area-audit?locality=Koramangala");
  }

  let radius = 2;
  if (radiusKm !== undefined) {
    radius = parseFloat(radiusKm);
    if (Number.isNaN(radius) || radius <= 0) {
      res.status(400);
      throw new Error("'radiusKm' must be a positive number");
    }
  }

  const normalizedLocality = locality.trim();
  const [stats, modelPrediction] = await Promise.all([
    getAreaSafetyStats(normalizedLocality, radius),
    getModelPrediction(normalizedLocality),
  ]);

  if (!modelPrediction) {
    return res.status(200).json({ ...stats, modelAvailable: false });
  }

  res.status(200).json({
    ...stats,
    locality: modelPrediction.area,
    safetyScore: modelPrediction.safety_score,
    safetyRating: modelPrediction.safety_rating,
    riskCode: modelPrediction.risk_code,
    saferThanPercentile: modelPrediction.safer_than_percentile,
    crimeVsAveragePercent: modelPrediction.crime_vs_average_pct,
    policeStationsNearby: modelPrediction.infrastructure.police_stations,
    busStopsNearby: modelPrediction.infrastructure.bus_stops,
    streetLightingScore: modelPrediction.infrastructure.street_lighting_rating,
    modelAvailable: true,
  });
});

module.exports = { getAreaAudit };
