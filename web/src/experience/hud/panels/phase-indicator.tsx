import type { CoreLoopPhase } from '#/platform/types/index.ts'
import { m } from '#/paraglide/messages.js'

interface PhaseIndicatorProps {
  phase: CoreLoopPhase
}

const phases: { key: CoreLoopPhase; label: () => string }[] = [
  { key: 'PREDICT', label: () => m.phase_predict() },
  { key: 'PLAY', label: () => m.phase_play() },
  { key: 'DISCOVER', label: () => m.phase_discover() },
]

export function PhaseIndicator({ phase }: PhaseIndicatorProps) {
  if (phase === 'IDLE') return null

  return (
    <div className="flex items-center gap-1">
      {phases.map(({ key, label }, i) => {
        const isActive = key === phase
        const isPast =
          phases.findIndex((p) => p.key === phase) > i

        return (
          <div key={key} className="flex items-center gap-1">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider transition-all ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : isPast
                    ? 'bg-primary/10 text-primary/60 border border-primary/20'
                    : 'bg-surface-darker text-slate-500 border border-border-dark'
              }`}
            >
              {label()}
            </div>
            {i < phases.length - 1 && (
              <div
                className={`w-4 h-px ${isPast ? 'bg-primary/40' : 'bg-border-dark'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
