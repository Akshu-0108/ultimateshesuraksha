import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, LogIn, Phone, ShieldCheck } from 'lucide-react'
import faceIcon from '../assets/face-icon.png'
import { api, auth } from '../services/api'

function Login() {
  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const mobileDigits = mobileNumber.replace(/\D/g, '')
      if (mobileDigits.length !== 10) throw new Error('Enter a valid 10-digit mobile number.')
      const session = await api('/auth/login', { method: 'POST', body: JSON.stringify({ mobileNumber: `+91${mobileDigits}`, password }) })
      auth.setSession(session)
      navigate('/')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-background min-h-screen px-5 py-10 flex items-center justify-center">
      <section className="w-full max-w-md overflow-hidden rounded-[2rem] bg-cream shadow-2xl">
        <div className="bg-gradient-to-br from-[#4c1728] to-[#1b030a] px-8 py-9 text-cream">
          <img src={faceIcon} alt="SheSuraksha" className="w-12" />
          <p className="mt-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-gold"><ShieldCheck size={15} /> Secure access</p>
          <h1 className="mt-3 font-display text-4xl font-bold">Welcome back.</h1>
          <p className="mt-3 text-sm leading-6 text-cream/70">Sign in to access your saved routes, trusted circle, and safety profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-8">
          <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-burgundy/65">Mobile number</span><span className="mt-2 flex items-center gap-2 rounded-xl border border-burgundy/20 bg-white px-3 py-3 focus-within:border-burgundy"><Phone size={17} className="text-burgundy/55" /><strong className="border-r border-burgundy/15 pr-2 text-sm text-burgundy/70">+91</strong><input required inputMode="numeric" value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" className="w-full bg-transparent text-sm text-burgundy-dark outline-none placeholder:text-burgundy/30" /></span></label>
          <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-burgundy/65">Password</span><span className="mt-2 flex items-center gap-2 rounded-xl border border-burgundy/20 bg-white px-3 py-3 focus-within:border-burgundy"><Lock size={17} className="text-burgundy/55" /><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" className="w-full bg-transparent text-sm text-burgundy-dark outline-none placeholder:text-burgundy/30" /></span></label>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-burgundy py-3 text-sm font-semibold text-cream transition hover:bg-burgundy-light disabled:opacity-60"><LogIn size={17} />{isSubmitting ? 'Signing in…' : 'Sign in securely'}</button>
          <p className="text-center text-sm text-burgundy-dark/65">New to SheSuraksha? <Link to="/onboarding" className="font-semibold text-burgundy underline underline-offset-4">Create your safety profile</Link></p>
        </form>
      </section>
    </main>
  )
}

export default Login
