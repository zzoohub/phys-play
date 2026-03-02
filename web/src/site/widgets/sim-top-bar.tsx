import { IconButton } from "#/shared/ui";

type SimTopBarProps = {
  moduleName: string;
};

export function SimTopBar({ moduleName }: SimTopBarProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-surface-dark/60 backdrop-blur-md border-b border-white/5">
      {/* Left: Back */}
      <a
        href="/"
        className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors text-sm font-medium"
      >
        <IconButton icon="arrow_back" label="Back to home" variant="ghost" size="sm" />
      </a>

      {/* Center: Module name */}
      <h1 className="text-sm md:text-base font-display font-bold text-white truncate px-4">
        {moduleName}
      </h1>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <IconButton icon="share" label="Share" variant="ghost" size="sm" />
        <IconButton icon="help" label="Help" variant="ghost" size="sm" />
        <IconButton
          icon="translate"
          label="Change language"
          variant="ghost"
          size="sm"
          className="hidden md:inline-flex"
        />
        <IconButton icon="more_vert" label="Settings" variant="ghost" size="sm" />
      </div>
    </header>
  );
}
