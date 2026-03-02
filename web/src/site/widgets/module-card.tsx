import { Link } from '@tanstack/react-router'
import { useLang } from '#/shared/stores'
import { t } from '#/shared/constants'
import type { ModuleInfo } from '#/shared/constants'

interface ModuleCardProps {
  module: ModuleInfo
  index: number
}

const MODULE_ICONS = [
  // Motion & Force — arrow/velocity
  <svg key="1" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>,
  // Energy & Work — lightning/energy
  <svg key="2" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>,
  // Waves — wave pattern
  <svg key="3" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12c1.5-3 3-4.5 4.5-4.5S9 10.5 10.5 12s2 4.5 3.5 4.5S17 14 18.5 12 20.5 7.5 22 7.5" />
  </svg>,
]

export function ModuleCard({ module, index }: ModuleCardProps) {
  const { lang } = useLang()

  return (
    <Link
      to="/module/$trackId/$moduleId"
      params={{ trackId: module.trackId, moduleId: module.moduleId }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 bg-slate-900/50 dark:bg-slate-900/50 light:bg-white hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-900/10"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Thumbnail placeholder */}
      <div className={`relative h-44 bg-gradient-to-br ${module.themeGradient} overflow-hidden`}>
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-white/30 group-hover:text-white/50 transition-colors duration-300 group-hover:scale-110 transition-transform">
          {MODULE_ICONS[index] ?? MODULE_ICONS[0]}
        </div>
        {/* Subtle glow */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 h-24 w-48 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1.5 text-base font-semibold text-white dark:text-white light:text-slate-900">
          {module.name[lang]}
        </h3>
        {module.description && (
          <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-400 dark:text-slate-400 light:text-slate-600">
            {module.description[lang]}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors">
          <span>{t.startExploring[lang]}</span>
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
