import { useState, useEffect } from 'react'
import type { Language } from '#/shared/types'
import { t } from '#/shared/constants/i18n'

interface LoadingScreenProps {
  moduleKey: string
  progress: number
  lang: Language
  themeGradient?: string
}

export function LoadingScreen({ moduleKey, progress, lang, themeGradient = 'from-slate-900 to-slate-800' }: LoadingScreenProps) {
  const [tipIndex, setTipIndex] = useState(0)
  const tips = moduleKey in t.loadingTips
    ? t.loadingTips[moduleKey as keyof typeof t.loadingTips]
    : t.loadingTips['1-1']

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [tips.length])

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br ${themeGradient}`}>
      {/* Module icon placeholder */}
      <div className="mb-8 h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
        <svg className="h-10 w-10 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      </div>

      {/* Loading text */}
      <p className="mb-8 text-sm font-medium text-white/80">
        {t.preparingExperience[lang]}
      </p>

      {/* Progress bar */}
      <div className="w-64 mb-3">
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-white/90 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <p className="mb-10 text-xs tabular-nums text-white/50">{Math.round(progress)}%</p>

      {/* Loading tip */}
      <p className="max-w-xs text-center text-xs text-white/40 transition-opacity duration-500" key={tipIndex}>
        {tips[tipIndex]?.[lang]}
      </p>
    </div>
  )
}
