import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Entity } from 'koota'
import type { Group } from 'three'
import { Position, Rotation } from '#/engine/ecs/components/index.ts'

/** Syncs an ECS entity's Position/Rotation to a Three.js Group ref each frame */
export function useECSEntity(entity: Entity | undefined) {
  const ref = useRef<Group>(null)

  useFrame(() => {
    if (!ref.current || !entity) return

    const pos = entity.get(Position)
    if (pos) {
      ref.current.position.set(pos.x, pos.y, pos.z)
    }

    const rot = entity.get(Rotation)
    if (rot) {
      ref.current.rotation.set(rot.x, rot.y, rot.z)
    }
  })

  return ref
}
