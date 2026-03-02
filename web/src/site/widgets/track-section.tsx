import { Icon } from "#/shared/ui";

/* ── Types ─────────────────────────────────────────────────────── */

type ActiveModule = {
  num: number;
  name: string;
  desc: string;
  color: "primary" | "purple" | "teal";
  active: true;
  href: string;
};

type LockedModule = {
  num: number;
  name: string;
  desc: null;
  color: null;
  active: false;
  href: null;
};

type Module = ActiveModule | LockedModule;

type TrackStatus = "active" | "coming-soon" | "locked";

type TrackSectionProps = {
  title: string;
  status: TrackStatus;
  activeCount?: number;
  modules?: Module[];
  placeholderCount?: number;
  collapsedIcon?: string;
  className?: string;
};

/* ── Color maps ────────────────────────────────────────────────── */

const MODULE_COLORS = {
  primary: {
    badge: "bg-primary/20 text-primary ring-primary/30",
    hoverText: "group-hover:text-primary",
    gradient:
      "radial-gradient(ellipse at 30% 20%, rgba(37,106,244,0.35) 0%, rgba(37,106,244,0.08) 50%, transparent 80%)",
  },
  purple: {
    badge: "bg-accent-purple/20 text-accent-purple ring-accent-purple/30",
    hoverText: "group-hover:text-accent-purple",
    gradient:
      "radial-gradient(ellipse at 40% 30%, rgba(168,85,247,0.3) 0%, rgba(168,85,247,0.06) 50%, transparent 80%)",
  },
  teal: {
    badge: "bg-accent-teal/20 text-accent-teal ring-accent-teal/30",
    hoverText: "group-hover:text-accent-teal",
    gradient:
      "radial-gradient(ellipse at 50% 40%, rgba(20,184,166,0.3) 0%, rgba(20,184,166,0.06) 50%, transparent 80%)",
  },
} as const;

/* ── Status badges ─────────────────────────────────────────────── */

const STATUS_BADGE: Record<TrackStatus, React.ReactNode> = {
  active: null,
  "coming-soon": (
    <span className="inline-flex items-center rounded-full bg-accent-amber/10 px-3 py-1 text-xs font-bold text-accent-amber ring-1 ring-inset ring-accent-amber/20 uppercase tracking-wide">
      Coming Soon
    </span>
  ),
  locked: (
    <span className="inline-flex items-center rounded-full bg-slate-400/10 px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-inset ring-slate-400/20 uppercase tracking-wide">
      Locked
    </span>
  ),
};

/* ── Main component ────────────────────────────────────────────── */

export function TrackSection({
  title,
  status,
  activeCount,
  modules,
  placeholderCount,
  collapsedIcon,
  className = "",
}: TrackSectionProps) {
  const opacityClass =
    status === "coming-soon"
      ? "opacity-70 hover:opacity-100"
      : status === "locked"
        ? "opacity-60 hover:opacity-100"
        : "";

  return (
    <section
      className={`flex flex-col gap-6 transition-opacity duration-500 ${opacityClass} ${className}`}
    >
      {/* Section heading */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2
            className={`text-2xl md:text-3xl lg:text-4xl font-display font-bold ${
              status === "active"
                ? "text-slate-900 dark:text-white"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {title}
          </h2>
          {STATUS_BADGE[status]}
        </div>
        <div className="h-px flex-1 mx-6 bg-slate-200 dark:bg-slate-800 rounded-full hidden sm:block" />
        {status === "active" && activeCount != null && (
          <span className="text-sm font-medium text-primary shrink-0">
            {activeCount} Active Modules
          </span>
        )}
      </div>

      {/* Content */}
      {status === "active" && modules && <ActiveModuleGrid modules={modules} />}

      {status === "coming-soon" && placeholderCount && (
        <PlaceholderGrid count={placeholderCount} />
      )}

      {status === "locked" && collapsedIcon && (
        <CollapsedPlaceholder icon={collapsedIcon} />
      )}
    </section>
  );
}

/* ── Active module grid ────────────────────────────────────────── */

function ActiveModuleGrid({ modules }: { modules: Module[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
      {modules.map((mod) =>
        mod.active ? (
          <ActiveModuleCard key={mod.num} module={mod} />
        ) : (
          <LockedModuleCard key={mod.num} module={mod} />
        ),
      )}
    </div>
  );
}

/* ── Active module card ────────────────────────────────────────── */

function ActiveModuleCard({ module: mod }: { module: ActiveModule }) {
  const colors = MODULE_COLORS[mod.color];

  return (
    <a
      href={mod.href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-slate-800 dark:bg-slate-800 border border-slate-700 hover:border-primary/50 transition-all duration-300 h-[280px] shadow-lg"
    >
      {/* Background atmosphere */}
      <div
        className="absolute inset-0 z-0 opacity-60 group-hover:opacity-40 transition-opacity"
        style={{ backgroundImage: colors.gradient }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 p-5 flex flex-col h-full justify-between">
        {/* Top row */}
        <div className="flex justify-between items-start">
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors.badge}`}
          >
            Module {mod.num}
          </span>
          <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Icon name="play_arrow" size="sm" className="text-white" />
          </div>
        </div>

        {/* Bottom content */}
        <div>
          <h3
            className={`text-xl font-bold text-white mb-1 transition-colors ${colors.hoverText}`}
          >
            {mod.name}
          </h3>
          <p className="text-sm text-slate-300 line-clamp-2 mb-4">
            {mod.desc}
          </p>
          <span className="flex w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-colors items-center justify-center">
            Start
          </span>
        </div>
      </div>
    </a>
  );
}

/* ── Locked module card ────────────────────────────────────────── */

function LockedModuleCard({ module: mod }: { module: LockedModule }) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-slate-900 dark:bg-slate-900 border border-slate-800 h-[280px] opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 group">
      {/* Subtle dark atmosphere */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 50%, rgba(100,116,139,0.15) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 p-5 flex flex-col h-full justify-between">
        <div className="flex justify-end items-start">
          <div className="h-8 w-8 rounded-full bg-slate-700/50 flex items-center justify-center">
            <Icon name="lock" size="sm" className="text-slate-400" />
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 block">
            Module {mod.num}
          </span>
          <h3 className="text-lg font-bold text-slate-400 mb-2">{mod.name}</h3>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-0 h-full bg-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Coming-soon placeholder grid ──────────────────────────────── */

function PlaceholderGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 pointer-events-none select-none">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="relative flex items-center justify-center rounded-xl bg-slate-900/50 dark:bg-slate-900/50 border border-dashed border-slate-800 h-[200px]"
        >
          <div className="flex flex-col items-center gap-2 text-slate-600">
            <Icon name="lock" size="lg" />
            <span className="text-sm font-medium">Coming Soon</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Collapsed placeholder (locked tracks) ─────────────────────── */

function CollapsedPlaceholder({ icon }: { icon: string }) {
  return (
    <div className="w-full h-32 rounded-xl bg-slate-900/30 dark:bg-slate-900/30 border border-dashed border-slate-800/50 flex items-center justify-center">
      <p className="text-slate-600 font-medium flex items-center gap-2">
        <Icon name={icon} size="md" />
        Modules currently under development
      </p>
    </div>
  );
}
