import { Link } from '@tanstack/react-router'
import { useLang } from '#/shared/stores'
import { t, TRACKS } from '#/shared/constants'
import { Header, Footer, TrackSection } from '#/site/widgets'

export function TracksView() {
  const { lang } = useLang()

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 dark:bg-slate-950 light:bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Page header */}
        <div className="border-b border-slate-800/30 dark:border-slate-800/30 light:border-slate-200">
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
            <div className="flex items-center gap-3 mb-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                {t.backToHome[lang]}
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-white dark:text-white light:text-slate-900">
              {t.allExperiences[lang]}
            </h1>
          </div>
        </div>

        {/* Track sections */}
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
          {TRACKS.map(track => (
            <TrackSection key={track.id} track={track} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
