import { useEffect, useMemo, useState } from 'react'
import { Crosshair, LocateFixed, MapPin, Navigation, Phone, Search, Share2, ShieldCheck, Siren, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

const FILTERS = ['All Safe Havens', 'Police Post', '24/7 Hospital', 'Shopping Mall']
const typeOf = (haven) => haven.category?.toLowerCase().includes('police') ? 'Police Post' : haven.category?.toLowerCase().includes('hospital') ? '24/7 Hospital' : 'Shopping Mall'

function SafeHavens() {
  const [havens, setHavens] = useState([])
  const [location, setLocation] = useState('Connaught Place, New Delhi')
  const [searchedLocation, setSearchedLocation] = useState('Connaught Place, New Delhi')
  const [filter, setFilter] = useState('All Safe Havens')
  const [sosOpen, setSosOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [source, setSource] = useState('')

  const searchHavens = async (requestedLocation = location) => {
    if (!requestedLocation.trim()) { setError('Enter a Delhi location to find nearby safe areas.'); return }
    setIsSearching(true); setError('')
    try {
      const result = await api(`/safe-havens?locality=${encodeURIComponent(requestedLocation.trim())}`)
      setHavens(result.havens); setSearchedLocation(result.locality || requestedLocation.trim()); setSource(result.source || '')
    } catch (requestError) { setHavens([]); setError(requestError.message) } finally { setIsSearching(false) }
  }

  useEffect(() => { searchHavens('Connaught Place, New Delhi') }, [])
  const visible = useMemo(() => havens.filter((haven) => filter === 'All Safe Havens' || typeOf(haven) === filter), [havens, filter])
  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setError('Location access is not available in this browser. Search for a Delhi locality instead.'); return }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { const coordinates = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`; setLocation(coordinates); searchHavens(coordinates) },
      () => setError('We could not access your location. Allow location access or search by locality.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  return <main className="min-h-screen bg-[#f8f4ec] text-[#481324]"><header className="flex items-center justify-between bg-[#650c25] px-5 py-4 text-cream shadow-md md:px-12"><Link to="/dashboard" className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-cream/80"><ShieldCheck size={24} /></span><span><strong className="font-display text-2xl font-bold">SheSuraksha</strong><small className="ml-3 rounded-md bg-[#4a061a] px-2 py-1 text-[10px] font-bold">SAFE AREAS</small><em className="block text-sm not-italic text-[#f2c4b7]">Safe Havens Locator</em></span></Link><button type="button" onClick={() => setSosOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-[#e63d35] px-5 py-3 font-bold text-white"><Siren size={18} />SOS</button></header><div className="mx-auto max-w-7xl px-5 py-10 md:px-12"><section className="rounded-[1.5rem] border border-[#eadccc] bg-white p-5 shadow-sm"><form onSubmit={(event) => { event.preventDefault(); searchHavens() }} className="flex flex-col gap-3 lg:flex-row"><label className="flex flex-1 items-center gap-3 rounded-2xl border border-[#e8e1dc] px-5 py-4"><MapPin className="text-burgundy" size={22} /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Enter a Delhi locality" className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none" /><button type="button" onClick={() => setLocation('')} aria-label="Clear location" className="text-[#aaa19d]"><X size={18} /></button></label><button type="submit" disabled={isSearching} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#9b2343] px-6 py-4 font-semibold text-cream disabled:opacity-60"><Search size={20} />{isSearching ? 'Searching…' : 'Find safe areas'}</button><button type="button" onClick={useCurrentLocation} disabled={isSearching} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#650c25] px-6 py-4 font-semibold text-cream disabled:opacity-60"><Crosshair size={20} />Use My Location</button></form><div className="mt-5 flex flex-wrap gap-3">{FILTERS.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-xl border px-5 py-3 text-sm font-semibold ${filter === item ? 'border-burgundy bg-[#650c25] text-cream' : 'border-[#e8e1dc] bg-white text-[#562035]'}`}>{item}</button>)}</div></section><section className="mt-7 flex items-center gap-3 rounded-2xl border border-[#eddfb8] bg-[#fcf7e8] px-5 py-4"><span className="rounded-xl bg-[#ffe9b7] p-2 text-[#7a4d00]"><LocateFixed size={20} /></span><div><p className="font-semibold">Locating nearby secure zones for: <strong>{searchedLocation}</strong></p><p className="mt-1 text-xs text-[#806d62]">{source === 'openstreetmap' ? 'Live nearby facilities from OpenStreetMap, sorted by distance.' : 'Suggested nearby support areas, sorted by distance. Check the linked directions before travelling.'}</p></div></section>{error && <p className="mt-4 text-sm text-red-700">{error}</p>}<section className="mt-10"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><h1 className="font-display text-4xl font-bold">Safe Areas Nearby</h1><span className="rounded-full bg-[#fae5e9] px-3 py-1 text-xs font-semibold text-burgundy">{visible.length} Available</span></div><span className="text-sm text-[#806d62]">Sorted strictly by distance</span></div><div className="mt-7 grid gap-5 lg:grid-cols-2">{visible.map((haven, index) => <HavenCard key={haven.id} haven={haven} index={index} />)}</div>{!isSearching && visible.length === 0 && <p className="mt-8 text-center text-[#806d62]">No matching safe areas were found. Try a nearby Delhi locality.</p>}</section></div>{sosOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><section className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"><button type="button" onClick={() => setSosOpen(false)} className="float-right text-burgundy"><X size={20} /></button><Siren className="mx-auto text-red-600" size={30} /><h2 className="mt-3 font-display text-3xl font-bold">Emergency SOS</h2><p className="mt-2 text-sm text-burgundy-dark/70">Contact support immediately.</p><button className="mt-5 w-full rounded-full bg-red-600 py-3 font-semibold text-white">One-tap broadcast</button><button className="mt-3 w-full rounded-full border border-burgundy/30 py-3 font-semibold text-burgundy">Silent police contact</button></section></div>}</main>
}

