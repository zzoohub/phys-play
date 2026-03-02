import { useCallback, useId } from 'react'

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  onLabel?: string
  offLabel?: string
}

export function Toggle({ label, checked, onChange, onLabel = 'ON', offLabel = 'OFF' }: ToggleProps) {
  const id = useId()

  const handleToggle = useCallback(() => {
    onChange(!checked)
  }, [checked, onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onChange(!checked)
      }
    },
    [checked, onChange],
  )

  return (
    <div className="flex items-center justify-between px-1 min-h-[48px]">
      <label htmlFor={id} className="text-xs font-medium text-slate-300 dark:text-slate-300 light:text-slate-600 cursor-pointer select-none">
        {label}
        <span className="ml-2 text-[10px] text-slate-500">{checked ? onLabel : offLabel}</span>
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${label} ${checked ? onLabel : offLabel}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer
          rounded-full border-2 border-transparent transition-colors duration-150
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400
          ${checked ? 'bg-cyan-500' : 'bg-slate-600'}
        `}
        style={{ touchAction: 'manipulation' }}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-[24px] w-[24px] rounded-full bg-white
            shadow-lg ring-0 transition-transform duration-150
            ${checked ? 'translate-x-[20px]' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  )
}
