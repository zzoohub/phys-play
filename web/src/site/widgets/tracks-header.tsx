import { Icon, IconButton } from "#/shared/ui";

export function TracksHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md px-6 md:px-10 py-4">
      {/* Left: Home link */}
      <div className="flex flex-1 justify-start">
        <a
          href="/"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
        >
          <Icon name="arrow_back_ios" size="sm" />
          Home
        </a>
      </div>

      {/* Center: Title */}
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 text-primary">
          <svg
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M8.578 8.578C5.528 11.628 3.451 15.515 2.61 19.745 1.768 23.976 2.2 28.361 3.85 32.346c1.651 3.985 4.447 7.392 8.033 9.788C15.47 44.53 19.686 45.81 24 45.81s8.53-1.28 12.117-3.676c3.586-2.396 6.382-5.803 8.033-9.788 1.65-3.985 2.082-8.37 1.24-12.601-.84-4.23-2.918-8.117-5.968-11.167L24 24 8.578 8.578z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h1 className="text-slate-900 dark:text-white text-lg md:text-xl font-display font-bold leading-tight">
          All Science Experiences
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-1 justify-end gap-3">
        <IconButton icon="translate" label="Change language" />
        <IconButton icon="settings" label="Settings" />
      </div>
    </header>
  );
}
