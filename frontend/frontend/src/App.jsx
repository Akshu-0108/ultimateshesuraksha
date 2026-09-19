import { useEffect } from 'react'
import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import AreaAudit from './pages/AreaAudit'
import ConnectHere from './pages/ConnectHere'
import Community from './pages/Community'
import Chatbot from './pages/Chatbot'
import Dashboard from './pages/Dashboard'
import SafetyMap from './pages/SafetyMap'
import SavedRoutes from './pages/SavedRoutes'
import SurvivalMode from './pages/SurvivalMode'
import SafeHavens from './pages/SafeHavens'
import MetroTransit from './pages/MetroTransit'
import Profile from './pages/Profile'
import CircleChat from './pages/CircleChat'
import { auth } from './services/api'
import { useBatterySaver } from './contexts/BatterySaverContext'

function ProtectedRoute({ children }) {
  return auth.getToken() ? children : <Navigate to="/onboarding" replace />
}

function App() {
  const { batterySaver } = useBatterySaver()
  const location = useLocation()

  useEffect(() => {
    const isActive = batterySaver && location.pathname !== '/'
    document.body.classList.toggle('battery-saver-active', isActive)
    return () => document.body.classList.remove('battery-saver-active')
  }, [batterySaver, location.pathname])

  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Landing /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/safety-map" element={<ProtectedRoute><SafetyMap /></ProtectedRoute>} />
      <Route path="/saved-routes" element={<ProtectedRoute><SavedRoutes /></ProtectedRoute>} />
      <Route path="/survival-mode" element={<ProtectedRoute><SurvivalMode /></ProtectedRoute>} />
      <Route path="/safe-havens" element={<ProtectedRoute><SafeHavens /></ProtectedRoute>} />
      <Route path="/public-transport" element={<ProtectedRoute><MetroTransit /></ProtectedRoute>} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/area-audit" element={<ProtectedRoute><AreaAudit /></ProtectedRoute>} />
      <Route path="/routes" element={<Navigate to="/safety-map" replace />} />
      <Route path="/connect" element={<ProtectedRoute><ConnectHere /></ProtectedRoute>} />
      <Route path="/connect/chat/:userId" element={<ProtectedRoute><CircleChat /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
