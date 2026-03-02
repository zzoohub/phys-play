import { useState, useCallback, createContext, useContext } from 'react'
import type { Language } from '#/shared/types'

function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem('phys-play-lang')
  if (stored === 'ko' || stored === 'en') return stored
  return navigator.language.startsWith('ko') ? 'ko' : 'en'
}

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  toggleLang: () => void
}

export const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
})

export function useLanguageState() {
  const [lang, setLangState] = useState<Language>(detectLanguage)

  const setLang = useCallback((l: Language) => {
    setLangState(l)
    if (typeof window !== 'undefined') {
      localStorage.setItem('phys-play-lang', l)
      document.documentElement.lang = l
    }
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'ko' : 'en')
  }, [lang, setLang])

  return { lang, setLang, toggleLang }
}

export function useLang(): LanguageContextValue {
  return useContext(LanguageContext)
}
