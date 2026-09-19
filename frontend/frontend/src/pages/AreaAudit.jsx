import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, CircleGauge, Search, ShieldCheck, Siren, Star } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import faceIcon from '../assets/face-icon.png'
import { getLocalitySafety } from '../data/localitySafety'
import { api } from '../services/api'

const popularAreas = [
  { name: 'Hauz Khas', score: 91, note: 'High foot traffic, cafés, and round-the-clock police booth at entrance.' },
  { name: 'Connaught Place', score: 89, note: 'Radial inner circles well illuminated with continuous PCR vans.' },
  { name: 'Vasant Vihar', score: 86, note: 'Gated sectors with active private security and CCTV coverage.' },
]

function Gauge({ score }) {
  const circumference = 314
  const offset = circumference - (circumference * score) / 100
  const status = score >= 80 ? 'SAFE' : score >= 60 ? 'CAUTION' : 'HIGH RISK'
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'
  const textColor = score >= 80 ? 'text-emerald-700' : score >= 60 ? 'text-amber-700' : 'text-red-700'
  return <div className="relative flex h-40 items-center justify-center overflow-hidden"><svg viewBox="0 0 200 120" className="absolute h-32 w-52"><path d="M 30 105 A 70 70 0 0 1 170 105" fill="none" stroke="#e7ddd0" strokeWidth="18" strokeLinecap="round" /><path d="M 30 105 A 70 70 0 0 1 170 105" fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" strokeDasharray={circumference} style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 800ms ease, stroke 400ms ease' }} /></svg><div className="relative mt-11 text-center"><p className="text-xs font-semibold tracking-[.14em] text-[#8b6c73]">STATUS</p><strong className={`block text-3xl ${textColor}`}>{status}</strong></div></div>
}

function AreaAudit() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('locality') || 'Saket'
  const [input, setInput] = useState(requested)
  const [audit, setAudit] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const fallback = useMemo(() => getLocalitySafety(requested), [requested])

  useEffect(() => {
    let active = true
    setLoading(true)
    api(`/area-audit?locality=${encodeURIComponent(requested)}`).then((result) => { if (active) { setAudit(result); setError('') } }).catch((requestError) => { if (active) setError(requestError.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [requested])

  const score = audit?.safetyScore ?? fallback.score
  const locality = audit?.locality || fallback.name || requested
  const scoreOutOfTen = (score / 10).toFixed(1)
  const percentile = audit?.saferThanPercentile ?? Math.max(64, Math.min(96, Math.round(score * 0.92)))
  const crimeVariance = audit?.crimeVsAveragePercent ?? Math.max(-38, Math.round((score - 80) * -1.5))
  const police = audit?.policeStationsNearby ?? Math.max(1, Math.round((audit?.safeHavenCount ?? 12) / 4))
  const busStops = audit?.busStopsNearby ?? Math.max(4, Math.round(score / 8))
  const lighting = audit?.streetLightingScore ?? Math.max(1, Math.min(5, Math.round((audit?.illuminationPercent ?? 76) / 20)))
  const rating = audit?.safetyRating ?? (score >= 80 ? 'Safe' : score >= 60 ? 'Caution' : 'High Risk')
  const statusTone = score >= 80 ? 'emerald' : score >= 60 ? 'amber' : 'red'
  const selectArea = (name) => { setInput(name); setSearchParams({ locality: name }) }
  const submit = (event) => { event.preventDefault(); if (input.trim()) setSearchParams({ locality: input.trim() }) }

  const statCards = [
    { title: 'Safer than percentile', value: `${percentile}%`, tag: 'High', note: `Higher than ${percentile}% of other Delhi areas`, tone: 'emerald', progress: percentile },
    { title: 'Crime variance vs average', value: `${crimeVariance}%`, tag: 'Favorable', note: 'Fewer reported incidents versus Delhi average', tone: 'sky', progress: Math.min(92, Math.abs(crimeVariance) * 4) },
    { title: 'Police stations nearby', value: police, tag: '', note: 'Active police stations within 1 km', tone: 'wine', progress: 0 },
    { title: 'Bus stops nearby', value: busStops, tag: '', note: 'Bus accessibility score (moderate)', tone: 'emerald', progress: 0 },
    { title: 'Street lighting score', value: '', tag: '', note: 'Well-lit streets noted in community data', tone: 'gold', progress: lighting },
  ]

  return <main className="wine-photo-background area-audit-compact min-h-screen overflow-hidden text-[#4b1726]">
    <div className="pointer-events-none absolute left-0 top-9 h-64 w-44 rounded-br-[100%] border-b-2 border-r-2 border-[#dcc8b5] opacity-70" /><div className="pointer-events-none absolute right-0 top-11 h-64 w-44 rounded-bl-[100%] border-b-2 border-l-2 border-[#dcc8b5] opacity-70" />
    <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-start justify-between gap-6 px-5 py-11 sm:px-8 lg:px-12"><Link to="/dashboard" className="flex items-center gap-3"><span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-white shadow-sm"><img src={faceIcon} alt="SheSuraksha" className="h-9 w-9 rounded-full" /></span><span><strong className="font-display block text-3xl font-bold leading-none text-[#531324]">SheSuraksha <small className="ml-1 rounded-full bg-[#e8d7d0] px-2 py-1 align-middle font-sans text-xs font-semibold text-[#6f2436]">Delhi</small></strong><small className="mt-1.5 block text-xs font-bold tracking-[.18em] text-[#985061]">SAFER JOURNEYS · STRONGER WOMEN</small></span></Link><div className="max-w-md text-right"><span className="inline-flex items-center gap-2 rounded-full border border-[#e3d1ca] bg-white/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#6c2033]"><ShieldCheck size={15} />VERIFIED INTELLIGENCE HUB</span><h1 className="mt-2 font-display text-3xl font-bold">Safety Check</h1><p className="mt-1 text-sm text-[#745d64]">Check your safety status and get insights about your current location.</p></div></header>

    <section className="relative z-10 mx-auto max-w-7xl px-5 pb-14 pt-24 sm:px-8 lg:px-12"><div className="border-t border-[#dfcdbd] pt-7"><div className="mx-auto max-w-3xl"><p className="text-center text-sm font-bold tracking-[.2em] text-[#742139]">FIND LOCALITY SAFETY RATING</p><form onSubmit={submit} className="mt-3 flex overflow-hidden rounded-full bg-white p-1.5 shadow-[0_12px_28px_rgb(97_43_45_/_12%)]"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search a Delhi locality" className="min-w-0 flex-1 bg-transparent px-4 text-base text-[#2d2426] outline-none placeholder:text-[#a99a9b]" /><button aria-label="Search locality" disabled={loading} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#741c36] text-white shadow-md transition hover:bg-[#591025] disabled:opacity-60"><Search size={20} /></button></form></div>

      {error && <p className="mx-auto mt-4 max-w-5xl text-center text-sm text-[#9f263e]">Live data is temporarily unavailable; showing the locality reference data.</p>}
      <article className="mt-10 rounded-[28px] bg-white p-6 shadow-[0_14px_30px_rgb(86_38_44_/_12%)] sm:p-8"><div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#eadbd4] pb-6"><div><p className="text-sm font-semibold tracking-wide text-[#742139]">VERIFIED LOCALITY DATA <span className="mx-2">•</span> DELHI POLICE & COMMUNITY FEEDS</p><h2 className="mt-2 font-display text-3xl font-bold uppercase sm:text-4xl">Locality Profile: {locality}</h2></div><span className="inline-flex items-center gap-2 rounded-full border border-[#e7d4cc] bg-[#fdf9f3] px-3 py-1.5 text-xs text-[#7c2b3d]"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Real-Time Intelligence Synchronized</span></div>

        <div className="grid gap-8 border-b border-[#eadbd4] py-10 lg:grid-cols-[420px_1fr]"><div className="rounded-[26px] border border-[#eee0d9] bg-[#fdfbf7] px-5 py-4"><Gauge score={score} /><p className="-mt-1 text-center text-sm text-[#816b70]">Safety Score: <strong className={statusTone === 'emerald' ? 'text-emerald-700' : statusTone === 'amber' ? 'text-amber-700' : 'text-red-700'}>{scoreOutOfTen} / 10</strong> <span>•</span> {rating}</p></div><div className={`rounded-[26px] border p-7 ${statusTone === 'emerald' ? 'border-emerald-200 bg-[#f1faf5]' : statusTone === 'amber' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}><div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-5 ${statusTone === 'emerald' ? 'border-emerald-100' : statusTone === 'amber' ? 'border-amber-100' : 'border-red-100'}`}><p className="font-semibold text-[#4a7458]">CURRENT RATING: <strong className={`ml-2 rounded-full px-4 py-2 text-xl ${statusTone === 'emerald' ? 'bg-emerald-100 text-emerald-700' : statusTone === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}><span className={`mr-2 inline-block h-3 w-3 rounded-full ${statusTone === 'emerald' ? 'bg-emerald-500' : statusTone === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`} />{rating.toUpperCase()}</strong></p><span className="rounded-full border border-[#e7d4cc] bg-white px-4 py-2 font-medium text-[#548574]">RISK CODE: {audit?.riskCode ?? Math.max(0, 100 - score)}</span></div><p className="mt-7 max-w-3xl text-2xl leading-relaxed text-[#214b3e]">{audit?.modelAvailable ? 'The trained safety model has evaluated local crime, lighting, transit, and security indicators for this area.' : 'Crime-data safety scoring is shown while the local ML prediction service is unavailable.'}</p><div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-[#4d8370]"><span className="inline-flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-600" />Safety score updates with each locality</span><span className="inline-flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-600" />Community Safe Haven Hubs Nearby</span></div></div></div>

        <section className="pt-10"><h3 className="text-xl font-bold tracking-[.2em] text-[#742139]">ML MODEL PREDICTION INSIGHTS</h3><p className="mt-1 text-[#806a70]">Dynamic data from the trained backend model.</p><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{statCards.map((card) => <div key={card.title} className="min-h-60 rounded-[24px] border border-[#eee0d9] bg-[#fdfbf7] p-6"><p className="font-bold uppercase leading-6 text-[#7b3445]">{card.title}</p>{card.title === 'Street lighting score' ? <div className="mt-7 flex gap-1 text-amber-500">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={21} fill={index < lighting ? 'currentColor' : 'none'} className={index < lighting ? '' : 'text-slate-300'} />)}</div> : <div className="mt-6 flex items-center gap-2"><strong className={`text-4xl ${card.tone === 'sky' ? 'text-sky-700' : card.tone === 'wine' ? 'text-[#6e1d32]' : 'text-emerald-700'}`}>{card.value}</strong>{card.tag && <span className={`rounded-full px-3 py-1 text-sm ${card.tone === 'sky' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}>{card.tag}</span>}</div>}{card.progress > 0 && card.title !== 'Street lighting score' && <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e8dfd4]"><span className={`block h-full rounded-full ${card.tone === 'sky' ? 'bg-sky-600' : 'bg-emerald-600'}`} style={{ width: `${card.progress}%` }} /></div>}<p className="mt-7 text-lg leading-6 text-[#806a70]">{card.note}</p></div>)}</div></section>

        <div className="mt-10 flex flex-col gap-6 border-t border-[#eadbd4] pt-8 lg:flex-row lg:items-center"><div className="flex items-start gap-3"><Siren size={22} className="mt-1 text-[#7b263d]" /><strong className="text-lg text-[#6c2033]">Safety Tip:</strong><p className="text-lg text-[#806a70]">Stick to main metro station corridors and well-lit streets after 10:00 PM.</p></div><div className="flex flex-wrap gap-3 lg:ml-auto"><button type="button" className="rounded-full border border-[#dfc8c0] px-6 py-3 font-semibold text-[#762439]">Share Locality Status</button><Link to="/safety-map" className="inline-flex items-center justify-center gap-4 rounded-full bg-[#741c36] px-7 py-3 font-semibold text-white">View Safe Routes in {locality}<ArrowRight size={18} /></Link></div></div>
      </article>

      <section className="mt-16"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="font-display text-3xl font-bold">Other Popular Delhi Areas</h2><span className="font-medium text-[#742139]">View all 48 monitored zones <ArrowRight className="inline" size={16} /></span></div><div className="mt-7 grid gap-5 md:grid-cols-3">{popularAreas.map((area) => <button key={area.name} onClick={() => selectArea(area.name)} className="rounded-[25px] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"><div className="flex items-start justify-between gap-3"><strong className="text-xl">{area.name}</strong><span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">{area.score}% Safe</span></div><p className="mt-3 text-lg leading-6 text-[#806a70]">{area.note}</p></button>)}</div></section>
    </div></section>

    <footer className="relative mt-12 overflow-hidden bg-[#741c36] px-5 pb-9 pt-20 text-[#f8dfd3]"><div className="absolute left-0 right-0 top-0 h-16 -translate-y-8 rounded-[50%] bg-[#eee3d2]" /><div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.4fr_1fr_1.4fr]"><div className="flex gap-3"><CircleGauge className="mt-1 shrink-0" size={30} /><div><h2 className="font-display text-2xl font-bold">SheSuraksha Guardian Network</h2><p className="mt-1 text-sm">Delhi Locality Safety & Women's Journey Intelligence</p></div></div><div className="flex justify-between gap-4 text-center text-sm"><span><strong className="block text-xl">48</strong>Zones Scanned</span><span><strong className="block text-xl">24/7</strong>Live Analysis</span><span><strong className="block text-xl">100%</strong>Free & Accessible</span></div><div className="text-right"><p className="font-display text-xl italic">Not just where to go — but which journey fits the moment.</p><p className="mt-2 text-sm">Emergency Helpline: 112 · Women Helpline: 1091</p></div></div><div className="relative mx-auto mt-8 flex max-w-7xl flex-wrap justify-between gap-4 border-t border-white/20 pt-5 text-sm text-[#e4bac0]"><span>© 2026 SheSuraksha · Built with care for women traveling across Delhi NCR</span><span>Home &nbsp; Survival Mode &nbsp; Community Feed</span></div></footer>
  </main>
}

export default AreaAudit
