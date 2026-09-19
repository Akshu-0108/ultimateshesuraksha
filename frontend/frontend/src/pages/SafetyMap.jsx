import { useEffect, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { Download, ExternalLink, Flag, LocateFixed, MessageSquare, Save, ShieldCheck, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import { DATASET_SUMMARY, DELHI_LOCALITIES } from '../data/localitySafety'
import { api, auth } from '../services/api'
import { downloadRouteSummary } from '../services/mapDownload'
import { findLocations, findRoutes } from '../services/openRouteService'

const ROUTES = [
  { id: 'green', name: 'Green Path', label: 'Safest', distance: '19.1 km', time: '45 min', risk: 'Low risk', score: '92/100', color: '#5d9c75' },
  { id: 'gold', name: 'Amber Path', label: 'Balanced', distance: '20.5 km', time: '46 min', risk: 'Moderate risk', score: '77/100', color: '#c88c2e' },
  { id: 'rose', name: 'Rose Path', label: 'Fastest', distance: '18.4 km', time: '39 min', risk: 'Caution', score: '54/100', color: '#d6657e' },
]

function markerColor(score) {
  if (score >= 82) return '#5d9c75'
  if (score >= 74) return '#c88c2e'
  return '#d6657e'
}

const DELHI_BOUNDS = { west: 76.78, east: 77.55, north: 29.08, south: 28.35 }

function localityPosition({ x, y }) {
  return [
    DELHI_BOUNDS.north - ((y / 100) * (DELHI_BOUNDS.north - DELHI_BOUNDS.south)),
    DELHI_BOUNDS.west + ((x / 100) * (DELHI_BOUNDS.east - DELHI_BOUNDS.west)),
  ]
}

function localityIcon(locality) {
  return divIcon({
    className: 'numbered-locality-marker',
    html: `<span style="background:${markerColor(locality.score)}">${locality.reports}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function SafetyMap() {
  const navigate = useNavigate()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [originSuggestions, setOriginSuggestions] = useState([])
  const [destinationSuggestions, setDestinationSuggestions] = useState([])
  const [originCoordinates, setOriginCoordinates] = useState(null)
  const [destinationCoordinates, setDestinationCoordinates] = useState(null)
  const [routeGeometry, setRouteGeometry] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(ROUTES[0])
  const [routeOptions, setRouteOptions] = useState([])
  const [savedMessage, setSavedMessage] = useState('')
  const [isPlanning, setIsPlanning] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [reportMessage, setReportMessage] = useState('')
  const [reportCategory, setReportCategory] = useState('Broken streetlight')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [travelMode, setTravelMode] = useState('walking')
  const hasRouteSearch = origin.trim() && destination.trim()

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      if (origin.trim().length < 3 || originCoordinates) { setOriginSuggestions([]); return }
      try { setOriginSuggestions(await findLocations(origin, controller.signal)) } catch (error) { if (error.name !== 'AbortError') setSavedMessage(error.message) }
    }, 300)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [origin, originCoordinates])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      if (destination.trim().length < 3 || destinationCoordinates) { setDestinationSuggestions([]); return }
      try { setDestinationSuggestions(await findLocations(destination, controller.signal)) } catch (error) { if (error.name !== 'AbortError') setSavedMessage(error.message) }
    }, 300)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [destination, destinationCoordinates])

  const planRoute = async () => {
    if (!hasRouteSearch) return
    if (!originCoordinates || !destinationCoordinates) { setSavedMessage('Type at least three characters and select a suggestion for both locations.'); return }
    setIsPlanning(true); setSavedMessage('')
    try {
      const [accurateRoutes, result] = await Promise.all([
        findRoutes(originCoordinates, destinationCoordinates, travelMode),
        api('/routes/plan', { method: 'POST', body: JSON.stringify({ origin, destination }) }),
      ])
      const routePresentation = [
        { label: 'Safest', risk: 'Low risk', color: '#5d9c75' },
        { label: 'Middle ground', risk: 'Moderate risk', color: '#c88c2e' },
        { label: 'Fastest', risk: 'Caution', color: '#d6657e' },
      ]
      const options = result.routes.slice(0, 3).map((route, index) => {
        const accurateRoute = accurateRoutes[index] || accurateRoutes[0]
        return { ...route, ...routePresentation[index], id: route.routeId, name: route.routeName, time: `${accurateRoute.estimatedTimeMinutes} min`, distance: `${accurateRoute.distanceKm} km`, score: `${route.safetyScore}/100`, geometry: accurateRoute.points, directions: accurateRoute.directions }
      })
      setRouteGeometry(options[0].geometry); setRouteOptions(options); setSelectedRoute(options[0])
    } catch (requestError) { setSavedMessage(requestError.message) } finally { setIsPlanning(false) }
  }

  const saveRoute = async (download = false) => {
    const route = { routeId: selectedRoute.routeId || selectedRoute.id, routeName: selectedRoute.name, origin, destination, distanceKm: selectedRoute.distanceKm ?? Number.parseFloat(selectedRoute.distance), estimatedTimeMinutes: selectedRoute.estimatedTimeMinutes ?? Number.parseFloat(selectedRoute.time), safetyScore: selectedRoute.safetyScore ?? Number.parseFloat(selectedRoute.score) }
    if (!auth.getToken()) { setSavedMessage('Create a safety profile before saving routes.'); return }
    try {
      await api('/saved-routes', { method: 'POST', body: JSON.stringify(route) })
    } catch (requestError) { setSavedMessage(requestError.message); return }
    if (download) {
      downloadRouteSummary({ routeName: selectedRoute.name, origin, destination, distance: selectedRoute.distance ?? `${route.distanceKm} km`, duration: selectedRoute.time ?? `${route.estimatedTimeMinutes} min`, safetyScore: selectedRoute.score ?? route.safetyScore, risk: selectedRoute.risk ?? 'Route safety guidance', directions: selectedRoute.directions })
    }
    setSavedMessage(download ? 'Route saved and details downloaded.' : 'Route saved to your paths.')
  }

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${travelMode === 'car' ? 'driving' : 'walking'}`
  const downloadRoute = () => {
    downloadRouteSummary({ routeName: selectedRoute.name, origin, destination, distance: selectedRoute.distance, duration: selectedRoute.time, safetyScore: selectedRoute.score, risk: selectedRoute.risk, directions: selectedRoute.directions })
    setSavedMessage('Readable route summary downloaded. Open it in a browser to print or save as a PDF.')
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSavedMessage('Location access is not available in this browser. Enter your starting point manually.')
      return
    }
    setIsLocating(true)
    setSavedMessage('')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setOrigin(`Current location (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`)
        setOriginCoordinates([coords.longitude, coords.latitude])
        setSavedMessage('Current location added as your starting point.')
        setIsLocating(false)
      },
      () => {
        setSavedMessage('We could not access your location. Allow location access in your browser or enter it manually.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  return <main className="safety-map-page min-h-screen bg-[#f4f1e9] text-cream motion-page"><section className="relative h-screen w-screen overflow-hidden">
    <MapContainer center={[28.715, 77.165]} zoom={10} minZoom={8} maxZoom={16} className="safety-leaflet-map" zoomControl>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {routeGeometry.length > 0 && <Polyline positions={routeGeometry} pathOptions={{ color: selectedRoute.color, weight: 6, opacity: 0.85 }} />}
      {DELHI_LOCALITIES.map((locality) => <Marker key={locality.name} position={localityPosition(locality)} icon={localityIcon(locality)} eventHandlers={{ click: () => navigate(`/area-audit?locality=${encodeURIComponent(locality.name)}`) }}>
        <Tooltip direction="top" offset={[0, -14]} opacity={1} className="locality-tooltip"><strong>{locality.name}</strong><br />{locality.reports} reports · {locality.score}/100</Tooltip>
      </Marker>)}
    </MapContainer>

    <header className="absolute left-4 right-4 top-4 z-[500] flex items-center justify-between gap-2 pointer-events-none motion-map-overlay">
      <Link to="/dashboard" className="pointer-events-auto rounded-full border border-cream/20 bg-[#4c1728]/95 px-3 py-1.5 text-xs font-semibold text-cream shadow-sm">← Dashboard</Link>
      <div className="pointer-events-auto rounded-xl border border-cream/20 bg-[#4c1728]/95 px-3 py-2 text-cream shadow-sm"><div className="flex items-center gap-2"><span className="rounded-lg bg-gold/20 p-1.5 text-gold"><ShieldCheck size={17} /></span><strong className="font-display text-lg leading-none">SheSuraksha</strong><span className="hidden text-xs text-cream/65 sm:inline">Safe navigation</span></div></div>
      <Link to="/saved-routes" className="pointer-events-auto rounded-full border border-gold/60 bg-[#4c1728]/95 px-3 py-1.5 text-xs font-semibold text-gold shadow-sm">Saved paths</Link>
    </header>

    <aside className="absolute left-4 top-20 z-[500] w-[min(19rem,calc(100%-2rem))] rounded-2xl border border-cream/20 bg-[#260712]/95 p-3.5 text-cream shadow-lg backdrop-blur motion-map-overlay">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">Choose your path</p>
      <LocationField label="FROM" value={origin} suggestions={originSuggestions} onChange={(value) => { setOrigin(value); setOriginCoordinates(null); setRouteGeometry([]) }} onSelect={(location) => { setOrigin(location.label); setOriginCoordinates(location.coordinates); setOriginSuggestions([]) }} placeholder="Search starting point" /><button type="button" onClick={useCurrentLocation} disabled={isLocating} className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold disabled:opacity-60"><LocateFixed size={13} />{isLocating ? 'Finding your location…' : 'Use my current location'}</button>
      <LocationField label="TO" value={destination} suggestions={destinationSuggestions} onChange={(value) => { setDestination(value); setDestinationCoordinates(null); setRouteGeometry([]) }} onSelect={(location) => { setDestination(location.label); setDestinationCoordinates(location.coordinates); setDestinationSuggestions([]) }} placeholder="Search destination" />
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-cream/20 p-1 text-xs"><button type="button" onClick={() => setTravelMode('walking')} className={`rounded-md px-2 py-1.5 font-semibold transition ${travelMode === 'walking' ? 'bg-gold text-burgundy-dark' : 'text-cream/70 hover:bg-white/10'}`}>Walking</button><button type="button" onClick={() => setTravelMode('car')} className={`rounded-md px-2 py-1.5 font-semibold transition ${travelMode === 'car' ? 'bg-gold text-burgundy-dark' : 'text-cream/70 hover:bg-white/10'}`}>Car</button></div>
      <button onClick={planRoute} disabled={!hasRouteSearch || isPlanning} className="mt-3 w-full rounded-full bg-gold px-3 py-2 text-xs font-semibold text-burgundy-dark disabled:cursor-not-allowed disabled:opacity-50">{isPlanning ? 'Finding accurate routes…' : 'Find accurate routes'}</button><p className="mt-2 text-[10px] leading-4 text-cream/60">Type at least 3 characters, select each location, then find your route.</p>
    </aside>

    <div className="absolute bottom-4 left-4 z-[500] rounded-xl border border-cream/15 bg-[#4c1728]/95 p-2.5 text-[10px] text-cream shadow-sm"><strong className="mb-1 block text-gold">Locality ratings</strong><p className="text-[#a8d2b4]">● 82–100: lower reported risk</p><p className="text-gold">● 74–81: moderate reported risk</p><p className="text-[#ed879d]">● Below 74: higher reported risk</p></div>
    <div className="absolute bottom-4 right-4 z-[500] rounded-full border border-cream/15 bg-[#4c1728]/95 px-3 py-1.5 text-[10px] text-cream shadow-sm"><span className="text-gold">●</span> {DATASET_SUMMARY.totalReports} crime reports</div>

    {routeOptions.length > 0 && <aside className="absolute bottom-4 right-4 z-[500] w-[min(22rem,calc(100%-2rem))] rounded-2xl border border-[#6a273b]/15 bg-white/95 p-4 text-[#3f1625] shadow-xl backdrop-blur motion-map-overlay"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.16em] text-[#a66e18]">Selected route</p><h1 className="font-display text-2xl">{selectedRoute.name}</h1></div><span style={{ borderColor: selectedRoute.color, color: selectedRoute.color }} className="rounded-full border px-2 py-1 text-xs">{selectedRoute.risk}</span></div><p className="mt-1 text-xs text-[#5b2439]/70">{origin} → {destination}</p><div className="mt-3 space-y-1.5">{routeOptions.map((route) => <button key={route.id} onClick={() => { setSelectedRoute(route); setRouteGeometry(route.geometry) }} style={selectedRoute.id === route.id ? { borderColor: route.color, backgroundColor: `${route.color}14` } : undefined} className={`flex w-full items-center justify-between rounded-xl border p-2 text-left text-xs transition ${selectedRoute.id === route.id ? '' : 'border-[#6a273b]/10 hover:bg-[#faf6ef]'}`}><span><strong style={{ color: route.color }}>{route.name}</strong><small className="ml-1.5 text-[#5b2439]/60">{route.label}</small></span><span>{route.time} · {route.distance}</span></button>)}</div><div className="mt-3 grid grid-cols-3 gap-2"><button onClick={() => saveRoute()} className="flex items-center justify-center gap-1.5 rounded-full border border-[#c88c2e]/60 px-3 py-2 text-xs font-semibold text-[#895710]"><Save size={14} />Save</button><a href={googleMapsDirectionsUrl} target="_blank" rel="noreferrer" title="Open walking directions in Google Maps" aria-label="Open selected route in Google Maps" className="flex items-center justify-center rounded-full border border-[#273b88]/35 px-3 py-2 text-[#273b88]"><ExternalLink size={15} /></a><button onClick={downloadRoute} title="Download readable route summary" className="flex items-center justify-center gap-1.5 rounded-full bg-[#c88c2e] px-3 py-2 text-xs font-semibold text-white"><Download size={14} />Summary</button></div>{savedMessage && <p className="mt-2 text-center text-xs text-[#447a59]">{savedMessage}</p>}</aside>}
    {savedMessage && routeOptions.length === 0 && <p className="absolute bottom-4 right-4 z-[500] rounded-xl bg-white px-4 py-3 text-xs text-[#7f2036] shadow-lg">{savedMessage}</p>}
    <div className="absolute right-4 top-20 z-[500] flex flex-col gap-2"><button onClick={() => setReportOpen(true)} className="flex items-center gap-2 rounded-full border border-cream/20 bg-[#4c1728]/95 px-3 py-2 text-xs font-semibold text-cream shadow-lg"><Flag size={14} />Report a journey issue</button>{routeOptions.length > 0 && <button onClick={() => setFeedbackOpen(true)} className="flex items-center gap-2 rounded-full border border-gold/40 bg-[#4c1728]/95 px-3 py-2 text-xs font-semibold text-gold shadow-lg"><MessageSquare size={14} />End journey</button>}</div>
    {reportOpen && <MapDialog title="Report a journey issue" value={reportMessage} onChange={setReportMessage} placeholder="Tell us where it happened and what made the route feel unsafe…" category={reportCategory} onCategoryChange={setReportCategory} categories={['Broken streetlight', 'Dark patch', 'Suspicious activity', 'Unsafe route condition', 'Other']} onClose={() => setReportOpen(false)} onSubmit={() => { setReportOpen(false); setReportMessage(''); setReportCategory('Broken streetlight'); setSavedMessage('Thank you—your journey issue has been recorded for review.') }} />}
    {feedbackOpen && <MapDialog title="Journey feedback" value={feedbackMessage} onChange={setFeedbackMessage} placeholder="How did this route feel? Your feedback improves future safety guidance." onClose={() => setFeedbackOpen(false)} onSubmit={() => { setFeedbackOpen(false); setFeedbackMessage(''); setSavedMessage('Thank you for sharing your journey feedback.') }} />}
  </section></main>
}

function LocationField({ label, value, suggestions, onChange, onSelect, placeholder }) {
  return <label className="relative mt-2.5 block text-[10px] font-medium tracking-wide text-cream/65">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete="off" className="mt-1 w-full rounded-lg border border-cream/20 bg-[#16030a] px-3 py-2 text-xs text-cream outline-none placeholder:text-cream/35 focus:border-gold" />{suggestions.length > 0 && <ul className="absolute left-0 right-0 top-full z-[600] mt-1 max-h-40 overflow-y-auto rounded-lg border border-cream/15 bg-[#260712] py-1 shadow-xl">{suggestions.map((location) => <li key={`${location.label}-${location.coordinates.join(',')}`}><button type="button" onMouseDown={(event) => { event.preventDefault(); onSelect(location) }} className="w-full px-3 py-2 text-left text-xs text-cream/90 hover:bg-gold/15">{location.label}</button></li>)}</ul>}</label>
}

function MapDialog({ title, value, onChange, placeholder, category, onCategoryChange, categories, onClose, onSubmit }) {
  return <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#16030a]/55 p-4"><form onSubmit={(event) => { event.preventDefault(); onSubmit() }} className="w-full max-w-sm rounded-3xl bg-cream p-5 text-burgundy-dark shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-display text-2xl font-bold">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-full p-2 text-burgundy"><X size={18} /></button></div>{categories && <><p className="mt-3 text-sm text-burgundy-dark/70">What did you face during your journey?</p><div className="mt-2 flex flex-wrap gap-2">{categories.map((item) => <button key={item} type="button" onClick={() => onCategoryChange(item)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${category === item ? 'border-burgundy bg-burgundy text-cream' : 'border-burgundy/20 bg-white text-burgundy hover:border-burgundy/50'}`}>{item}</button>)}</div></>}<textarea required value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-4 min-h-28 w-full resize-none rounded-2xl border border-burgundy/20 bg-white p-3 text-sm outline-none focus:border-burgundy" /><button className="mt-3 w-full rounded-full bg-burgundy px-4 py-2.5 text-sm font-semibold text-cream">Send report</button></form></div>
}

export default SafetyMap
