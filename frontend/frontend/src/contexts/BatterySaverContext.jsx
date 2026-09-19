/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'

const BATTERY_SAVER_KEY = 'sheSurakshaBatterySaver'
const BatterySaverContext = createContext(null)

export function BatterySaverProvider({ children }) {
  const [batterySaver, setBatterySaver] = useState(() => localStorage.getItem(BATTERY_SAVER_KEY) === 'true')

  useEffect(() => {
    localStorage.setItem(BATTERY_SAVER_KEY, String(batterySaver))
  }, [batterySaver])

  return <BatterySaverContext.Provider value={{ batterySaver, setBatterySaver }}>{children}</BatterySaverContext.Provider>
}

export function useBatterySaver() {
  const context = useContext(BatterySaverContext)
  if (!context) throw new Error('useBatterySaver must be used inside BatterySaverProvider')
  return context
}
