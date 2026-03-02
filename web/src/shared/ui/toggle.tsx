import { useId, useCallback } from "react";

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
}: ToggleProps) {
  const id = useId();

  const handleToggle = useCallback(() => {
    if (!disabled) onChange(!checked);
  }, [checked, disabled, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle],
  );

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
      >
        {label}
      </label>

      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={[
          "relative inline-flex h-8 w-[52px] shrink-0 items-center rounded-full",
          "transition-colors duration-150 ease-smooth",
          "focus-ring cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          checked
            ? "bg-primary"
            : "bg-slate-300 dark:bg-slate-700",
        ].join(" ")}
      >
        {/* Handle */}
        <span
          className={[
            "pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md",
            "transition-transform duration-150 ease-spring",
            checked ? "translate-x-6" : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
