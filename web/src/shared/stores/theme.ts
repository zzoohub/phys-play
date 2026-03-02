import { useState, useCallback, createContext, useContext } from 'react'
import type { Theme } from '#/shared/types'

function detectTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('phys-play-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
})

export function useThemeState() {
  const [theme, setThemeState] = useState<Theme>(detectTheme)

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    if (typeof window !== 'undefined') {
      localStorage.setItem('phys-play-theme', t)
      document.documentElement.classList.toggle('dark', t === 'dark')
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return { theme, setTheme, toggleTheme }
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