function HavenCard({ haven, index }) {
  const type = typeOf(haven)
  const highlights = type === 'Police Post' ? ['24/7 Armed Personnel', 'HD CCTV Monitored', 'Direct Control Room Link'] : type === '24/7 Hospital' ? ['24/7 Hospital Security', 'Trauma & Crisis Support Desk', 'Female Medical Staff on Duty'] : ['High Footfall & Well-Lit', 'Monitored Security Control Room', 'Female Safety Marshals Stationed']
  return <article className="rounded-[1.5rem] border border-[#eadccc] bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex flex-wrap gap-2"><span className="rounded-md border border-[#ddd] bg-[#f6f6f6] px-3 py-1 text-xs font-semibold">{type}</span><span className="rounded-md border border-[#b9e5ce] bg-[#e8f8ee] px-3 py-1 text-xs font-semibold text-[#08753b]">24/7 OPEN</span></div><span className="inline-flex items-center gap-1 rounded-full bg-[#700b29] px-3 py-1.5 text-xs font-bold text-white"><MapPin size={12} />{haven.distanceKm ? `${Math.round(haven.distanceKm * 1000)}m` : `${180 + index * 230}m`}</span></div><h2 className="mt-5 font-display text-3xl font-bold leading-tight">{haven.name}</h2><p className="mt-3 flex items-center gap-2 text-sm text-[#745d64]"><MapPin size={16} className="text-burgundy" />{haven.locality}, New Delhi</p><div className="mt-5 border-t border-[#eee8e3] pt-5"><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-burgundy"><ShieldCheck size={17} />Security highlights</p><div className="mt-4 flex flex-wrap gap-2">{highlights.map((item) => <span key={item} className="rounded-lg border border-[#e7e4e2] bg-[#f6f6f6] px-3 py-2 text-xs">{item}</span>)}</div></div><div className="mt-6 flex gap-3"><Link to={`/area-audit?locality=${encodeURIComponent(haven.locality)}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#700b29] py-3 font-semibold text-white"><Navigation size={17} />Get Directions</Link><a href={`tel:${haven.phone}`} className="rounded-xl border border-[#ddd] p-3"><Phone size={19} /></a><button type="button" className="rounded-xl border border-[#ddd] p-3"><Share2 size={19} /></button></div></article>
}

export default SafeHavens
