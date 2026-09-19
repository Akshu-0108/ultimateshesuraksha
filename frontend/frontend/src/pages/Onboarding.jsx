import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, User, Phone, Lock, Users } from 'lucide-react'
import { api, auth } from '../services/api'

function Onboarding() {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    password: '',
    emergencyContact: {
      name: '',
      mobileNumber: '',
      relationship: '',
    },
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleContactChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [field]: value },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const mobileDigits = formData.mobileNumber.replace(/\D/g, '')
    const contactDigits = formData.emergencyContact.mobileNumber.replace(/\D/g, '')
    if (mobileDigits.length !== 10 || contactDigits.length !== 10) {
      setError('Enter a valid 10-digit mobile number for both phone fields.')
      return
    }
    setIsSubmitting(true)
    try {
      const payload = { ...formData, mobileNumber: `+91${mobileDigits}`, emergencyContact: { ...formData.emergencyContact, mobileNumber: `+91${contactDigits}` } }
      const session = await api('/auth/signup', { method: 'POST', body: JSON.stringify(payload) })
      auth.setSession(session)
      setSubmitted(true)
      setTimeout(() => navigate('/'), 700)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-background min-h-screen flex items-center justify-center px-6 py-12">
      <div className="bg-cream rounded-2xl shadow-2xl max-w-lg w-full p-8">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="text-burgundy" size={20} />
          <span className="text-burgundy text-xs font-semibold tracking-wide uppercase">
            Secure Onboarding Protocol
          </span>
        </div>
                <h1 className="font-display text-burgundy-dark text-3xl font-bold mb-6">
          Create your safety profile
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            icon={User}
            label="Full Name / Preferred Alias"
            value={formData.name}
            onChange={(v) => handleChange('name', v)}
            placeholder="Aarohi Sen"
          />
          <Field
            icon={Phone}
            label="Mobile Number"
            value={formData.mobileNumber}
            onChange={(v) => handleChange('mobileNumber', v)}
            placeholder="98765 43210"
            prefix="+91"
          />
          <Field
            icon={Lock}
            label="Password"
            type="password"
            value={formData.password}
            onChange={(v) => handleChange('password', v)}
            placeholder="Create a password"
          />

          <div className="border-t border-burgundy/10 pt-4 mt-2">
            <p className="text-burgundy text-xs font-semibold uppercase tracking-wide mb-3">
              Primary Emergency Contact
            </p>
            <div className="flex flex-col gap-4">
              <Field
                icon={User}
                label="Contact Name"
                value={formData.emergencyContact.name}
                onChange={(v) => handleContactChange('name', v)}
                placeholder="Meena Verma"
              />
              <Field
                icon={Phone}
                label="Contact Mobile Number"
                value={formData.emergencyContact.mobileNumber}
                onChange={(v) => handleContactChange('mobileNumber', v)}
                placeholder="98110 22334"
                prefix="+91"
              />
              <Field
                icon={Users}
                label="Guardian Relationship"
                value={formData.emergencyContact.relationship}
                onChange={(v) => handleContactChange('relationship', v)}
                placeholder="Parent / Family"
              />
            </div>
          </div>

                    <button
            type="submit"
            className="mt-4 bg-burgundy text-cream font-semibold py-3 rounded-full hover:bg-burgundy-light transition"
          >
            {isSubmitting ? 'Creating profile…' : 'Complete Registration'}
          </button>

          {submitted && (
            <p className="text-green-700 text-sm text-center">
              Profile created — taking you to your dashboard.
            </p>
          )}
          {error && <p className="text-red-700 text-sm text-center">{error}</p>}
          <p className="text-center text-sm text-burgundy-dark/65">Already have an account? <Link to="/login" className="font-semibold text-burgundy underline underline-offset-4">Sign in</Link></p>
        </form>
      </div>
    </div>
  )
}

function Field({ icon: Icon, label, value, onChange, placeholder, type = 'text', prefix }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-burgundy/60 text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
      <div className="flex items-center gap-2 border border-burgundy/20 rounded-lg px-3 py-2 focus-within:border-burgundy">
        <Icon size={16} className="text-burgundy/50" />
        {prefix && <span className="border-r border-burgundy/15 pr-2 text-sm font-semibold text-burgundy/70">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'tel' || prefix ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value)}
          placeholder={placeholder}
          inputMode={prefix ? 'numeric' : undefined}
          className="flex-1 outline-none text-burgundy-dark text-sm placeholder:text-burgundy/30"
        />
      </div>
    </label>
  )
}

export default Onboarding
