import { useEffect, useState } from 'react'
import { Download, MapPin, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api, auth } from '../services/api'
import AmbientDots from '../components/AmbientDots'
import { downloadRouteSummary } from '../services/mapDownload'

function SavedRoutes() {
  const [routes, setRoutes] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    if (!auth.getToken()) return
    api('/saved-routes').then(({ routes: saved }) => setRoutes(saved)).catch((requestError) => setError(requestError.message))
  }, [])
  const removeRoute = async (id) => {
    try { await api(`/saved-routes/${id}`, { method: 'DELETE' }); setRoutes((current) => current.filter((route) => route.savedRouteId !== id)) }
    catch (requestError) { setError(requestError.message) }
  }
  const downloadRoute = (route) => {
    downloadRouteSummary({
      routeName: route.routeName,
      origin: route.origin,
      destination: route.destination,
      distance: `${route.distanceKm} km`,
      duration: `${route.estimatedTimeMinutes} min`,
      safetyScore: route.safetyScore,
      risk: route.riskLevel ?? 'Route safety guidance',
    })
  }
  return <main className="soft-cream-page min-h-screen px-5 py-10 text-burgundy-dark motion-page"><AmbientDots /><div className="relative mx-auto max-w-3xl"><Link to="/dashboard" className="text-sm font-semibold text-burgundy-dark/80 hover:text-burgundy hover:underline">← Back to dashboard</Link><h1 className="mt-5 font-display text-5xl font-bold">Saved paths</h1><p className="mt-3 text-burgundy-dark/70">Saved routes are available from your safety profile on any device.</p>{!auth.getToken() && <p className="mt-3 text-sm text-burgundy">Create a safety profile to save and view routes.</p>}{error && <p className="mt-3 text-sm text-red-700">{error}</p>}<div className="mt-8 space-y-4">{routes.length === 0 ? <div className="rounded-3xl border border-gold/25 bg-cream p-8 text-center text-burgundy-dark"><MapPin className="mx-auto text-gold" size={30} /><h2 className="mt-4 font-display text-2xl font-bold">No saved routes yet</h2><Link to="/safety-map" className="mt-5 inline-block rounded-full bg-burgundy px-5 py-3 text-sm font-semibold text-cream">Plan a safe route</Link></div> : routes.map((route) => <article key={route.savedRouteId} className="rounded-3xl border border-gold/20 bg-[#fffdf7]/95 p-6 text-burgundy-dark shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="rounded-full bg-[#e7f1e8] px-3 py-1 text-xs font-semibold text-[#356a47]">{route.safetyScore}/100 safety</span><h2 className="mt-3 font-display text-3xl font-bold">{route.routeName}</h2><p className="mt-2 text-burgundy-dark/70">{route.origin} → {route.destination}</p><p className="mt-2 text-sm text-burgundy-dark/55">{route.estimatedTimeMinutes} min · {route.distanceKm} km · {route.riskLevel} risk</p></div><div className="flex gap-2"><button onClick={() => downloadRoute(route)} className="rounded-full border border-burgundy/20 p-3 text-burgundy" aria-label="Download route details"><Download size={17} /></button><button onClick={() => removeRoute(route.savedRouteId)} className="rounded-full border border-burgundy/20 p-3 text-burgundy" aria-label="Remove saved route"><Trash2 size={17} /></button></div></div></article>)}</div></div></main>
}
export default SavedRoutes
