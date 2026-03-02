import { LanguageContext, useLanguageState, ThemeContext, useThemeState } from '#/shared/stores'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const languageState = useLanguageState()
  const themeState = useThemeState()

  return (
    <LanguageContext value={languageState}>
      <ThemeContext value={themeState}>
        {children}
      </ThemeContext>
    </LanguageContext>
  )
}
