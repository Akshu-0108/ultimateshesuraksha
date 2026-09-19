import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, ChevronDown, Languages, MessageCircle, ShieldAlert, ShieldCheck, Siren, X } from 'lucide-react'
import faceIcon from '../assets/face-icon.png'
import creamWaves from '../assets/landing-cream-waves.jpg'

const featureLinks = [
  { label: 'Safe Havens', icon: Building2, to: '/safe-havens' },
  { label: 'Safety Check', icon: ShieldCheck, to: '/area-audit' },
  { label: 'Chatbot', icon: MessageCircle, to: '/chatbot' },
]

const languages = ['English', 'हिन्दी', 'বাংলা', 'ਪੰਜਾਬੀ']

function Landing() {
  const [language, setLanguage] = useState('English')
  const [sosOpen, setSosOpen] = useState(false)
  const [sosMessage, setSosMessage] = useState('')

  return (
    <>
    <main className="min-h-screen overflow-hidden bg-[#e9dac7] bg-cover bg-center text-[#5a3034]" style={{ backgroundImage: `url(${creamWaves})` }}>
      <div className="relative mx-auto flex min-h-screen max-w-[1500px] flex-col overflow-hidden bg-cover bg-center shadow-[0_8px_28px_rgb(76_23_40_/_7%)]" style={{ backgroundImage: `linear-gradient(rgb(255 251 244 / 30%), rgb(244 231 213 / 40%)), url(${creamWaves})` }}>
        <i aria-hidden="true" className="absolute left-[12%] top-[11%] h-1 w-1 rounded-full bg-[#8d6c56]/35" />
        <i aria-hidden="true" className="absolute right-[15%] top-[18%] h-1.5 w-1.5 rounded-full bg-[#d3a460]/55" />
        <i aria-hidden="true" className="absolute bottom-[16%] right-[10%] h-1.5 w-1.5 rounded-full bg-[#8d6c56]/30" />

        <header className="relative z-10 flex items-center justify-between px-7 py-4 sm:px-10">
          <Link to="/" className="flex items-center gap-3" aria-label="SheSuraksha home">
            <img src={faceIcon} alt="" className="h-8 w-8 rounded-full shadow-sm" />
            <span className="font-display text-sm font-bold tracking-[.08em] text-[#744848]">SHESURAKSHA</span>
          </Link>
          <label className="flex items-center gap-2 rounded-full border border-[#d8c5b6] bg-[#fffaf4]/80 px-3 py-1.5 text-xs font-semibold text-[#744848] shadow-sm backdrop-blur-sm">
            <Languages size={14} aria-hidden="true" />
            <span className="sr-only">Choose language</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)} className="cursor-pointer appearance-none bg-transparent pr-1 outline-none">
              {languages.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </header>

        <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-5 pt-2 text-center sm:pt-3">
          <img src={faceIcon} alt="SheSuraksha" className="h-16 w-16 rounded-full shadow-[0_9px_18px_rgb(75_13_30_/_22%)] sm:h-20 sm:w-20" />
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#651b2a] sm:text-5xl md:text-6xl">SheSuraksha</h1>
          <p className="mt-2 font-display text-sm italic text-[#7b263d] sm:text-base">“Not just where to go — but which journey fits the moment.”</p>

          <div className="mt-8 grid w-full max-w-3xl grid-cols-3 gap-x-5">
            {featureLinks.map(({ label, icon: Icon, to }) => (
              <Link key={label} to={to} className="group flex flex-col items-center text-center">
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#cdb9b6] bg-[#f0e5e1] text-[#744848] shadow-[0_3px_8px_rgb(73_25_37_/_10%)] transition group-hover:-translate-y-1 group-hover:border-[#9b5967] group-hover:shadow-[0_8px_16px_rgb(73_25_37_/_16%)] sm:h-16 sm:w-16">
                  <Icon size={19} strokeWidth={1.7} />
                </span>
                <span className="mt-3 font-display text-base font-semibold text-[#744848] sm:text-lg">{label}</span>
              </Link>
            ))}
          </div>

          <button type="button" onClick={() => { setSosMessage(''); setSosOpen(true) }} className="mt-8 flex w-full max-w-sm items-center justify-between rounded-full border border-[#9f7380] bg-[#521323] px-4 py-3 text-left text-[#fff7ed] shadow-[0_8px_18px_rgb(75_13_30_/_22%)] transition hover:-translate-y-0.5 hover:bg-[#651b2a]">
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7d3042] text-[9px] font-bold tracking-wide text-[#ffd5c6]">SOS</span>
              <span><strong className="block text-xs font-bold uppercase tracking-[.08em]">Emergency assistance</strong><small className="block text-[9px] text-[#efd3c8]">Quick access to safety support</small></span>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <Link to="/dashboard" className="mt-auto mb-5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[#9d7a67] transition hover:text-[#651b2a]">Scroll to dashboard <ChevronDown size={14} /></Link>
        </section>

        <footer className="relative z-10 mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-[#d9cfc5] px-6 py-3 text-center text-[10px] text-[#beA295] sm:justify-between sm:px-10">
          <span>• SheSuraksha &nbsp;|&nbsp; Autonomous Sentinel Protocol</span>
          <span>Privacy Sanctuary &nbsp;&nbsp; Audited Cryptography &nbsp;&nbsp; 24/7 Dispatch</span>
          <span>© 2026 SheSuraksha Initiative</span>
        </footer>
      </div>
    </main>
    {sosOpen && createPortal(<div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#16030a]/55 p-4"><section role="dialog" aria-modal="true" aria-labelledby="landing-sos-title" className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-burgundy-dark to-[#3a0d10] p-6 text-center text-cream shadow-2xl"><div className="flex justify-end"><button type="button" onClick={() => setSosOpen(false)} aria-label="Close emergency SOS" className="rounded-full p-2 text-cream/80 hover:bg-white/10"><X size={18} /></button></div><ShieldAlert className="mx-auto -mt-1 text-red-300" size={31} /><h2 id="landing-sos-title" className="mt-2 font-display text-3xl font-bold">Emergency SOS</h2><p className="mt-2 text-sm text-cream/70">Choose the alert you need.</p><div className="mt-5 flex flex-col gap-3"><button onClick={() => setSosMessage('One-tap broadcast selected.')} className="flex items-center justify-center gap-2 rounded-full bg-red-600 py-3.5 text-base font-semibold text-white transition hover:bg-red-700"><Siren size={19} />One-tap broadcast</button><button onClick={() => setSosMessage('Silent police contact selected.')} className="flex items-center justify-center gap-2 rounded-full border border-gold/40 py-3 text-sm font-medium text-cream transition hover:bg-black/20"><ShieldAlert size={18} className="text-gold" />Silent police contact</button></div>{sosMessage && <p className="mt-4 rounded-xl bg-black/20 p-3 text-sm text-cream/90">{sosMessage}</p>}</section></div>, document.body)}
    </>
  )
}

export default Landing
