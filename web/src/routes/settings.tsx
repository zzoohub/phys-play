import { createFileRoute } from '@tanstack/react-router'
import { SiteNav } from '#/site/shared/ui/site-nav'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="min-h-screen bg-bg-dark">
      <SiteNav />
      <main className="flex-1 flex flex-col items-center py-8 px-8">
        <div className="max-w-[640px] w-full flex flex-col gap-10">
          <h1 className="text-white text-4xl font-bold leading-tight tracking-[-0.033em]">
            Settings
          </h1>

          {/* Language */}
          <section className="flex flex-col gap-3">
            <h2 className="text-white text-lg font-bold">Language</h2>
            <div className="flex rounded-full bg-surface-dark border border-border-dark overflow-hidden w-fit">
              <button className="px-6 py-2.5 bg-primary text-bg-dark text-sm font-bold rounded-full">
                English
              </button>
              <button className="px-6 py-2.5 text-slate-400 text-sm font-medium hover:text-white transition-colors">
                Korean
              </button>
            </div>
          </section>

          {/* Theme */}
          <section className="flex flex-col gap-3">
            <h2 className="text-white text-lg font-bold">Theme</h2>
            <div className="flex rounded-full bg-surface-dark border border-border-dark overflow-hidden w-fit">
              <button className="px-6 py-2.5 bg-primary text-bg-dark text-sm font-bold rounded-full">
                System
              </button>
              <button className="px-6 py-2.5 text-slate-400 text-sm font-medium hover:text-white transition-colors">
                Light
              </button>
              <button className="px-6 py-2.5 text-slate-400 text-sm font-medium hover:text-white transition-colors">
                Dark
              </button>
            </div>
          </section>

          {/* Audio */}
          <section className="flex flex-col gap-4">
            <h2 className="text-white text-lg font-bold">Audio</h2>
            <SliderRow label="Sound Effects" value={80} />
            <SliderRow label="Music" value={60} />
          </section>

          {/* Discover Depth */}
          <section className="flex flex-col gap-3">
            <h2 className="text-white text-lg font-bold">Discover Depth</h2>
            <p className="text-slate-400 text-sm">
              Choose how deep you want to dive into the physics concepts during
              gameplay.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <DepthCard
                icon="lightbulb"
                title="Intuitive (Level 1)"
                description="Simple analogies and visual learning."
              />
              <DepthCard
                icon="menu_book"
                title="Conceptual (Level 2)"
                description="Detailed concept explanations."
                active
              />
              <DepthCard
                icon="grid_view"
                title="With Formulas (Level 3)"
                description="Full equations and mathematical proofs."
              />
            </div>
          </section>

          {/* Accessibility */}
          <section className="flex flex-col gap-4">
            <h2 className="text-white text-lg font-bold">Accessibility</h2>
            <ToggleRow label="Reduce Motion" />
            <ToggleRow label="High Contrast" checked />
          </section>

          {/* Data Management */}
          <section className="flex flex-col gap-4 pb-12">
            <h2 className="text-white text-lg font-bold">Data Management</h2>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 rounded-full h-11 px-6 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors text-sm font-bold">
                <span className="material-symbols-outlined text-lg">
                  download
                </span>
                Export Progress
              </button>
              <button className="flex items-center gap-2 rounded-full h-11 px-6 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors text-sm font-bold">
                <span className="material-symbols-outlined text-lg">
                  delete
                </span>
                Clear All Data
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function SliderRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-white text-sm font-medium">{label}</span>
      <div className="flex items-center gap-4 flex-1 max-w-[300px]">
        <div className="flex-1 h-2 bg-surface-darker rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-primary text-sm font-bold w-10 text-right">
          {value}%
        </span>
      </div>
    </div>
  )
}

function DepthCard({
  icon,
  title,
  description,
  active,
}: {
  icon: string
  title: string
  description: string
  active?: boolean
}) {
  return (
    <div
      className={`flex flex-col items-center text-center gap-2 p-4 rounded-xl border transition-colors cursor-pointer ${
        active
          ? 'bg-primary/10 border-primary/50 text-white'
          : 'bg-surface-dark border-border-dark text-slate-400 hover:border-primary/30'
      }`}
    >
      <span
        className={`material-symbols-outlined text-2xl ${active ? 'text-primary' : ''}`}
      >
        {icon}
      </span>
      <p className="text-sm font-bold">{title}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  )
}

function ToggleRow({
  label,
  checked,
}: {
  label: string
  checked?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white text-sm font-medium">{label}</span>
      <div
        className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
          checked ? 'bg-primary' : 'bg-surface-darker border border-border-dark'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5.5' : 'translate-x-0.5'
          }`}
        />
      </div>
    </div>
  )
}
