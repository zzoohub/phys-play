import { Link } from '@tanstack/react-router'
import { useLang } from '#/shared/stores'
import { t } from '#/shared/constants'
import { LanguageToggle } from './language-toggle'
import { ThemeToggle } from './theme-toggle'

export function Header() {
  const { lang } = useLang()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/50 dark:border-slate-800/50 light:border-slate-200 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 group" aria-label={t.brandName[lang]}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-white dark:text-white light:text-slate-900">
            {t.brandName[lang]}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
