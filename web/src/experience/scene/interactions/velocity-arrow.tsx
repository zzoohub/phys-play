import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import type { Entity } from 'koota'
import { Position } from '#/engine/ecs/components/index.ts'
import type { AimState } from './god-hand-state.ts'

interface VelocityArrowProps {
  aim: AimState
  projectileEntity: Entity | undefined
}

export function VelocityArrow({ aim, projectileEntity }: VelocityArrowProps) {
  const points = useMemo(() => {
    if (!projectileEntity) return []

    const pos = projectileEntity.get(Position)
    if (!pos) return []

    const start: [number, number, number] = [pos.x, pos.y, pos.z]
    const scale = 3 * aim.power
    const end: [number, number, number] = [
      pos.x + aim.direction.x * scale,
      pos.y + aim.direction.y * scale,
      pos.z + aim.direction.z * scale,
    ]

    return [start, end]
  }, [aim, projectileEntity])

  if (points.length < 2) return null

  return (
    <>
      <Line
        points={points}
        color="#0db9f2"
        lineWidth={3}
        transparent
        opacity={0.8}
      />
      {/* Arrow head */}
      <mesh position={points[1]!}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshBasicMaterial color="#0db9f2" transparent opacity={0.8} />
      </mesh>
    </>
  )
}
