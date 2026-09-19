import { useRef, useState } from 'react'
import { BellRing, CheckCircle2, ShieldAlert, Siren, X } from 'lucide-react'
import faceIcon from '../assets/face-icon.png'
import { api, auth } from '../services/api'
import sirenSound from '../assets/sounds/emergency-siren.mp3'
import AmbientDots from '../components/AmbientDots'

const PRE_TRAVEL_ITEMS = [
  'Charge your phone and keep a power bank with you for longer journeys.',
  'Update your emergency contacts and make sure they can reach you quickly.',
  'Check the route, transport details, and your expected arrival time before leaving.',
  'Share your trip with a trusted contact when travelling late or to a new location.',
  'Keep women’s helpline 1091 and emergency contacts saved for quick access.',
]

function Community() {
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(true)
  const [alert, setAlert] = useState(null)
  const [completedChecklist, setCompletedChecklist] = useState([])
  const sirenAudioRef = useRef(null)

  const sendAlert = async (type) => {
    const messages = {
      siren: 'Safety siren activated. Move toward a well-lit, populated place when it is safe to do so.',
      police: 'Silent police alert sent with your live location.',
      guardian: 'Emergency broadcast sent to your selected guardians with your live location.',
    }
    if (type === 'siren') {
      const sirenAudio = sirenAudioRef.current
      if (sirenAudio) {
        sirenAudio.currentTime = 0
        sirenAudio.play().catch(() => setAlert('Siren could not start. Please check that sound is enabled in your browser.'))
      }
      setAlert(messages[type])
      return
    }
    if (!auth.getToken()) {
      setAlert('Create a safety profile first so we know which emergency contact to alert.')
      return
    }
    if (!navigator.geolocation) {
      setAlert('Location is unavailable on this device. Call 112 if you are in immediate danger.')
      return
    }
    setAlert('Getting your location and creating an emergency alert…')
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        await api('/sos', { method: 'POST', body: JSON.stringify({ alertType: type, location: { lat: coords.latitude, lng: coords.longitude }, message: type === 'police' ? 'Silent police alert requested' : 'Guardian assistance requested' }) })
        setAlert(`${messages[type]} Your alert has been recorded.`)
      } catch (requestError) { setAlert(requestError.message) }
    }, () => setAlert('We could not access your location. Call 112 if you are in immediate danger.'), { enableHighAccuracy: true, timeout: 10000 })
  }

  const toggleChecklistItem = (item) => {
    setCompletedChecklist((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item],
    )
  }

  const closeEmergencyTools = () => {
    sirenAudioRef.current?.pause()
    setIsEmergencyOpen(false)
  }

  return (
    <main className="soft-cream-page min-h-screen px-5 py-10 text-burgundy-dark md:px-8 md:py-14 motion-page"><AmbientDots />
      <audio ref={sirenAudioRef} src={sirenSound} preload="auto" />
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 flex items-center gap-3">
          <img src={faceIcon} alt="SheSuraksha" className="w-9 h-auto" />
          <span className="font-display text-lg font-bold">SheSuraksha</span>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-gold/90">Together, we notice. Together, we act.</p>
        <h1 className="mb-7 font-display text-4xl font-bold leading-tight text-burgundy-dark md:text-6xl">Community & Awareness</h1>

        <div className="max-w-2xl space-y-9 text-base leading-8 text-burgundy-dark/85 md:text-lg motion-stagger">
          <section>
            <h2 className="mb-3 font-display text-3xl font-bold text-burgundy-dark">Community awareness</h2>
            <ul className="list-disc space-y-3 pl-6 marker:text-gold">
              <li>Share verified safe places, well-lit routes, and reliable transport updates with friends and neighbours.</li>
              <li>Check in when someone is travelling alone, especially late at night or in an unfamiliar area.</li>
              <li>If someone seems uncomfortable or unsafe, ask gently if they need help and stay nearby where possible.</li>
              <li>Report broken streetlights, unsafe stops, or repeated harassment so others can make informed choices.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-3xl font-bold text-burgundy-dark">Pre-travel checklist</h2>
            <ul className="space-y-4">
              {PRE_TRAVEL_ITEMS.map((item, index) => {
                const isCompleted = completedChecklist.includes(item)
                return (
                  <li key={item} className="flex items-start gap-3">
                    <input
                      id={`checklist-${index}`}
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleChecklistItem(item)}
                      className="mt-2 h-4 w-4 shrink-0 cursor-pointer accent-burgundy"
                    />
                    <label htmlFor={`checklist-${index}`} className={`cursor-pointer ${isCompleted ? 'text-burgundy/50 line-through' : ''}`}>
                      {item}
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-3xl font-bold text-burgundy-dark">Know. Support. Report.</h2>
            <ul className="list-disc space-y-3 pl-6 marker:text-gold">
              <li>Trust your instincts and choose a visible, populated route whenever you can.</li>
              <li>Share live location only with people you know and trust.</li>
              <li>In an immediate emergency, use the alert tools or contact local emergency services.</li>
            </ul>
          </section>
        </div>
      </div>

      {isEmergencyOpen && (
        <div className="z-50 flex items-center justify-center bg-burgundy-dark/55 p-5 motion-dialog-backdrop" style={{ position: 'fixed', inset: 0 }} role="dialog" aria-modal="true" aria-labelledby="emergency-title">
          <div
            className="relative w-full max-w-md rounded-[2rem] border border-gold/60 p-7 text-center text-cream shadow-2xl md:p-9 motion-dialog"
            style={{ background: 'linear-gradient(145deg, #3a0714 0%, #1b0209 100%)' }}
          >
            <button
              onClick={closeEmergencyTools}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-gold/60 bg-cream text-burgundy-dark shadow-lg transition hover:scale-105 hover:bg-gold-light"
              aria-label="Close emergency tools and view community awareness"
              title="Close and view Community & Awareness"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <ShieldAlert className="mx-auto mb-4 text-gold" size={30} />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">Emergency tools</p>
            <h2 id="emergency-title" className="mt-2 font-display text-3xl font-bold text-cream">Need help now?</h2>
            <p className="mt-3 text-sm leading-6 text-cream/75">Choose the fastest and safest way to ask for support.</p>

            <div className="mt-7 flex flex-col gap-3 text-left">
              <button onClick={() => sendAlert('police')} className="flex items-center gap-3 rounded-2xl border border-gold/40 px-4 py-4 text-cream transition hover:bg-white/10"><ShieldAlert className="shrink-0 text-gold" size={21} /><span><strong className="block text-sm">Silent police alert</strong><small className="text-cream/65">Send location discreetly</small></span></button>
              <button onClick={() => sendAlert('siren')} className="flex items-center gap-3 rounded-2xl border border-gold/40 px-4 py-4 text-cream transition hover:bg-white/10 motion-safety-indicator"><Siren className="shrink-0 text-gold" size={21} /><span><strong className="block text-sm">Activate siren</strong><small className="text-cream/65">Draw attention around you</small></span></button>
              <button onClick={() => sendAlert('guardian')} className="flex items-center gap-3 rounded-2xl bg-red-700 px-4 py-4 text-white transition hover:bg-red-800"><BellRing className="shrink-0" size={21} /><span><strong className="block text-sm">One-tap guardian broadcast</strong><small className="text-white/75">Share your live location now</small></span></button>
            </div>

            {alert && <div className="mt-5 flex gap-2 rounded-xl bg-black/20 p-3 text-left text-sm text-cream/90"><CheckCircle2 className="mt-0.5 shrink-0 text-green-400" size={18} />{alert}</div>}
            <button onClick={closeEmergencyTools} className="mt-6 text-sm text-cream/70 underline underline-offset-4 hover:text-cream">I’m safe, continue to awareness</button>
          </div>
        </div>
      )}
    </main>
  )
}

export default Community
