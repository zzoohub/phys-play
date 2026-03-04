import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lab/discover')({
  component: LabDiscoverPage,
})

function LabDiscoverPage() {
  return (
    <div className="relative w-full h-screen bg-bg-dark overflow-hidden">
      {/* Background viewport area */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-dark via-surface-dark to-bg-dark">
        {/* Trajectory lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* User prediction (dashed blue) */}
          <path
            d="M 200 900 Q 800 100 1400 900"
            fill="none"
            stroke="#0db9f2"
            strokeWidth="4"
            strokeDasharray="15 10"
            opacity="0.8"
            style={{ filter: 'drop-shadow(0 0 8px #0db9f2)' }}
          />
          {/* Actual result (solid orange) */}
          <path
            d="M 200 900 Q 900 200 1600 900"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="6"
            opacity="0.9"
            style={{ filter: 'drop-shadow(0 0 10px #f59e0b)' }}
          />
          <circle cx="200" cy="900" r="12" fill="#fff" />
          <circle
            cx="1600"
            cy="900"
            r="15"
            fill="#f59e0b"
            style={{ filter: 'drop-shadow(0 0 15px #f59e0b)' }}
          />
          <circle
            cx="1400"
            cy="900"
            r="15"
            fill="none"
            stroke="#0db9f2"
            strokeWidth="4"
            strokeDasharray="4 4"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/80 via-transparent to-bg-dark/90 pointer-events-none" />
      </div>

      {/* Top nav */}
      <header className="absolute top-0 w-full z-40 bg-surface-dark/70 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">
                science
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">PhysPlay</h2>
          </div>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-center tracking-wide">
            Interesting! Let's see what happened...
          </h1>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">close</span>
              Exit
            </a>
            <div className="flex gap-3">
              <div className="flex items-center justify-center rounded-full h-10 px-5 bg-primary text-bg-dark text-sm font-bold shadow-[0_0_15px_rgba(13,185,242,0.4)]">
                Projectile 8/10
              </div>
              <button className="flex items-center justify-center rounded-full w-10 h-10 bg-white/10 hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-xl">
                  settings
                </span>
              </button>
              <button className="flex items-center justify-center rounded-full w-10 h-10 bg-white/10 hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-xl">
                  help
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-30 flex h-full pt-20 pb-24">
        {/* Left controls */}
        <div className="flex flex-col justify-center px-8 gap-4">
          <div className="flex flex-col gap-2">
            <ToolButton icon="360" />
            <ToolButton icon="zoom_in" />
            <ToolButton icon="zoom_out" />
          </div>
        </div>

        <div className="flex-1" />

        {/* Right panel */}
        <aside className="w-[360px] h-full bg-surface-dark/85 backdrop-blur-2xl border-l border-white/10 flex flex-col shadow-2xl">
          <div className="p-8 flex-1 flex flex-col gap-8 overflow-y-auto">
            {/* Title */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">
                  insights
                </span>
                <h3 className="text-2xl font-bold">Parabolic Motion</h3>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">
                A projectile launched under gravity travels in a parabolic path.
                Let's explore the physics behind this motion and see why your
                prediction differed from the actual result.
              </p>
            </div>

            {/* Prediction vs Result */}
            <div className="flex flex-col gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Your Prediction
                  </span>
                  <span className="w-8 h-0.5 border-b-2 border-dashed border-primary" />
                </div>
                <div className="text-lg font-medium">Distance: 120m</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-amber-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-amber-500 font-semibold uppercase tracking-wider">
                    Actual Result
                  </span>
                  <span className="w-8 h-0.5 bg-amber-500" />
                </div>
                <div className="text-lg font-medium text-amber-500">
                  Distance: 140m
                </div>
              </div>
            </div>

            {/* Key Factor */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <h4 className="font-semibold mb-2 text-sm text-primary">
                Key Factor: Launch Angle
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                You launched at 35°. The optimal angle for maximum distance is
                45°.
              </p>
              <div className="h-32 bg-bg-dark/50 rounded-lg flex items-center justify-center border border-white/5">
                <span className="material-symbols-outlined text-white/20 text-4xl">
                  architecture
                </span>
              </div>
            </div>

            {/* See the math */}
            <button className="mt-auto flex items-center justify-between w-full p-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary transition-colors group">
              <span className="font-semibold">See the math</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </aside>
      </main>

      {/* Bottom bar */}
      <footer className="absolute bottom-0 w-full z-40 bg-gradient-to-t from-bg-dark via-bg-dark/90 to-transparent pt-12 pb-6 px-8 pointer-events-none">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-4">
            <BottomButton icon="compare_arrows" label="Toggle View" />
            <div className="h-8 w-px bg-white/20 mx-2" />
            <BottomButton icon="replay" label="Replay" />
            <BottomButton icon="tune" label="Try Different Settings" />
          </div>
          <button className="flex items-center justify-center rounded-full h-16 px-10 bg-primary hover:bg-primary/90 text-bg-dark text-lg font-bold transition-all shadow-[0_0_20px_rgba(13,185,242,0.5)] gap-3">
            <span>Next Challenge</span>
            <span className="material-symbols-outlined font-bold">
              arrow_forward
            </span>
          </button>
        </div>
      </footer>
    </div>
  )
}

function ToolButton({ icon }: { icon: string }) {
  return (
    <button className="w-12 h-12 rounded-full bg-bg-dark/80 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all group">
      <span className="material-symbols-outlined text-white group-hover:text-primary">
        {icon}
      </span>
    </button>
  )
}

function BottomButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="flex items-center justify-center rounded-full h-14 px-6 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold transition-all gap-2 backdrop-blur">
      <span className="material-symbols-outlined">{icon}</span>
      <span>{label}</span>
    </button>
  )
}
