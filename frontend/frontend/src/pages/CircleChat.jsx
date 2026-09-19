import { useMemo, useState } from 'react'
import { ArrowLeft, MapPin, MessageCircle, Send, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import AmbientDots from '../components/AmbientDots'

const CHAT_PROFILES = {
  'demo-priya': {
    name: 'Priya Nair',
    initial: 'P',
    route: 'Hauz Khas → Kashmere Gate',
    messages: [
      { from: 'them', text: 'Hi! I am leaving Hauz Khas around 6:30 PM. Are you taking the metro too?', time: '6:12 PM' },
      { from: 'me', text: 'Yes, I will be near Gate 2 in a few minutes.', time: '6:14 PM' },
      { from: 'them', text: 'Great. Let’s stay on the well-lit main road until we reach the station.', time: '6:15 PM' },
    ],
  },
  'demo-rhea': {
    name: 'Rhea Kapoor',
    initial: 'R',
    route: 'Saket → Connaught Place',
    messages: [
      { from: 'them', text: 'Hey! I am planning to leave Saket at 7 PM.', time: '6:28 PM' },
      { from: 'me', text: 'Perfect, I will share my live route once I leave.', time: '6:30 PM' },
      { from: 'them', text: 'Sounds good. Let’s meet at the metro security desk.', time: '6:31 PM' },
    ],
  },
}

function CircleChat() {
  const { userId } = useParams()
  const profile = CHAT_PROFILES[userId] || { name: 'Trusted Circle Member', initial: 'T', route: 'Trusted circle chat', messages: [] }
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState(profile.messages)
  const dateLabel = useMemo(() => new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date()), [])

  const sendMessage = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setMessages((current) => [...current, { from: 'me', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setDraft('')
  }

  return <main className="connect-page abstract-background min-h-screen px-4 py-7 text-burgundy-dark sm:py-10"><AmbientDots /><section className="relative mx-auto flex min-h-[42rem] max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-burgundy/10 bg-[#fffaf6]/95 shadow-xl"><header className="flex items-center gap-3 border-b border-burgundy/10 bg-white/90 px-5 py-4"><Link to="/connect" className="rounded-full p-2 text-burgundy transition hover:bg-burgundy/10" aria-label="Back to Connect Here"><ArrowLeft size={20} /></Link><span className="flex h-11 w-11 items-center justify-center rounded-full bg-burgundy text-lg font-bold text-cream">{profile.initial}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><h1 className="truncate font-display text-2xl font-bold">{profile.name}</h1><ShieldCheck size={16} className="text-emerald-600" /></div><p className="text-xs text-burgundy-dark/55">Trusted circle member · Demo chat</p></div><MessageCircle className="text-burgundy" size={21} /></header><div className="border-b border-burgundy/10 bg-[#f9ede7] px-5 py-3 text-sm"><p className="flex items-center gap-2 font-semibold text-burgundy"><MapPin size={16} />Travel plan: {profile.route}</p><p className="mt-1 text-xs text-burgundy-dark/55">Share plans with your trusted circle; avoid sharing sensitive information in public spaces.</p></div><div className="flex-1 space-y-4 overflow-y-auto px-5 py-5"><p className="mx-auto w-fit rounded-full bg-burgundy/10 px-3 py-1 text-[11px] font-semibold text-burgundy-dark/60">{dateLabel}</p>{messages.map((message, index) => <div key={`${message.time}-${index}`} className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${message.from === 'me' ? 'rounded-br-md bg-burgundy text-cream' : 'rounded-bl-md border border-burgundy/10 bg-white text-burgundy-dark'}`}><p>{message.text}</p><time className={`mt-1 block text-right text-[10px] ${message.from === 'me' ? 'text-cream/65' : 'text-burgundy-dark/40'}`}>{message.time}</time></div></div>)}</div><form onSubmit={sendMessage} className="flex gap-2 border-t border-burgundy/10 bg-white p-4"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Message ${profile.name.split(' ')[0]}…`} className="min-w-0 flex-1 rounded-full border border-burgundy/15 px-4 py-3 text-sm outline-none transition focus:border-burgundy" /><button type="submit" disabled={!draft.trim()} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-burgundy text-cream transition hover:bg-burgundy-light disabled:opacity-45" aria-label="Send message"><Send size={18} /></button></form></section></main>
}

export default CircleChat
