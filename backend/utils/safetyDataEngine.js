/**
 * SAFETY DATA ENGINE
 * ------------------------------------------------------------------
 * getAreaSafetyStats() is now DATA-DRIVEN for `safetyScore`: it queries
 * real Delhi-NCR crime incidents (loaded from delhi_crime_data.csv into
 * the CrimeRecord collection at server startup — see seedCrimeData.js)
 * within a radius of the locality's coordinates, and derives the score
 * from how many incidents are nearby and how severe they are.
 *
 * illuminationPercent, crowdDensityLevel, safeHavenCount, and
 * policeResponseTimeMinutes are STILL simulated (deterministic, seeded
 * by the locality name) — we don't have real data sources for those yet.
 * Swap them out the same way later (see comments below).
 *
 * getRouteOptions() is unchanged — still fully simulated.
 *
 * The RESPONSE SHAPE returned by getAreaSafetyStats() is identical to
 * before: { locality, illuminationPercent, crowdDensityLevel,
 * safeHavenCount, policeResponseTimeMinutes, safetyScore, lastUpdated }.
 * ------------------------------------------------------------------
 */

const CrimeRecord = require("../models/CrimeRecord");
const { hashString, seededRandom } = require("./hash");
const { getLocalityCoordinates } = require("./localityCoordinates");

const CROWD_LEVELS = ["low", "moderate", "high", "very high"];

// Default search radius for "nearby crime" when the caller doesn't specify one.
const DEFAULT_RADIUS_KM = 2;

// Tunable constant: controls how quickly the safety score drops as nearby
// crime severity accumulates. Lower = score drops faster with fewer/less
// severe incidents. Raise this if scores feel too harsh, lower it if areas
// with real incidents still score too high. Calibrated against this
// dataset: median nearby severity-sum ~83, max ~350.
const SEVERITY_SATURATION_K = 200;

/**
 * Turns a list of nearby crime records into a 0-100 safety score.
 * - 0 nearby records -> 100 (no known incidents in this dataset nearby)
 * - More records, and/or higher severity per record -> score drops
 * - Uses a saturating curve so score approaches (but never quite hits) 0,
 *   and a single minor incident doesn't tank the score.
 */
function computeCrimeSafetyScore(nearbyRecords) {
  if (nearbyRecords.length === 0) return 100;

  const severityWeightedSum = nearbyRecords.reduce((sum, r) => sum + r.severity, 0);
  const penalty = 100 * (1 - Math.exp(-severityWeightedSum / SEVERITY_SATURATION_K));

  return Math.round(Math.max(0, Math.min(100, 100 - penalty)));
}

/**
 * @param {string} locality - locality name from the query string
 * @param {number} radiusKm - search radius for nearby crime records (default 2km)
 */
async function getAreaSafetyStats(locality, radiusKm = DEFAULT_RADIUS_KM) {
  const trimmedLocality = locality.trim();
  const seed = hashString(trimmedLocality.toLowerCase());

  // --- Still simulated (no real data source for these yet) ---
  const illuminationPercent = seededRandom(seed * 1.1, 35, 95);
  const crowdDensityLevel = CROWD_LEVELS[seededRandom(seed * 1.2, 0, 3)];
  const safeHavenCount = seededRandom(seed * 1.3, 1, 20);
  const policeResponseTimeMinutes = seededRandom(seed * 1.4, 3, 18);

  // --- Data-driven: real crime records near this locality's coordinates ---
  const { lat, lng } = getLocalityCoordinates(trimmedLocality);

  const nearbyRecords = await CrimeRecord.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000, // $maxDistance is in meters
      },
    },
  }).lean();

  const safetyScore = computeCrimeSafetyScore(nearbyRecords);

  return {
    locality: trimmedLocality,
    illuminationPercent,
    crowdDensityLevel,
    safeHavenCount,
    policeResponseTimeMinutes,
    safetyScore,
    lastUpdated: new Date().toISOString(),
  };
}

const ROUTE_NAME_PREFIXES = ["Main Road Route", "Well-Lit Bypass", "Market Street Route", "Highway Route"];

// Unchanged — still fully simulated (no real routing/lighting/CCTV data source yet).
function getRouteOptions(origin, destination) {
  const baseSeed = hashString(
    `${origin.toLowerCase().trim()}->${destination.toLowerCase().trim()}`
  );

  const numRoutes = seededRandom(baseSeed, 2, 3);
  const routes = [];

  for (let i = 0; i < numRoutes; i++) {
    const seed = baseSeed * (i + 2);

    const lightingScore = seededRandom(seed * 1.1, 30, 95);
    const crowdScore = seededRandom(seed * 1.2, 30, 95);
    const cctvCoverageScore = seededRandom(seed * 1.3, 20, 95);

    const safetyScore = Math.round(
      (lightingScore + crowdScore + cctvCoverageScore) / 3
    );

    routes.push({
      routeId: `route_${baseSeed}_${i}`,
      routeName: ROUTE_NAME_PREFIXES[(baseSeed + i) % ROUTE_NAME_PREFIXES.length],
      estimatedTimeMinutes: seededRandom(seed * 1.4, 10, 45),
      distanceKm: Number((seededRandom(seed * 1.5, 20, 150) / 10).toFixed(1)),
      safetyScore,
      breakdown: {
        lightingScore,
        crowdScore,
        cctvCoverageScore,
      },
    });
  }

  routes.sort((a, b) => b.safetyScore - a.safetyScore);
  return { origin, destination, routes };
}

module.exports = { getAreaSafetyStats, getRouteOptions };
