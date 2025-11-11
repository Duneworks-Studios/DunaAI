'use client'

import { createContext, useContext } from 'react'

interface ThemeContextType {
  theme: 'gold'
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always use gold/black theme - no toggle needed
  return (
    <ThemeContext.Provider value={{ theme: 'gold', isDark: true }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
