import { createFileRoute } from '@tanstack/react-router'
import { SiteNav } from '#/site/shared/ui/site-nav'

export const Route = createFileRoute('/progress')({
  component: ProgressPage,
})

function ProgressPage() {
  return (
    <div className="min-h-screen bg-bg-dark">
      <SiteNav />
      <main className="flex-1 flex flex-col items-center py-8 px-8">
        <div className="max-w-[1024px] w-full flex flex-col gap-6">
          <div>
            <h1 className="text-white text-4xl font-bold leading-tight tracking-[-0.033em]">
              My Progress
            </h1>
            <p className="text-slate-400 mt-2">
              Track your physics learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              {/* Mechanics Lab Progress */}
              <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                <h2 className="text-white text-xl font-bold mb-6">
                  Mechanics Lab
                </h2>
                <div className="flex flex-col gap-5">
                  <ProgressRow
                    icon="rocket_launch"
                    name="Projectile"
                    completed="8/10 completed"
                    percent={80}
                  />
                  <ProgressRow
                    icon="bolt"
                    name="Energy"
                    completed="3/8 completed"
                    percent={38}
                  />
                  <ProgressRow
                    icon="water_drop"
                    name="Wave"
                    completed="1/8 completed"
                    percent={13}
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                <h2 className="text-white text-xl font-bold mb-6">
                  Recent Activity
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Today</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-white">5</span>
                      <span className="text-primary text-lg font-bold mb-1">
                        3
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">Challenges</p>
                    <p className="text-slate-600 text-xs">Correct</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">This Week</p>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-bold text-white">12</span>
                      {/* Mini chart placeholder */}
                      <div className="flex items-end gap-0.5 mb-2">
                        {[3, 5, 2, 7, 4, 6, 8].map((h, i) => (
                          <div
                            key={i}
                            className="w-1.5 bg-primary/60 rounded-t"
                            style={{ height: `${h * 3}px` }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">Challenges</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* Prediction Accuracy */}
              <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                <h2 className="text-white text-xl font-bold mb-6">
                  Prediction Accuracy
                </h2>
                {/* Donut chart */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 120 120" className="w-full h-full">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="currentColor"
                        className="text-surface-darker"
                        strokeWidth="12"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#0db9f2"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${62 * 3.14} ${100 * 3.14}`}
                        transform="rotate(-90 60 60)"
                        style={{
                          filter: 'drop-shadow(0 0 6px rgba(13,185,242,0.5))',
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-primary">
                        62%
                      </span>
                      <span className="text-xs text-slate-400 uppercase tracking-wider">
                        Overall
                      </span>
                    </div>
                  </div>
                </div>

                {/* Best / Needs Work */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                    <span className="material-symbols-outlined text-green-400 text-lg">
                      check_circle
                    </span>
                    <div>
                      <p className="text-green-400 text-xs font-bold uppercase">
                        Best
                      </p>
                      <p className="text-white text-sm">
                        Projectile trajectory (85%)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                    <span className="material-symbols-outlined text-amber-400 text-lg">
                      warning
                    </span>
                    <div>
                      <p className="text-amber-400 text-xs font-bold uppercase">
                        Needs Work
                      </p>
                      <p className="text-white text-sm">
                        Wave interference (30%)
                      </p>
                    </div>
                  </div>
                </div>

                <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-full h-12 bg-primary hover:bg-primary/90 text-bg-dark font-bold transition-all shadow-[0_0_15px_rgba(13,185,242,0.3)]">
                  <span className="material-symbols-outlined text-lg">
                    play_arrow
                  </span>
                  Practice Wave
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function ProgressRow({
  icon,
  name,
  completed,
  percent,
}: {
  icon: string
  name: string
  completed: string
  percent: number
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12 border border-primary/20">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-white font-bold mb-1">{name}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-surface-darker rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-slate-400 text-sm whitespace-nowrap">
            {completed}
          </span>
          <span className="text-white text-sm font-bold">{percent}%</span>
        </div>
      </div>
    </div>
  )
}
