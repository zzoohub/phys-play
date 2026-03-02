import { Link } from '@tanstack/react-router'
import { useLang } from '#/shared/stores'
import { t } from '#/shared/constants'
import type { TrackInfo } from '#/shared/constants'

interface TrackCardProps {
  track: TrackInfo
}

export function TrackCard({ track }: TrackCardProps) {
  const { lang } = useLang()
  const availableCount = track.modules.filter(m => m.available).length
  const totalCount = track.available ? track.modules.length : 6

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border p-4
        ${track.available
          ? 'border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 bg-slate-900/40 dark:bg-slate-900/40 light:bg-white hover:border-cyan-700/40 dark:hover:border-cyan-700/40 light:hover:border-cyan-400/40'
          : 'border-slate-800/30 dark:border-slate-800/30 light:border-slate-200/60 bg-slate-900/20 dark:bg-slate-900/20 light:bg-slate-50/60 opacity-60'
        }
        transition-all duration-200
      `}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xl" aria-hidden="true">{track.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white dark:text-white light:text-slate-900 truncate">
            {track.name[lang]}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-500">
            {track.subtitle[lang]}
          </p>
        </div>
      </div>

      {track.available ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-500"
              style={{ width: `${(availableCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-slate-500 shrink-0">
            {availableCount}/{totalCount}
          </span>
        </div>
      ) : (
        <span className="inline-block rounded-full bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-200 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
          {t.comingSoon[lang]}
        </span>
      )}
    </div>
  )
}

/* Full-sized track card for /tracks page */
export function TrackSection({ track }: TrackCardProps) {
  const { lang } = useLang()

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl" aria-hidden="true">{track.icon}</span>
        <div>
          <h2 className="text-lg font-semibold text-white dark:text-white light:text-slate-900">
            {track.name[lang]}
          </h2>
          <p className="text-sm text-slate-500">
            {track.subtitle[lang]}
          </p>
        </div>
        {!track.available && (
          <span className="ml-auto rounded-full bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-200 px-3 py-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
            {t.comingSoon[lang]}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {track.modules.length > 0
          ? track.modules.map(mod => (
              <TrackModuleCard key={`${mod.trackId}-${mod.moduleId}`} module={mod} lang={lang} />
            ))
          : Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/40 dark:border-slate-800/40 light:border-slate-300/40 bg-slate-900/20 dark:bg-slate-900/20 light:bg-slate-50 p-4 min-h-[120px]"
              >
                <div className="h-6 w-6 rounded bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-200 mb-2" />
                <div className="h-3 w-16 rounded bg-slate-800/30 dark:bg-slate-800/30 light:bg-slate-200/60" />
              </div>
            ))
        }
      </div>
    </section>
  )
}

function TrackModuleCard({ module, lang }: { module: import('#/shared/constants').ModuleInfo; lang: import('#/shared/types').Language }) {
  if (!module.available) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/40 dark:border-slate-800/40 light:border-slate-300/40 bg-slate-900/20 dark:bg-slate-900/20 light:bg-slate-50 p-4 min-h-[120px] opacity-50">
        <div className={`mb-2 h-8 w-8 rounded-lg bg-gradient-to-br ${module.themeGradient} opacity-30`} />
        <p className="text-xs font-medium text-slate-500 text-center mb-1">{module.name[lang]}</p>
        <span className="text-[10px] text-slate-600 uppercase tracking-wider">{t.comingSoon[lang]}</span>
      </div>
    )
  }

  return (
    <Link
      to="/module/$trackId/$moduleId"
      params={{ trackId: module.trackId, moduleId: module.moduleId }}
      className="group flex flex-col items-center justify-center rounded-xl border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 bg-slate-900/40 dark:bg-slate-900/40 light:bg-white hover:border-cyan-700/40 dark:hover:border-cyan-700/40 light:hover:border-cyan-400/40 p-4 min-h-[120px] transition-all duration-200 hover:shadow-lg hover:shadow-cyan-900/10"
    >
      <div className={`mb-2 h-8 w-8 rounded-lg bg-gradient-to-br ${module.themeGradient} group-hover:scale-110 transition-transform duration-200`} />
      <p className="text-xs font-medium text-white dark:text-white light:text-slate-900 text-center mb-1">{module.name[lang]}</p>
      <span className="text-[10px] text-cyan-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{t.startExploring[lang]}</span>
    </Link>
  )
}
