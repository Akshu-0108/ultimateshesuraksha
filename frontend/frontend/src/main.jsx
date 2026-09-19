import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { BatterySaverProvider } from './contexts/BatterySaverContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <BatterySaverProvider><App /></BatterySaverProvider>
    </BrowserRouter>
  </StrictMode>,
)
