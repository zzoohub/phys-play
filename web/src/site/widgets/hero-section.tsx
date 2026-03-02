import { Icon } from "#/shared/ui";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[600px] flex-col items-center justify-center px-4 py-20 text-center overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="glow-blob -top-[20%] left-[20%] h-[500px] w-[500px] bg-primary/20" />
        <div className="glow-blob top-[40%] right-[10%] h-[400px] w-[400px] bg-accent-purple/10" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl mx-auto">
        {/* 3D Demo Placeholder */}
        <div
          className="relative flex aspect-video w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-2xl"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(37, 106, 244, 0.15) 0%, transparent 70%)",
          }}
        >
          {/* Abstract decoration */}
          <div
            className="absolute h-32 w-32 rounded-full bg-gradient-to-br from-primary to-accent-purple opacity-80 blur-sm animate-pulse"
            aria-hidden="true"
          />
          <div
            className="absolute top-1/3 left-1/4 h-16 w-16 rounded-full border-2 border-primary/50"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-1/3 right-1/4 h-24 w-24 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Icon name="touch_app" size="xl" className="text-white/50" />
          </div>
        </div>

        {/* Copy */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            (drag to rotate, click to throw)
          </p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight font-display text-slate-900 dark:text-white md:text-7xl">
            Touch science,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-purple">
              feel it
            </span>
          </h1>
          <p className="mx-auto max-w-lg text-lg text-slate-600 dark:text-slate-400">
            Experience physics like never before with interactive 3D simulations
            right in your browser.
          </p>
        </div>

        {/* CTA */}
        <a
          href="/module/1/1"
          className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-primary px-8 py-4 text-lg font-bold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95"
        >
          <span>Start Exploring</span>
          <Icon
            name="arrow_forward"
            size="sm"
            className="transition-transform group-hover:translate-x-1"
          />
        </a>
      </div>
    </section>
  );
}
