import { useCoreLoopStore } from '#/platform/stores/core-loop.ts'
import { m } from '#/paraglide/messages.js'

export function HudBottomBar() {
  const phase = useCoreLoopStore((s) => s.phase)

  if (phase === 'IDLE' || phase === 'DISCOVER') return null

  return (
    <div className="absolute bottom-0 inset-x-0 flex justify-center pb-6 pointer-events-auto">
      <div className="px-6 py-3 rounded-full bg-bg-dark/70 backdrop-blur-md border border-primary/20 flex items-center gap-3">
        {phase === 'PREDICT' && (
          <>
            <span className="material-symbols-outlined text-primary/80 text-lg">lightbulb</span>
            <p className="text-slate-300 text-sm font-medium">
              {m.predict_hint()}
            </p>
          </>
        )}
        {phase === 'PLAY' && (
          <>
            <span className="material-symbols-outlined text-primary/80 text-lg">touch_app</span>
            <p className="text-slate-300 text-sm font-medium">
              {m.play_hint()}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
