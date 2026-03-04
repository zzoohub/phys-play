import { Link, useRouterState } from '@tanstack/react-router'
import { m } from '#/paraglide/messages.js'
import { useLocale } from '#/app/locale-context'

const navLinks = [
  { to: '/hub', label: () => m.nav_hub() },
  { to: '/progress', label: () => m.nav_progress() },
  { to: '/settings', label: () => m.nav_settings() },
] as const

export function SiteNav() {
  const { location } = useRouterState()
  const { locale, switchLocale } = useLocale()

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border-dark bg-surface-dark/80 backdrop-blur-md px-10 py-4 sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-4 text-primary">
        <span className="material-symbols-outlined text-3xl">science</span>
        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
          PhysPlay
        </h2>
      </Link>
      <nav className="flex items-center gap-9">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={
                isActive
                  ? 'text-primary text-sm font-semibold leading-normal border-b-2 border-primary pb-1'
                  : 'text-slate-400 hover:text-white transition-colors text-sm font-medium leading-normal'
              }
            >
              {link.label()}
            </Link>
          )
        })}
        <button
          onClick={switchLocale}
          className="text-xs font-bold px-2.5 py-1 rounded-full border border-border-dark text-slate-400 hover:text-white hover:border-primary/50 transition-colors"
        >
          {locale === 'en' ? 'KO' : 'EN'}
        </button>
      </nav>
    </header>
  )
}
