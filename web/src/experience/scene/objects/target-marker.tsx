import type { Entity } from 'koota'
import { useECSEntity } from '#/experience/scene/hooks/use-ecs-entity.ts'

interface TargetMarkerProps {
  entity: Entity | undefined
}

export function TargetMarker({ entity }: TargetMarkerProps) {
  const ref = useECSEntity(entity)

  if (!entity) return null

  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.2}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      {/* Glow ring */}
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.6, 0.8, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
