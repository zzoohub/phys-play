import { Icon } from "#/shared/ui";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-surface dark:bg-surface-dark py-12">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white dark:bg-white dark:text-slate-900">
            <Icon name="science" size="sm" />
          </div>
          <span className="text-lg font-bold font-display text-slate-900 dark:text-white">
            PhysPlay
          </span>
        </div>

        <nav className="flex gap-8">
          <a
            href="#"
            className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            Language
          </a>
          <a
            href="#"
            className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            About
          </a>
          <a
            href="#"
            className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            Contact
          </a>
        </nav>

        <div className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} PhysPlay. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
