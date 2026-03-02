import { useCallback, useRef } from 'react'

interface SegmentedControlProps<T extends string> {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIdx = options.findIndex(o => o.value === value)
      let nextIdx = currentIdx

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        nextIdx = (currentIdx + 1) % options.length
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        nextIdx = (currentIdx - 1 + options.length) % options.length
      }

      const nextOption = options[nextIdx]
      if (nextIdx !== currentIdx && nextOption) {
        onChange(nextOption.value)
        const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
        buttons?.[nextIdx]?.focus()
      }
    },
    [options, value, onChange],
  )

  const selectedIdx = options.findIndex(o => o.value === value)

  return (
    <div className="flex flex-col gap-1.5 px-1">
      <span className="text-xs font-medium text-slate-300 dark:text-slate-300 light:text-slate-600">
        {label}
      </span>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className="relative flex rounded-lg bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-200/80 p-0.5"
      >
        <div
          className="absolute top-0.5 bottom-0.5 rounded-md bg-cyan-500/90 transition-all duration-200 ease-out"
          style={{
            width: `${100 / options.length}%`,
            left: `${(selectedIdx * 100) / options.length}%`,
          }}
          aria-hidden="true"
        />
        {options.map((option) => {
          const isSelected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(option.value)}
              className={`
                relative z-10 flex-1 min-h-[40px] px-3 rounded-md text-xs font-semibold
                transition-colors duration-150 cursor-pointer
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400
                ${isSelected ? 'text-white' : 'text-slate-400 hover:text-slate-200 dark:hover:text-slate-200 light:text-slate-600 light:hover:text-slate-800'}
              `}
              style={{ touchAction: 'manipulation' }}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
