import { useEffect, useState } from 'react'
import { ArrowRight, ChevronLeft, Download, MapPin, Route, ShieldAlert, ShieldCheck, Siren, Volume2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { downloadRouteSummary, getDownloadedRoutes } from '../services/mapDownload'
import { api, auth } from '../services/api'

function formatDownloadedAt(value) {
  if (!value) return 'Available offline'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function SurvivalMode() {
  const [routes, setRoutes] = useState([])
  const [savedRoutes, setSavedRoutes] = useState([])
  const [sosOpen, setSosOpen] = useState(false)
  const [sosMessage, setSosMessage] = useState('')

  useEffect(() => {
    const refresh = () => setRoutes(getDownloadedRoutes())
    refresh()
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  useEffect(() => {
    if (!auth.getToken()) return
    api('/saved-routes').then(({ routes: saved }) => setSavedRoutes(saved)).catch(() => setSavedRoutes([]))
  }, [])

  const offlineRoutes = routes.map((route) => ({ ...route, source: 'downloaded' }))
  const syncedRoutes = savedRoutes.map((route) => ({
    id: `saved-${route.savedRouteId}`,
    routeName: route.routeName,
    origin: route.origin,
    destination: route.destination,
    distance: `${route.distanceKm} km`,
    duration: `${route.estimatedTimeMinutes} min`,
    safetyScore: route.safetyScore,
    risk: route.riskLevel,
    downloadedAt: route.createdAt,
    source: 'saved',
  }))
  const allRoutes = [...offlineRoutes, ...syncedRoutes.filter((saved) => !offlineRoutes.some((downloaded) => downloaded.origin === saved.origin && downloaded.destination === saved.destination))]
  const latestRoute = allRoutes[0]

  return <main className="min-h-screen bg-[#eadccf] px-5 py-6 text-[#5b2439] sm:px-10 sm:py-9"><div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#d8c0b4] bg-[linear-gradient(135deg,#f2dfd4_0%,#ead3ca_54%,#f5e7d6_100%)] px-6 py-8 shadow-[0_12px_35px_rgb(91_36_57_/_12%)] sm:px-9 sm:py-9"><header className="flex items-center justify-between gap-4"><Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-burgundy hover:underline"><ChevronLeft size={17} />Dashboard</Link><span className="inline-flex items-center gap-2 rounded-full border border-burgundy/15 bg-white/75 px-3 py-1.5 text-xs font-semibold text-burgundy"><ShieldCheck size={14} />Offline ready</span></header>

    <section className="mt-8"><p className="text-[10px] font-bold uppercase tracking-[.26em] text-burgundy">Stay prepared · Stay safe</p><h1 className="mt-2 font-display text-4xl font-bold leading-none sm:text-5xl">Survival Mode</h1><p className="mt-3 max-w-xl text-sm leading-5 text-burgundy-dark/75">Your downloaded route summaries stay on this device, ready when you need guidance without relying on a connection.</p><div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold"><span className="rounded-full bg-white/80 px-3 py-1.5 text-burgundy">Low data</span><span className="rounded-full bg-white/80 px-3 py-1.5 text-burgundy">No internet needed</span><span className="rounded-full bg-white/80 px-3 py-1.5 text-[#2c7955]">Downloaded routes available</span></div></section>

    <section className="mt-7 rounded-[1.5rem] border border-white/80 bg-[#fffaf4]/90 p-5 shadow-sm sm:p-6"><div className="grid items-center gap-5 md:grid-cols-[1fr_10rem]"><div><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#d45b73]"><span className="rounded-xl bg-burgundy p-2 text-cream"><ShieldAlert size={15} /></span>High priority</div><h2 className="mt-2 font-display text-2xl font-bold">Emergency SOS</h2><p className="mt-2 max-w-2xl text-sm leading-5 text-burgundy-dark/70">Trigger a silent alert, share your location, and get help from trusted contacts and nearby authorities.</p><button type="button" onClick={() => { setSosMessage(''); setSosOpen(true) }} className="mt-3 inline-flex items-center gap-2 rounded-full bg-burgundy px-4 py-2 text-sm font-semibold text-cream hover:bg-burgundy-light"><Siren size={15} />Activate SOS <ArrowRight size={14} /></button><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-burgundy/10 pt-3 text-[11px] text-burgundy-dark/60"><span>Share location</span><span>Alert contacts</span><span>Get help</span></div></div><div className="mx-auto flex h-32 w-28 flex-col items-center justify-center rounded-[1.35rem] bg-[#5b0e24] text-center text-cream shadow-lg"><span className="text-[9px] font-bold text-emerald-300">24/7 SOS relay · Active</span><span className="mt-3 rounded-full bg-white p-3 text-burgundy"><Siren size={20} /></span><strong className="mt-2 text-[11px]">DIRECT LINE</strong><small className="mt-1 text-[9px] text-cream/65">Women helpline 1091</small></div></div></section>

    <section id="downloaded-routes" className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-[1.65rem] border border-white/80 bg-[#fffaf4]/90 p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-3xl font-bold">Saved routes</h2><p className="mt-1 text-sm text-burgundy-dark/65">Saved and downloaded routes from your Safety Map.</p></div><span className="rounded-full bg-[#e7f6ed] px-3 py-1.5 text-xs font-semibold text-[#26734f]">{allRoutes.length} offline</span></div><div className="mt-5 space-y-3">{allRoutes.length === 0 ? <div className="rounded-2xl border border-dashed border-burgundy/20 bg-white/70 p-6 text-center"><Route className="mx-auto text-burgundy/55" size={27} /><h3 className="mt-3 font-display text-xl font-bold">No saved routes yet</h3><p className="mt-2 text-sm text-burgundy-dark/65">Save or download a route from Safety Map and it will appear here.</p><Link to="/safety-map" className="mt-4 inline-flex rounded-full bg-burgundy px-4 py-2 text-sm font-semibold text-cream">Open Safety Map</Link></div> : allRoutes.map((route) => <article key={route.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-burgundy/10 bg-white/85 p-4"><span className="rounded-xl bg-[#f5e8e8] p-2.5 text-burgundy"><MapPin size={18} /></span><div className="min-w-[11rem] flex-1"><h3 className="font-display text-lg font-bold">{route.origin} <span className="mx-1 text-burgundy/50">→</span> {route.destination}</h3><p className="mt-1 text-xs text-burgundy-dark/60">{route.routeName} · {route.distance} · {route.duration}</p><p className="mt-1 text-[11px] text-burgundy-dark/45">{route.source === 'saved' ? 'Saved' : 'Downloaded'} {formatDownloadedAt(route.downloadedAt)}</p></div><span className="rounded-full bg-[#e7f6ed] px-2.5 py-1 text-[11px] font-semibold text-[#26734f]">Offline</span><button type="button" onClick={() => downloadRouteSummary(route)} className="rounded-xl bg-[#f5e8e8] p-2.5 text-burgundy" aria-label={`Download ${route.routeName} again`}><Download size={16} /></button></article>)}</div></div>

      <aside className="rounded-[1.65rem] border border-white/80 bg-[#fffaf4]/90 p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between"><div><h2 className="font-display text-3xl font-bold">Downloaded routes</h2><p className="mt-1 text-sm text-burgundy-dark/65">Ready for offline use.</p></div><span className="rounded-full bg-[#d9f6e7] px-3 py-1.5 text-[11px] font-semibold text-[#26734f]">Downloaded · Ready offline</span></div>{latestRoute ? <div className="mt-6 rounded-2xl bg-[#f4e4d8] p-5"><p className="text-xs font-bold uppercase tracking-wide text-burgundy">Latest saved path</p><h3 className="mt-3 font-display text-2xl font-bold">{latestRoute.routeName}</h3><p className="mt-3 text-sm leading-6 text-burgundy-dark/70">{latestRoute.origin} → {latestRoute.destination}</p><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><span className="rounded-xl bg-white/80 p-3"><small className="block text-burgundy-dark/50">Distance</small><strong>{latestRoute.distance}</strong></span><span className="rounded-xl bg-white/80 p-3"><small className="block text-burgundy-dark/50">Duration</small><strong>{latestRoute.duration}</strong></span></div><button type="button" onClick={() => downloadRouteSummary(latestRoute)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-burgundy px-4 py-2.5 text-sm font-semibold text-cream">Download route summary <Download size={15} /></button></div> : <div className="mt-6 rounded-2xl bg-[#f4e4d8] p-5 text-sm leading-6 text-burgundy-dark/70">Your latest downloaded route will appear here with its route details.</div>}<div className="mt-6 border-t border-burgundy/10 pt-5 text-xs leading-5 text-burgundy-dark/60">Downloaded routes remain available even when the connection is unreliable.</div></aside></section>

    <section className="mt-12"><div className="text-center"><h2 className="font-display text-3xl font-bold">Survival Mode essentials</h2><p className="mt-1 text-sm text-burgundy-dark/65">Key tools. Low data. Offline access.</p></div><div className="mt-6 grid gap-5 md:grid-cols-3"><button type="button" onClick={() => { setSosMessage(''); setSosOpen(true) }} className="rounded-2xl border border-white/80 bg-[#fffaf4]/90 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-burgundy text-cream"><Volume2 size={21} /></span><h3 className="mt-4 font-display text-xl font-bold">Emergency SOS</h3><p className="mt-2 text-sm leading-5 text-burgundy-dark/65">Send an alert when you need immediate help.</p></button><Link to="#downloaded-routes" onClick={(event) => { event.preventDefault(); document.querySelector('#downloaded-routes')?.scrollIntoView({ behavior: 'smooth' }) }} className="rounded-2xl border border-white/80 bg-[#fffaf4]/90 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-burgundy text-cream"><Route size={21} /></span><h3 className="mt-4 font-display text-xl font-bold">Saved Paths</h3><p className="mt-2 text-sm leading-5 text-burgundy-dark/65">Access your downloaded routes offline.</p></Link><Link to="/safety-map" className="rounded-2xl border border-white/80 bg-[#fffaf4]/90 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-burgundy text-cream"><MapPin size={21} /></span><h3 className="mt-4 font-display text-xl font-bold">Download a route</h3><p className="mt-2 text-sm leading-5 text-burgundy-dark/65">Save a route summary from Safety Map for offline use.</p></Link></div></section>

    <footer className="mt-10 text-center text-[11px] text-burgundy-dark/50">SheSuraksha Offline Guardian · Built for resilience in low-connectivity emergencies</footer>
    {sosOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16030a]/55 p-4"><section role="dialog" aria-modal="true" aria-labelledby="survival-sos-title" className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-burgundy-dark to-[#3a0d10] p-6 text-center text-cream shadow-2xl"><div className="flex justify-end"><button type="button" onClick={() => setSosOpen(false)} aria-label="Close emergency SOS" className="rounded-full p-2 text-cream/80 hover:bg-white/10"><X size={18} /></button></div><ShieldAlert className="mx-auto -mt-1 text-red-300" size={31} /><h2 id="survival-sos-title" className="mt-2 font-display text-3xl font-bold">Emergency SOS</h2><p className="mt-2 text-sm text-cream/70">Choose the alert you need.</p><div className="mt-5 flex flex-col gap-3"><button onClick={() => setSosMessage('One-tap broadcast selected.')} className="flex items-center justify-center gap-2 rounded-full bg-red-600 py-3.5 text-base font-semibold text-white"><Siren size={19} />One-tap broadcast</button><button onClick={() => setSosMessage('Silent police contact selected.')} className="flex items-center justify-center gap-2 rounded-full border border-gold/40 py-3 text-sm font-medium text-cream"><ShieldAlert size={18} className="text-gold" />Silent police contact</button></div>{sosMessage && <p className="mt-4 rounded-xl bg-black/20 p-3 text-sm text-cream/90">{sosMessage}</p>}</section></div>}
  </div></main>
}

export default SurvivalMode
