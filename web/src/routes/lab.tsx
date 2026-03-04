import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lab')({
  component: LabSimulationPage,
})

function LabSimulationPage() {
  return (
    <div className="relative flex h-screen w-full flex-col bg-bg-dark overflow-hidden">
      {/* Background - 3D viewport placeholder */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-surface-dark via-bg-dark to-surface-darker">
        {/* Simulated 3D environment */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/80 via-transparent to-bg-dark/90 pointer-events-none" />
        {/* Trajectory arc */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M 300,800 Q 750,200 1200,800"
            fill="none"
            stroke="#0db9f2"
            strokeWidth="3"
            strokeDasharray="8 6"
            opacity="0.5"
            style={{ filter: 'drop-shadow(0 0 8px #0db9f2)' }}
          />
          <circle cx="300" cy="800" r="8" fill="#94a3b8" />
          <circle cx="750" cy="400" r="14" fill="#0db9f2" opacity="0.8" />
        </svg>
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* HUD Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 bg-bg-dark/40 backdrop-blur-md border-b border-primary/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-2xl">science</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            PhysPlay 3D Lab
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="px-4 py-1.5 rounded-full bg-surface-dark/60 border border-border-dark backdrop-blur-sm">
            <span className="text-primary font-medium tracking-wide">
              Projectile 8/10
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-dark/60 text-slate-300 hover:bg-primary/20 hover:text-primary transition-colors border border-border-dark backdrop-blur-sm">
              <span className="material-symbols-outlined">volume_up</span>
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-dark/60 text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-border-dark backdrop-blur-sm">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      </header>

      {/* Center area (3D viewport) */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="text-center opacity-30">
          <span className="material-symbols-outlined text-7xl text-slate-500">
            3d_rotation
          </span>
          <p className="text-slate-500 font-mono mt-2 tracking-widest text-sm">
            3D VIEWPORT
          </p>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="relative z-10 flex justify-center mb-10">
        <div className="px-6 py-3 rounded-full bg-bg-dark/60 backdrop-blur-md border border-primary/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary/80">
            touch_app
          </span>
          <p className="text-slate-300 text-sm font-medium tracking-wide">
            Click and drag the ball to throw it
          </p>
        </div>
      </div>
    </div>
  )
}
