import { Line } from '@react-three/drei'
import type { Vec3Tuple } from '#/platform/types/index.ts'

interface TrajectoryLineProps {
  points: Vec3Tuple[]
  color: string
  dashed?: boolean
  lineWidth?: number
  opacity?: number
}

export function TrajectoryLine({
  points,
  color,
  dashed = false,
  lineWidth = 2,
  opacity = 0.8,
}: TrajectoryLineProps) {
  if (points.length < 2) return null

  const threePoints = points.map((p) => [p[0], p[1], p[2]] as [number, number, number])

  if (dashed) {
    return (
      <Line
        points={threePoints}
        color={color}
        lineWidth={lineWidth}
        transparent
        opacity={opacity}
        dashed
        dashSize={0.3}
        gapSize={0.2}
      />
    )
  }

  return (
    <Line
      points={threePoints}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
    />
  )
}
