interface IconButtonProps {
  label: string
  onClick?: () => void
  children: React.ReactNode
  size?: 'sm' | 'md'
  variant?: 'ghost' | 'glass'
}

export function IconButton({ label, onClick, children, size = 'md', variant = 'ghost' }: IconButtonProps) {
  const sizeClasses = size === 'sm' ? 'h-8 w-8 text-sm' : 'h-10 w-10 text-base'
  const variantClasses =
    variant === 'glass'
      ? 'bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white'
      : 'text-slate-400 hover:text-white hover:bg-white/10 dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-200/60'

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-all duration-150 cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400
        ${sizeClasses} ${variantClasses}
      `}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </button>
  )
}
