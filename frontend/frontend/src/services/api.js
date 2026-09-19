const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'sheSurakshaToken'
const USER_KEY = 'sheSurakshaUser'

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  setSession: (session) => {
    localStorage.setItem(TOKEN_KEY, session.token)
    localStorage.setItem(USER_KEY, JSON.stringify({ userId: session.userId, name: session.name, mobileNumber: session.mobileNumber }))
  },
  clearSession: () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY) },
}

export async function api(path, options = {}) {
  const token = auth.getToken()
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  if (response.status === 204) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'Something went wrong. Please try again.')
  return payload
}

export { API_BASE_URL }
