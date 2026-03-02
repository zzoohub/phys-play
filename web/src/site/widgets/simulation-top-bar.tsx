import { Link } from '@tanstack/react-router'
import { useLang } from '#/shared/stores'
import { t } from '#/shared/constants'
import { IconButton } from '#/shared/ui'
import { LanguageToggle } from './language-toggle'

interface SimulationTopBarProps {
  moduleName: string
}

export function SimulationTopBar({ moduleName }: SimulationTopBarProps) {
  const { lang } = useLang()

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between h-12 px-3 md:px-4 bg-slate-950/60 backdrop-blur-md border-b border-white/[0.06]">
      {/* Left: Back */}
      <div className="flex items-center gap-1">
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          aria-label={t.backToHome[lang]}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="hidden sm:inline">{t.backToHome[lang]}</span>
        </Link>
      </div>

      {/* Center: Module name */}
      <h1 className="text-sm font-semibold text-white truncate max-w-[40vw]">
        {moduleName}
      </h1>

      {/* Right: Actions */}
      <div className="flex items-center gap-0.5">
        <IconButton label={t.share[lang]} size="sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
        </IconButton>
        <IconButton label={t.help[lang]} size="sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </IconButton>
        <div className="hidden sm:block">
          <LanguageToggle variant="minimal" />
        </div>
        <IconButton label={t.settings[lang]} size="sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </IconButton>
      </div>
    </div>
  )
}
