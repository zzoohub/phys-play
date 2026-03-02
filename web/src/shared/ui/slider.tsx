import { useCallback, useId } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
}

export function Slider({ label, value, min, max, step, unit, onChange }: SliderProps) {
  const id = useId()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value))
    },
    [onChange],
  )

  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-1.5 px-1">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-xs font-medium text-slate-300 dark:text-slate-300 light:text-slate-600">
          {label}
        </label>
        <span className="text-xs tabular-nums font-semibold text-white dark:text-white light:text-slate-900">
          {value} {unit}
        </span>
      </div>
      <div className="relative">
        <input
          id={id}
          type="range"
          role="slider"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value} ${unit}`}
          aria-label={label}
          className="slider-input w-full appearance-none bg-transparent cursor-pointer"
          style={{ '--slider-percent': `${percent}%` } as React.CSSProperties}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
