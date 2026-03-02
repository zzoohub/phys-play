import { Link } from '@tanstack/react-router'
import type { Language } from '#/shared/types'
import { t, AVAILABLE_MODULES } from '#/shared/constants'

interface ErrorBaseProps {
  lang: Language
}

/* E1: WebGL/WebGPU not supported */
export function WebGLNotSupported({ lang }: ErrorBaseProps) {
  const browsers = ['Chrome 80+', 'Safari 15+', 'Firefox 85+', 'Edge 80+']

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="mb-6 h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="mb-2 text-lg font-semibold text-white dark:text-white light:text-slate-900">
        {t.webglNotSupported[lang]}
      </h2>
      <p className="mb-4 text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
        {t.webglBrowserList[lang]}
      </p>
      <ul className="mb-8 space-y-1">
        {browsers.map(b => (
          <li key={b} className="text-sm text-slate-300 dark:text-slate-300 light:text-slate-700">{b}</li>
        ))}
      </ul>
      <Link
        to="/"
        className="rounded-lg bg-slate-700 hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 light:bg-slate-200 light:hover:bg-slate-300 px-5 py-2.5 text-sm font-medium text-white dark:text-white light:text-slate-900 transition-colors"
      >
        {t.viewOtherModules[lang]}
      </Link>
    </div>
  )
}

/* E2: Network error */
export function NetworkError({ lang, onRetry }: ErrorBaseProps & { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="mb-6 h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
        <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      </div>
      <h2 className="mb-2 text-lg font-semibold text-white dark:text-white light:text-slate-900">
        {t.networkError[lang]}
      </h2>
      <p className="mb-8 text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
        {t.networkErrorDesc[lang]}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-sm font-medium text-white transition-colors cursor-pointer"
        >
          {t.tryAgain[lang]}
        </button>
        <Link
          to="/"
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors"
        >
          {t.viewOtherModules[lang]}
        </Link>
      </div>
    </div>
  )
}

/* E3: Runtime crash (inline overlay) */
export function RuntimeCrash({ lang, onReset }: ErrorBaseProps & { onReset: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 max-w-sm rounded-2xl bg-slate-900/90 border border-slate-700/50 p-6 text-center shadow-2xl">
        <p className="mb-6 text-sm text-slate-300">
          {t.runtimeCrash[lang]}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-colors cursor-pointer"
          >
            {t.resetAndRestart[lang]}
          </button>
          <Link
            to="/"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            {t.viewOtherModules[lang]}
          </Link>
        </div>
      </div>
    </div>
  )
}

/* E4: Coming Soon */
export function ComingSoonModule({ lang }: ErrorBaseProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="mb-6 h-16 w-16 rounded-2xl bg-slate-500/10 flex items-center justify-center">
        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="mb-2 text-lg font-semibold text-white dark:text-white light:text-slate-900">
        {t.comingSoonModule[lang]}
      </h2>
      <p className="mb-8 text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
        {t.tryAvailableModule[lang]}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {AVAILABLE_MODULES.map(mod => (
          <Link
            key={`${mod.trackId}-${mod.moduleId}`}
            to="/module/$trackId/$moduleId"
            params={{ trackId: mod.trackId, moduleId: mod.moduleId }}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 light:bg-slate-100 light:hover:bg-slate-200 border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300 px-4 py-2.5 text-sm font-medium text-white dark:text-white light:text-slate-900 transition-colors"
          >
            {mod.name[lang]}
          </Link>
        ))}
      </div>
    </div>
  )
}
