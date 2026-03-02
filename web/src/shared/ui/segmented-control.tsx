import { useId, useCallback, useRef } from "react";

type SegmentedControlProps<T extends string> = {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
};

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  className = "",
}: SegmentedControlProps<T>) {
  const groupId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const currentIndex = options.findIndex((o) => o.value === value);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      let nextIndex = currentIndex;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % options.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + options.length) % options.length;
      }

      if (nextIndex !== currentIndex) {
        onChange(options[nextIndex].value);
        const buttons = containerRef.current?.querySelectorAll("[role=radio]");
        (buttons?.[nextIndex] as HTMLButtonElement | undefined)?.focus();
      }
    },
    [currentIndex, disabled, onChange, options],
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span
        id={`${groupId}-label`}
        className="text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </span>

      <div
        ref={containerRef}
        role="radiogroup"
        aria-labelledby={`${groupId}-label`}
        onKeyDown={handleKeyDown}
        className={[
          "relative flex rounded-lg p-1",
          "bg-slate-200 dark:bg-slate-800",
          disabled ? "opacity-50 pointer-events-none" : "",
        ].join(" ")}
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              disabled={disabled}
              onClick={() => !disabled && onChange(option.value)}
              className={[
                "relative z-10 flex-1 min-h-[44px] px-3 text-sm font-semibold rounded-md",
                "transition-all duration-200 ease-smooth",
                "focus-ring cursor-pointer",
                isSelected
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
