import { Link } from '@tanstack/react-router'
import ThemeToggle from './theme-toggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex items-center gap-4 py-3">
        <Link
          to="/"
          className="text-sm font-semibold text-[var(--sea-ink)] no-underline"
        >
          Phys Play
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
