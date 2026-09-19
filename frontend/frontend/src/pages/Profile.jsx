import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, LogOut, Phone, ShieldCheck, UserRound, Users } from 'lucide-react'
import faceIcon from '../assets/face-icon.png'
import { api, auth } from '../services/api'

function Profile() {
  const [profile, setProfile] = useState(auth.getUser())
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api('/auth/profile').then(setProfile).catch((requestError) => setError(requestError.message))
  }, [])

  const logout = () => {
    auth.clearSession()
    navigate('/login', { replace: true })
  }

  const contact = profile?.emergencyContact
  return <main className="profile-page min-h-screen px-5 py-8 text-burgundy-dark md:px-10"><div className="mx-auto max-w-3xl"><Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-burgundy-dark/80 hover:text-burgundy"><ChevronLeft size={17} />Dashboard</Link><section className="mt-6 overflow-hidden rounded-[2rem] border border-gold/25 bg-[#fffdf7]/90 shadow-2xl backdrop-blur"><div className="border-b border-gold/20 bg-[#f7eddd]/70 px-7 py-8"><img src={faceIcon} alt="SheSuraksha" className="w-11" /><p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-gold">Your safety profile</p><h1 className="mt-2 font-display text-4xl font-bold">{profile?.name || 'Loading profile…'}</h1><p className="mt-2 text-sm text-burgundy-dark/65">Your registration details and emergency contact.</p></div><div className="grid gap-4 p-6 md:grid-cols-2"><ProfileCard icon={UserRound} label="Full name" value={profile?.name} /><ProfileCard icon={Phone} label="Mobile number" value={profile?.mobileNumber} /><ProfileCard icon={Users} label="Emergency contact" value={contact?.name} /><ProfileCard icon={Phone} label="Emergency contact phone" value={contact?.mobileNumber} note={contact?.relationship} /></div>{error && <p className="px-7 pb-4 text-sm text-red-700">{error}</p>}<div className="flex flex-wrap items-center justify-between gap-4 border-t border-gold/20 px-7 py-5"><span className="flex items-center gap-2 text-xs text-burgundy-dark/60"><ShieldCheck size={15} className="text-gold" />Profile secured with your sign-in session</span><button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-red-700/25 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"><LogOut size={16} />Log out</button></div></section></div></main>
}

function ProfileCard({ icon: Icon, label, value, note }) {
  return <div className="rounded-2xl border border-burgundy/10 bg-[#f9f1e5] p-4"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold"><Icon size={15} />{label}</p><strong className="mt-3 block text-lg text-burgundy-dark">{value || 'Not available'}</strong>{note && <span className="mt-1 block text-sm text-burgundy-dark/60">{note}</span>}</div>
}

export default Profile
