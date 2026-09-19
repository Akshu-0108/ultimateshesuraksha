const { hashString } = require("./hash");

/**
 * Our crime dataset (delhi_crime_data.csv) has raw lat/lng per incident,
 * but the Area Safety Audit endpoint takes a locality NAME
 * (e.g. "Noida Sector 62"), not coordinates. This file maps known
 * locality names to real coordinates so we can run a "find crimes
 * within X km of this point" query.
 *
 * Coverage note: profiling the dataset showed incidents cluster heavily
 * around Noida / Ghaziabad / East Delhi (roughly 28.5-28.7N, 77.3-77.5E).
 * Central/South/West Delhi localities are included below for completeness,
 * but will often legitimately return 0 nearby records (-> safetyScore
 * defaults to 100, meaning "no known incidents nearby in this dataset"),
 * simply because this particular dataset doesn't have coverage there.
 *
 * Add more localities here as needed, or swap this whole lookup for a
 * real geocoding API (e.g. Google Geocoding, OpenStreetMap Nominatim)
 * later without changing anything else in safetyDataEngine.js.
 */
const KNOWN_LOCALITIES = {
  // Noida / Greater Noida / Ghaziabad — best data coverage in this dataset
  "noida": { lat: 28.5355, lng: 77.391 },
  "noida sector 18": { lat: 28.5708, lng: 77.3261 },
  "noida sector 62": { lat: 28.6139, lng: 77.369 },
  "greater noida": { lat: 28.4744, lng: 77.504 },
  "ghaziabad": { lat: 28.6692, lng: 77.4538 },
  "indirapuram": { lat: 28.6455, lng: 77.3728 },
  "vaishali": { lat: 28.6469, lng: 77.3381 },
  "vasundhara": { lat: 28.6603, lng: 77.3778 },

  // East Delhi
  "mayur vihar": { lat: 28.6096, lng: 77.2953 },
  "preet vihar": { lat: 28.6362, lng: 77.295 },
  "laxmi nagar": { lat: 28.6353, lng: 77.2762 },
  "karkardooma": { lat: 28.6511, lng: 77.2965 },
  "anand vihar": { lat: 28.6469, lng: 77.3157 },
  "shahdara": { lat: 28.6714, lng: 77.2887 },

  // South-East Delhi
  "okhla": { lat: 28.5355, lng: 77.291 },
  "kalindi kunj": { lat: 28.5355, lng: 77.3145 },
  "jasola": { lat: 28.5493, lng: 77.2887 },
  "nehru place": { lat: 28.5487, lng: 77.2519 },

  // Central / South / West / North Delhi (for completeness — see coverage note above)
  "connaught place": { lat: 28.6315, lng: 77.2167 },
  "karol bagh": { lat: 28.6519, lng: 77.1909 },
  "hauz khas": { lat: 28.5494, lng: 77.2001 },
  "saket": { lat: 28.5245, lng: 77.2066 },
  "vasant kunj": { lat: 28.5245, lng: 77.1591 },
  "lajpat nagar": { lat: 28.5677, lng: 77.2434 },
  "greater kailash": { lat: 28.5494, lng: 77.2425 },
  "green park": { lat: 28.5588, lng: 77.2033 },
  "malviya nagar": { lat: 28.5354, lng: 77.2088 },
  "south extension": { lat: 28.5695, lng: 77.2232 },
  "janakpuri": { lat: 28.6219, lng: 77.0878 },
  "rajouri garden": { lat: 28.6467, lng: 77.1197 },
  "dwarka": { lat: 28.5921, lng: 77.046 },
  "rohini": { lat: 28.7041, lng: 77.1025 },
  "pitampura": { lat: 28.6942, lng: 77.1315 },
  "model town": { lat: 28.7115, lng: 77.1909 },
  "chandni chowk": { lat: 28.6506, lng: 77.2303 },
  "paharganj": { lat: 28.6449, lng: 77.2167 },
};

// Dataset's real bounding box (computed from delhi_crime_data.csv),
// used to place unrecognized localities somewhere plausible rather
// than defaulting to (0,0) or erroring the whole request.
const FALLBACK_BOUNDS = {
  minLat: 28.375,
  maxLat: 29.9545,
  minLng: 76.88,
  maxLng: 77.5005,
};

/**
 * Resolves a locality name to { lat, lng }.
 * - If it's a known locality (case-insensitive), returns its real coordinates.
 * - Otherwise, deterministically maps the name to a point inside the
 *   dataset's bounding box, so an unknown locality always gets the same
 *   coordinates (and therefore the same safetyScore) on every request.
 */
function getLocalityCoordinates(locality) {
  const key = locality.toLowerCase().trim();

  if (KNOWN_LOCALITIES[key]) {
    return KNOWN_LOCALITIES[key];
  }

  const seed = hashString(key);
  const latFraction = (seed % 10000) / 10000;
  const lngFraction = ((seed * 7) % 10000) / 10000; // different multiplier so lat/lng don't move together

  const lat = FALLBACK_BOUNDS.minLat + latFraction * (FALLBACK_BOUNDS.maxLat - FALLBACK_BOUNDS.minLat);
  const lng = FALLBACK_BOUNDS.minLng + lngFraction * (FALLBACK_BOUNDS.maxLng - FALLBACK_BOUNDS.minLng);

  return { lat, lng };
}

module.exports = { getLocalityCoordinates, KNOWN_LOCALITIES };
