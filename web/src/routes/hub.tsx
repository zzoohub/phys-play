import { createFileRoute } from '@tanstack/react-router'
import { SiteNav } from '#/site/shared/ui/site-nav'

export const Route = createFileRoute('/hub')({
  component: HubPage,
})

function HubPage() {
  return (
    <div className="min-h-screen bg-bg-dark">
      <SiteNav />
      <main className="flex-1 flex flex-col items-center py-8 px-8">
        <div className="max-w-[1024px] w-full flex flex-col gap-8">
          <h1 className="text-white text-4xl font-bold leading-tight tracking-[-0.033em]">
            My Research Lab
          </h1>

          {/* Lab Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mechanics Lab - Active */}
            <div className="flex flex-col gap-4 p-5 rounded-xl bg-surface-dark border border-border-dark hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="w-full aspect-video rounded-lg overflow-hidden relative bg-gradient-to-br from-surface-dark to-surface-darker">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-primary/40">
                    science
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-primary/20 text-primary backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-primary/30">
                    ACTIVE
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-white text-xl font-bold group-hover:text-primary transition-colors">
                  MECHANICS LAB
                </h3>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1 text-slate-400 text-sm font-medium">
                    <span className="material-symbols-outlined text-[18px]">
                      build
                    </span>
                    <span>3/3 Stations</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-sm font-medium">
                    <span className="material-symbols-outlined text-[18px]">
                      flag
                    </span>
                    <span>12/26 Challenges</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Molecular Lab - Locked */}
            <LockedLab name="MOLECULAR LAB" icon="hub" label="Coming soon" />
            {/* Space Observatory - Locked */}
            <LockedLab name="SPACE OBSERVATORY" icon="satellite_alt" />
            {/* Quantum Lab - Locked */}
            <LockedLab name="QUANTUM LAB" icon="memory" />
          </div>

          {/* Mechanics Lab Stations */}
          <div className="mt-6 flex flex-col gap-4">
            <h2 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em] border-b border-border-dark pb-4">
              Mechanics Lab Stations
            </h2>

            <StationRow
              icon="rocket_launch"
              name="Projectile"
              progress={80}
              completed="8/10"
              action="Continue"
            />
            <StationRow
              icon="bolt"
              name="Energy"
              progress={37.5}
              completed="3/8"
              action="Continue"
            />
            <StationRow
              icon="water_drop"
              name="Wave"
              progress={12.5}
              completed="1/8"
              action="Start"
              highlight
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function LockedLab({
  name,
  icon,
  label,
}: {
  name: string
  icon: string
  label?: string
}) {
  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl bg-surface-dark/50 border border-border-dark/50 opacity-70">
      <div className="w-full aspect-video rounded-lg overflow-hidden relative bg-gradient-to-br from-surface-dark to-surface-darker grayscale">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-slate-600">
            {icon}
          </span>
        </div>
        <div className="absolute inset-0 bg-surface-dark/60 flex items-center justify-center backdrop-blur-[2px]">
          <span className="material-symbols-outlined text-4xl text-slate-400">
            lock
          </span>
        </div>
      </div>
      <div>
        <h3 className="text-slate-300 text-xl font-bold">{name}</h3>
        {label && (
          <div className="mt-2">
            <span className="text-slate-400 text-sm font-medium bg-surface-darker px-3 py-1 rounded-full">
              {label}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function StationRow({
  icon,
  name,
  progress,
  completed,
  action,
  highlight,
}: {
  icon: string
  name: string
  progress: number
  completed: string
  action: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center gap-4 bg-surface-dark border border-border-dark rounded-xl px-6 py-5 justify-between hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-6 w-full">
        <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-14 border border-primary/20">
          <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <div className="flex flex-col justify-center flex-1">
          <p className="text-white text-lg font-bold mb-1">{name}</p>
          <div className="flex items-center gap-3">
            <div className="w-full max-w-[200px] h-2 bg-surface-darker rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm font-medium">{completed}</p>
          </div>
        </div>
        <div className="shrink-0 ml-auto">
          <button
            className={
              highlight
                ? 'flex items-center justify-center rounded-full h-10 px-6 bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-bold shadow-[0_0_15px_rgba(13,185,242,0.3)]'
                : 'flex items-center justify-center rounded-full h-10 px-6 bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors text-sm font-bold'
            }
          >
            {action}
          </button>
        </div>
      </div>
    </div>
  )
}
