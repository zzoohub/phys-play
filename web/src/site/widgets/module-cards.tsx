import { Icon } from "#/shared/ui";

const MODULES = [
  {
    id: "1-1",
    name: "Motion & Force",
    description:
      "Master velocity, acceleration, and Newton's laws through hands-on projection.",
    icon: "open_with",
    color: "blue" as const,
    href: "/module/1/1",
  },
  {
    id: "1-2",
    name: "Energy & Work",
    description:
      "Visualize kinetic and potential energy transformations on a roller coaster.",
    icon: "bolt",
    color: "green" as const,
    href: "/module/1/2",
  },
  {
    id: "1-3",
    name: "Waves",
    description:
      "Explore interference patterns, sound waves, and the Doppler effect.",
    icon: "waves",
    color: "purple" as const,
    href: "/module/1/3",
  },
] as const;

const COLOR_MAP = {
  blue: {
    iconBg: "bg-accent-blue/20",
    iconText: "text-accent-blue",
    button: "bg-accent-blue hover:bg-accent-blue/90",
    hoverShadow: "hover:shadow-accent-blue/10",
  },
  green: {
    iconBg: "bg-accent-green/20",
    iconText: "text-accent-green",
    button: "bg-accent-green hover:bg-accent-green/90",
    hoverShadow: "hover:shadow-accent-green/10",
  },
  purple: {
    iconBg: "bg-accent-purple/20",
    iconText: "text-accent-purple",
    button: "bg-accent-purple hover:bg-accent-purple/90",
    hoverShadow: "hover:shadow-accent-purple/10",
  },
} as const;

export function ModuleCards() {
  return (
    <section className="container mx-auto px-6 py-16">
      <div className="flex flex-col gap-2 mb-10">
        <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
          Active Modules
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Dive into our core curriculum simulations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {MODULES.map((mod) => {
          const colors = COLOR_MAP[mod.color];
          return (
            <div
              key={mod.id}
              className={`group relative overflow-hidden rounded-2xl glass-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colors.hoverShadow}`}
            >
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${colors.iconBg} ${colors.iconText}`}
              >
                <Icon name={mod.icon} size="lg" />
              </div>
              <h3 className="mb-2 text-xl font-bold font-display text-slate-900 dark:text-white">
                {mod.name}
              </h3>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                {mod.description}
              </p>
              <a
                href={mod.href}
                className={`flex w-full items-center justify-center rounded-lg ${colors.button} py-3 text-sm font-bold text-white transition-colors cursor-pointer`}
              >
                Start Module
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
