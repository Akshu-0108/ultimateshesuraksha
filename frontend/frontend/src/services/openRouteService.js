const ORS_BASE_URL = 'https://api.openrouteservice.org'
const apiKey = import.meta.env.VITE_ORS_API_KEY

function requireApiKey() {
  if (!apiKey) throw new Error('Location search is not configured. Add VITE_ORS_API_KEY to frontend/.env and restart Vite.')
  return apiKey
}

async function request(path, options = {}) {
  const url = new URL(`${ORS_BASE_URL}${path}`)
  // ORS's geocoding endpoint does not permit the Authorization request header
  // from browser origins during CORS preflight. Supplying the key as a query
  // parameter is supported by ORS and keeps autocomplete available in Vite.
  url.searchParams.set('api_key', requireApiKey())
  const response = await fetch(url, {
    ...options,
    headers: { ...options.headers },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error?.message || 'Location service is unavailable. Please try again.')
  return payload
}

export async function findLocations(query, signal) {
  if (query.trim().length < 3) return []
  const params = new URLSearchParams({ text: query.trim(), 'boundary.country': 'IN', size: '5' })
  const result = await request(`/geocode/autocomplete?${params}`, { signal })
  return (result.features || []).map((feature) => ({
    label: feature.properties?.label || feature.properties?.name,
    coordinates: feature.geometry?.coordinates,
  })).filter((location) => location.label && Array.isArray(location.coordinates))
}

export async function findRoutes(origin, destination, travelMode = 'walking') {
  const profile = travelMode === 'car' ? 'driving-car' : 'foot-walking'
  const result = await request(`/v2/directions/${profile}/geojson`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      coordinates: [origin, destination],
      instructions: true,
      alternative_routes: { target_count: 3, weight_factor: 1.4, share_factor: 0.6 },
    }),
  })
  const routes = (result.features || []).filter((route) => route?.geometry?.coordinates?.length && route.properties?.summary)
  if (!routes.length) throw new Error('No walking route was found for these locations.')
  return routes.map((route) => ({
    points: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceKm: Number((route.properties.summary.distance / 1000).toFixed(1)),
    estimatedTimeMinutes: Math.max(1, Math.round(route.properties.summary.duration / 60)),
    directions: (route.properties.segments || []).flatMap((segment) => segment.steps || []).map((step) => ({
      instruction: step.instruction,
      distanceMeters: step.distance,
      durationSeconds: step.duration,
    })),
  }))
}
