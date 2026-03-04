import { createContext, useContext, useState, useCallback } from 'react'
import { getLocale, setLocale as paraglideSetLocale } from '#/paraglide/runtime.js'

type Locale = 'en' | 'ko'

interface LocaleContextValue {
  locale: Locale
  switchLocale: () => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  switchLocale: () => {},
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => getLocale() as Locale)

  const switchLocale = useCallback(() => {
    const next: Locale = locale === 'en' ? 'ko' : 'en'
    paraglideSetLocale(next, { reload: false })
    setLocale(next)
  }, [locale])

  return (
    <LocaleContext value={{ locale, switchLocale }}>
      {children}
    </LocaleContext>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
