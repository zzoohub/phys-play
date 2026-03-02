import { Link } from "@tanstack/react-router";
import { Icon, IconButton } from "#/shared/ui";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-md px-6 py-4">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30 transition-transform duration-200 ease-spring group-hover:scale-105">
          <Icon name="science" size="md" />
        </div>
        <span className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-white">
          PhysPlay
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <button className="group flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-200 dark:bg-slate-800 px-4 text-sm font-medium transition-colors hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer">
          <Icon name="language" size="sm" />
          <span>EN</span>
        </button>
        <IconButton icon="dark_mode" label="Toggle theme" />
      </div>
    </header>
  );
}
