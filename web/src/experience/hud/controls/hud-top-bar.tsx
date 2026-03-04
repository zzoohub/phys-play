import { useCoreLoopStore } from '#/platform/stores/core-loop.ts'
import { PhaseIndicator } from '#/experience/hud/panels/phase-indicator.tsx'
import { useNavigate } from '@tanstack/react-router'
import { m } from '#/paraglide/messages.js'

export function HudTopBar() {
  const phase = useCoreLoopStore((s) => s.phase)
  const challenge = useCoreLoopStore((s) => s.challenge)
  const exitLab = useCoreLoopStore((s) => s.exitLab)
  const navigate = useNavigate()

  const handleExit = () => {
    exitLab()
    navigate({ to: '/hub' })
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-bg-dark/60 backdrop-blur-md border-b border-primary/20">
      <div className="flex items-center gap-4">
        <button
          onClick={handleExit}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          {m.common_exit()}
        </button>

        <div className="h-6 w-px bg-border-dark" />

        <span className="text-white font-bold text-sm">
          {challenge?.station ? m.lab_station_label({ station: challenge.station }) : m.lab_title()}
        </span>
      </div>

      <PhaseIndicator phase={phase} />

      <div className="flex items-center gap-2">
        <button className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-dark/60 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors border border-border-dark">
          <span className="material-symbols-outlined text-lg">volume_up</span>
        </button>
        <button className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-dark/60 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors border border-border-dark">
          <span className="material-symbols-outlined text-lg">help</span>
        </button>
      </div>
    </header>
  )
}
