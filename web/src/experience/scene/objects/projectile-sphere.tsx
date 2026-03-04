import type { Entity } from 'koota'
import { useECSEntity } from '#/experience/scene/hooks/use-ecs-entity.ts'

interface ProjectileSphereProps {
  entity: Entity | undefined
  radius?: number
}

export function ProjectileSphere({ entity, radius = 0.3 }: ProjectileSphereProps) {
  const ref = useECSEntity(entity)

  if (!entity) return null

  return (
    <group ref={ref}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color="#0db9f2"
          emissive="#0db9f2"
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
    </group>
  )
}
