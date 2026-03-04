interface FpsCounterProps {
  fps: number
}

export function FpsCounter({ fps }: FpsCounterProps) {
  if (import.meta.env.PROD) return null

  const color = fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="absolute top-14 left-4 z-50 pointer-events-none">
      <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-sm">
        <span className={`font-mono text-xs font-bold ${color}`}>
          {fps} FPS
        </span>
      </div>
    </div>
  )
}
