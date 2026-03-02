import { useLang } from '#/shared/stores'
import { t } from '#/shared/constants'

interface PlaybackBarProps {
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  onNextModule?: () => void
  showVectors: boolean
  onToggleVectors: () => void
  onShowFormula: () => void
  hasNextModule: boolean
}

export function PlaybackBar({
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onNextModule,
  showVectors,
  onToggleVectors,
  onShowFormula,
  hasNextModule,
}: PlaybackBarProps) {
  const { lang } = useLang()

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-950/70 backdrop-blur-md border-t border-white/[0.06] md:border-t-0 md:border-b md:border-white/[0.06]">
      {/* Playback controls */}
      <div className="flex items-center gap-1">
        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          aria-label={t.reset[lang]}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          title={t.reset[lang]}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          aria-label={isPlaying ? t.pause[lang] : t.play[lang]}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          title={isPlaying ? t.pause[lang] : t.play[lang]}
        >
          {isPlaying ? (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Next module */}
        {hasNextModule && (
          <button
            type="button"
            onClick={onNextModule}
            aria-label={t.nextModule[lang]}
            className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            title={t.nextModule[lang]}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
            </svg>
            <span className="hidden sm:inline">{t.nextModule[lang]}</span>
          </button>
        )}
      </div>

      {/* Right side: overlay toggles + formula */}
      <div className="flex items-center gap-1">
        {/* Vectors toggle */}
        <button
          type="button"
          onClick={onToggleVectors}
          aria-label={t.showVectors[lang]}
          aria-pressed={showVectors}
          className={`
            inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all cursor-pointer
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400
            ${showVectors
              ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
            }
          `}
          title={t.showVectors[lang]}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
          <span className="hidden sm:inline">{t.showVectors[lang]}</span>
        </button>

        {/* Show formula */}
        <button
          type="button"
          onClick={onShowFormula}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          title={t.showFormula[lang]}
        >
          <span className="text-sm italic font-serif">f</span>
          <span className="hidden sm:inline">{t.showFormula[lang]}</span>
        </button>
      </div>
    </div>
  )
}
