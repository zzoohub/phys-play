import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-bg-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-4 text-primary">
          <span className="material-symbols-outlined text-3xl">science</span>
          <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
            PhysPlay
          </h2>
        </div>
        <button className="flex items-center gap-2 cursor-pointer rounded-full h-10 px-5 bg-surface-dark border border-border-dark hover:border-primary/50 text-sm font-bold transition-colors">
          <span className="material-symbols-outlined text-lg">language</span>
          <span>Language</span>
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-8 pb-20">
        <div className="max-w-[1100px] w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <div className="flex flex-col gap-6">
            <h1 className="text-5xl lg:text-6xl font-black leading-[1.1] tracking-[-0.033em]">
              Can you predict where the ball lands?
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Predict, experiment, discover science through interactive 3D
              physics simulations.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Link
                to="/hub"
                className="flex items-center gap-2 rounded-full h-14 px-8 bg-primary hover:bg-primary/90 text-bg-dark text-base font-bold transition-all shadow-[0_0_20px_rgba(13,185,242,0.4)]"
              >
                <span>Start Experimenting</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <button className="flex items-center gap-3 rounded-full h-14 px-8 bg-surface-dark border border-border-dark hover:border-primary/30 text-white font-semibold transition-colors">
                <span className="material-symbols-outlined">play_circle</span>
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Right - Simulation Preview */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-surface-dark border border-border-dark shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
            <svg
              className="w-full h-full p-10"
              viewBox="0 0 400 300"
              fill="none"
            >
              {/* Grid lines */}
              {Array.from({ length: 8 }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={50 + i * 50}
                  y1="30"
                  x2={50 + i * 50}
                  y2="270"
                  stroke="currentColor"
                  className="text-border-dark"
                  strokeWidth="0.5"
                />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="30"
                  y1={50 + i * 50}
                  x2="380"
                  y2={50 + i * 50}
                  stroke="currentColor"
                  className="text-border-dark"
                  strokeWidth="0.5"
                />
              ))}
              {/* Trajectory */}
              <path
                d="M 80,240 Q 200,40 350,240"
                stroke="#0db9f2"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.6"
              />
              {/* Ball positions */}
              <circle cx="80" cy="240" r="8" fill="#94a3b8" />
              <circle cx="180" cy="100" r="10" fill="#0db9f2" />
              <circle cx="350" cy="240" r="8" fill="#94a3b8" />
            </svg>
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-surface-darker/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border-dark">
              <span className="material-symbols-outlined text-primary text-sm">
                3d_rotation
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Interactive Simulation Preview
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-10 py-6 border-t border-border-dark text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">science</span>
          <span>PhysPlay. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Contact
          </a>
        </div>
      </footer>
    </div>
  )
}
