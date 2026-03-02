import { useLang } from '#/shared/stores'
import { t, TRACKS } from '#/shared/constants'
import { MODULES } from '#/shared/constants/modules'
import { Header, Footer, ModuleCard, TrackCard } from '#/site/widgets'

export function LandingView() {
  const { lang } = useLang()

  const availableModules = [MODULES['1-1'], MODULES['1-2'], MODULES['1-3']]

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 dark:bg-slate-950 light:bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <section className="relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-slate-100 light:via-white light:to-slate-50" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-cyan-500/[0.04] blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/[0.03] blur-3xl" />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />

          <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-16 md:px-6 md:pt-20 md:pb-24">
            {/* 3D demo placeholder */}
            <div className="mx-auto mb-8 max-w-3xl aspect-[16/9] rounded-2xl overflow-hidden border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 light:from-slate-100 light:via-white light:to-slate-100 shadow-2xl shadow-cyan-900/10">
              <div className="flex h-full items-center justify-center">
                {/* Animated placeholder shapes */}
                <div className="relative">
                  <div className="absolute -top-8 -left-12 h-16 w-16 rounded-xl bg-cyan-500/10 border border-cyan-500/20 animate-float" />
                  <div className="absolute -bottom-6 -right-10 h-12 w-12 rounded-lg bg-blue-500/10 border border-blue-500/20 animate-float-delayed" />
                  <div className="absolute top-4 right-[-4rem] h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 animate-float-slow" />
                  <div className="flex flex-col items-center gap-3">
                    <svg className="h-12 w-12 text-slate-600 dark:text-slate-600 light:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                    </svg>
                    <p className="text-xs text-slate-600 dark:text-slate-600 light:text-slate-400 tracking-wide">
                      {lang === 'en' ? 'Interactive 3D Demo' : '인터랙티브 3D 데모'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-center text-lg md:text-xl font-light tracking-wide text-slate-300 dark:text-slate-300 light:text-slate-700 mb-2">
              {t.tagline[lang]}
            </p>
          </div>
        </section>

        {/* Module cards section */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {availableModules.map((mod, idx) => (
                <ModuleCard key={`${mod.trackId}-${mod.moduleId}`} module={mod} index={idx} />
              ))}
            </div>
          </div>
        </section>

        {/* Track overview (Coming Soon) */}
        <section className="relative border-t border-slate-800/30 dark:border-slate-800/30 light:border-slate-200">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
            <p className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-slate-600 dark:text-slate-600 light:text-slate-400">
              {t.moreComingSoon[lang]}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TRACKS.map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
