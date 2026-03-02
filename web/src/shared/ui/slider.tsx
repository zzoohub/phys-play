import { useId, useCallback } from "react";

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
};

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  disabled = false,
  className = "",
}: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  const valueText = `${value}${unit ? ` ${unit}` : ""}`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label row */}
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
        <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
          {valueText}
        </span>
      </div>

      {/* Track + handle */}
      <div className="relative flex items-center h-12">
        <input
          id={id}
          type="range"
          role="slider"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={valueText}
          onChange={handleChange}
          className="slider-input w-full"
          style={
            {
              "--slider-pct": `${pct}%`,
            } as React.CSSProperties
          }
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-500">
          {min}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-500">
          {max}
        </span>
      </div>
    </div>
  );
}
