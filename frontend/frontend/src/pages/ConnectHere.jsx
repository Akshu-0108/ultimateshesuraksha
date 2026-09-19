import { useEffect, useState } from 'react'
import { Users, ShieldCheck, Search, UserPlus, Check, Clock, ArrowRight, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import faceIcon from '../assets/face-icon.png'
import { api, auth } from '../services/api'
import AmbientDots from '../components/AmbientDots'

const MOCK_CIRCLE = [
  { userId: 'demo-priya', name: 'Priya Nair', verified: true },
  { userId: 'demo-rhea', name: 'Rhea Kapoor', verified: true },
]
const MOCK_TRIPS = [
  { requestId: 'demo-trip-1', userName: 'Priya Nair', userVerified: true, from: 'Hauz Khas', to: 'Kashmere Gate', departureTime: '2026-09-15T18:30:00.000Z' },
  { requestId: 'demo-trip-2', userName: 'Rhea Kapoor', userVerified: true, from: 'Saket', to: 'Connaught Place', departureTime: '2026-09-15T19:10:00.000Z' },
]

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function CircleMember({ person }) {
  return (
    <Link to={`/connect/chat/${person.userId}`} className="flex items-center justify-between bg-white rounded-xl border border-burgundy/10 p-3 transition hover:-translate-y-0.5 hover:border-burgundy/35 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy font-semibold text-sm">
          {person.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-burgundy-dark font-medium text-sm">{person.name}</span>
            {person.verified && <ShieldCheck size={13} className="text-green-600" />}
          </div>
          <span className="text-burgundy-dark/40 text-xs">
            Trusted circle member
          </span>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7e4e7] px-3 py-1.5 text-xs font-semibold text-burgundy"><MessageCircle size={14} />Chat</span>
    </Link>
  )
}

function SearchResult({ person, requested, onRequest }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-burgundy/10 p-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy font-semibold text-sm">
          {person.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-burgundy-dark font-medium text-sm">{person.name}</span>
            {person.verified && <ShieldCheck size={13} className="text-green-600" />}
          </div>
          <span className="text-burgundy-dark/40 text-xs">
            {person.connectionStatus === 'pending_sent' ? 'Request sent' : person.connectionStatus === 'connected' ? 'Already in your circle' : 'Connection required before trip sharing'}
          </span>
        </div>
      </div>
      <button
        onClick={() => onRequest(person.userId)}
        disabled={requested || person.connectionStatus === 'pending_sent' || person.connectionStatus === 'connected'}
        className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition ${
          (requested || person.connectionStatus === 'pending_sent' || person.connectionStatus === 'connected')
            ? 'bg-green-600/10 text-green-700 cursor-default'
            : 'bg-burgundy text-cream hover:bg-burgundy-light'
        }`}
      >
        {(requested || person.connectionStatus !== 'none') ? <Check size={14} /> : <UserPlus size={14} />}
        {requested || person.connectionStatus === 'pending_sent' ? 'Requested' : person.connectionStatus === 'connected' ? 'Connected' : 'Connect'}
      </button>
    </div>
  )
}

function TripCard({ trip }) {
  return (
    <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy font-semibold">
          {trip.userName.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-burgundy-dark font-semibold text-sm">{trip.userName}</span>
            {trip.userVerified && <ShieldCheck size={14} className="text-green-600" />}
          </div>
          <div className="text-burgundy-dark/50 text-xs">
            {trip.from} → {trip.to}
          </div>
          <div className="text-burgundy-dark/40 text-xs flex items-center gap-1">
            <Clock size={11} />
            Departing {formatTime(trip.departureTime)}
          </div>
        </div>
      </div>
      <button className="text-burgundy text-sm font-medium flex items-center gap-1 hover:underline">
        Join
        <ArrowRight size={14} />
      </button>
    </div>
  )
}

function ConnectHere() {
  const [searchTerm, setSearchTerm] = useState('')
  const [requestedIds, setRequestedIds] = useState([])
  const [circle, setCircle] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [trips, setTrips] = useState([])
  const [error, setError] = useState('')
  const [tab, setTab] = useState('circle') // 'circle' | 'find'

  const handleRequest = async (userId) => {
    try {
      await api('/connections/request', { method: 'POST', body: JSON.stringify({ recipientId: userId }) })
      setRequestedIds((prev) => [...prev, userId])
    } catch (requestError) { setError(requestError.message) }
  }

  useEffect(() => {
    if (!auth.getToken()) return
    Promise.all([api('/connections'), api('/travel-circle/matches')])
      .then(([connections, matches]) => { setCircle(connections.connections.length ? connections.connections : MOCK_CIRCLE); setTrips(matches.matches.length ? matches.matches : MOCK_TRIPS) })
      .catch((requestError) => { setCircle(MOCK_CIRCLE); setTrips(MOCK_TRIPS); setError(`Live circle unavailable: ${requestError.message}`) })
  }, [])

  useEffect(() => {
    if (!auth.getToken() || !searchTerm.trim()) return undefined
    const timer = setTimeout(() => api(`/users/search?query=${encodeURIComponent(searchTerm)}`).then(({ users }) => setSearchResults(users)).catch((requestError) => setError(requestError.message)), 250)
    return () => clearTimeout(timer)
  }, [searchTerm])

  return (
    <div className="connect-page abstract-background min-h-screen px-4 py-10 flex justify-center"><AmbientDots />
      <div className="max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-6">
          <img src={faceIcon} alt="SheSuraksha" className="w-9 h-auto" />
        </div>

        <h1 className="font-display text-burgundy-dark text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
          <Users size={28} className="text-burgundy" />
          Connect Here
        </h1>
        <p className="text-burgundy-dark/60 text-sm mb-6">
          Travel plans are only ever visible to people already in your
          trusted circle — never random strangers.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('circle')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              tab === 'circle'
                ? 'bg-burgundy text-cream'
                : 'bg-white text-burgundy-dark/60 border border-burgundy/10'
            }`}
          >
            My Circle ({circle.length})
          </button>
          <button
            onClick={() => setTab('find')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              tab === 'find'
                ? 'bg-burgundy text-cream'
                : 'bg-white text-burgundy-dark/60 border border-burgundy/10'
            }`}
          >
            Find People
          </button>
        </div>

        {tab === 'find' && (
          <div className="mb-6">
            <div className="flex items-center gap-2 bg-white border border-burgundy/15 rounded-full px-4 py-2 mb-4">
              <Search size={16} className="text-burgundy-dark/40" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="flex-1 outline-none text-sm text-burgundy-dark placeholder:text-burgundy-dark/30"
              />
            </div>
            <div className="flex flex-col gap-2">
              {searchResults.map((person) => (
                <SearchResult
                  key={person.userId}
                  person={person}
                  requested={requestedIds.includes(person.userId)}
                  onRequest={handleRequest}
                />
              ))}
              {searchTerm && searchResults.length === 0 && (
                <p className="text-burgundy-dark/40 text-sm text-center py-4">
                  No one found — connection requests need mutual acceptance
                  before you can share trips.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === 'circle' && (
          <>
            <div className="flex flex-col gap-2 mb-8">
              {circle.map((person) => (
                <CircleMember key={person.userId} person={person} />
              ))}
            </div>

            <h2 className="text-burgundy-dark font-semibold text-sm uppercase tracking-wide mb-3">
              Trips From Your Circle
            </h2>
            <div className="flex flex-col gap-3">
              {trips.map((trip) => (
                <TripCard key={trip.requestId} trip={trip} />
              ))}
            </div>{error && <p className="mt-4 text-sm text-red-700">{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}

export default ConnectHere
