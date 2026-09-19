import { useState } from 'react'
import { Navigation, Clock, Ruler, Lightbulb, Users, Camera, } from 'lucide-react'
import faceIcon from '../assets/face-icon.png'

// Shaped exactly like POST /routes/plan response
const MOCK_ROUTES = {
  'Connaught Circle Inner Avenue|Metro Heights, Green Park Ext': [
    {
      routeId: 'route_48213_0',
      routeName: 'Avenue of Lights & Commercial Arc',
      estimatedTimeMinutes: 18,
      distanceKm: 4.8,
      safetyScore: 96,
      breakdown: { lightingScore: 98, crowdScore: 85, cctvCoverageScore: 94 },
    },
    {
      routeId: 'route_48213_1',
      routeName: 'Main Arterial Transit Way',
      estimatedTimeMinutes: 15,
      distanceKm: 4.1,
      safetyScore: 88,
      breakdown: { lightingScore: 82, crowdScore: 78, cctvCoverageScore: 76 },
    },
    {
      routeId: 'route_48213_2',
      routeName: 'Direct (or Through-Alley) Lane',
      estimatedTimeMinutes: 11,
      distanceKm: 3.5,
      safetyScore: 71,
      breakdown: { lightingScore: 48, crowdScore: 40, cctvCoverageScore: 55 },
    },
  ],
}

function badgeForScore(score) {
  if (score >= 90) return { label: 'Safe Haven Route', color: '#3fae6a' }
  if (score >= 80) return { label: 'Balanced Transit', color: '#d4a24c' }
  return { label: 'Fastest Only — Not Recommended', color: '#c93a2e' }
}

function scoreRingColor(score) {
  if (score >= 90) return '#3fae6a'
  if (score >= 80) return '#d4a24c'
  return '#c93a2e'
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5 text-burgundy-dark/70 text-xs">
      <Icon size={13} />
      <span>{label}: <span className="font-semibold text-burgundy-dark">{value}</span></span>
    </div>
  )
}

function RouteCard({ route }) {
  const badge = badgeForScore(route.safetyScore)
  return (
    <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1">
        <span
          className="inline-block text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full mb-2 text-white"
          style={{ backgroundColor: badge.color }}
        >
          {badge.label}
        </span>
        <h3 className="font-display text-burgundy-dark text-lg font-bold mb-2">
          {route.routeName}
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
          <MiniStat icon={Clock} label="Time" value={`${route.estimatedTimeMinutes} min`} />
          <MiniStat icon={Ruler} label="Distance" value={`${route.distanceKm} km`} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <MiniStat icon={Lightbulb} label="Lighting" value={`${route.breakdown.lightingScore}%`} />
          <MiniStat icon={Users} label="Crowd" value={`${route.breakdown.crowdScore}%`} />
          <MiniStat icon={Camera} label="CCTV" value={`${route.breakdown.cctvCoverageScore}%`} />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center px-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
          style={{ backgroundColor: scoreRingColor(route.safetyScore) }}
        >
          {route.safetyScore}
        </div>
        <span className="text-[10px] text-burgundy-dark/50 mt-1 uppercase tracking-wide">Safety</span>
      </div>
    </div>
  )
}

function RoutePlanner() {
  const [origin, setOrigin] = useState('Connaught Circle Inner Avenue')
  const [destination, setDestination] = useState('Metro Heights, Green Park Ext')
  const [routes, setRoutes] = useState(
    MOCK_ROUTES['Connaught Circle Inner Avenue|Metro Heights, Green Park Ext']
  )

  const handlePlan = (e) => {
    e.preventDefault()
    // In the real app: POST /routes/plan with { origin, destination }
    const key = `${origin}|${destination}`
    setRoutes(MOCK_ROUTES[key] || MOCK_ROUTES['Connaught Circle Inner Avenue|Metro Heights, Green Park Ext'])
  }

  return (
    <div className="wine-photo-background min-h-screen px-4 py-10 flex justify-center">
      <div className="max-w-3xl w-full">
               <div className="flex items-center gap-3 mb-4">
          <img src={faceIcon} alt="SheSuraksha" className="w-8 h-auto" />
        </div>
        <h1 className="font-display text-burgundy-dark text-3xl md:text-4xl font-bold mb-6">
          Plan your journey with predictive safety intelligence
        </h1>

        <form
          onSubmit={handlePlan}
          className="bg-white rounded-2xl border border-burgundy/10 shadow-sm p-5 flex flex-col md:flex-row gap-4 mb-8"
        >
          <label className="flex-1 flex flex-col gap-1">
            <span className="text-burgundy-dark/50 text-xs uppercase tracking-wide">
              Starting Location
            </span>
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="border border-burgundy/15 rounded-lg px-3 py-2 text-sm text-burgundy-dark outline-none focus:border-burgundy"
            />
          </label>
          <label className="flex-1 flex flex-col gap-1">
            <span className="text-burgundy-dark/50 text-xs uppercase tracking-wide">
              Destination
            </span>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="border border-burgundy/15 rounded-lg px-3 py-2 text-sm text-burgundy-dark outline-none focus:border-burgundy"
            />
          </label>
          <button
            type="submit"
            className="flex items-center gap-2 bg-burgundy text-cream font-semibold px-5 py-2 rounded-full hover:bg-burgundy-light transition self-end"
          >
            <Navigation size={16} />
            Update Routes
          </button>
        </form>

        <div className="flex flex-col gap-4">
          {routes.map((route) => (
            <RouteCard key={route.routeId} route={route} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoutePlanner
