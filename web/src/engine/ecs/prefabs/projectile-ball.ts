import { world } from '#/engine/ecs/world.ts'
import {
  Position,
  Velocity,
  Mass,
  Drag,
  RigidBody,
  RapierHandle,
  Projectile,
  TrajectoryRecorder,
} from '#/engine/ecs/components/index.ts'
import { createDynamicSphere } from '#/engine/physics/body-factory.ts'
import type { Entity } from 'koota'

export function spawnProjectile(params: {
  position: [number, number, number]
  mass: number
  drag: number
  radius?: number
}): Entity | undefined {
  const radius = params.radius ?? 0.3
  const body = createDynamicSphere(params.position, radius, params.mass)
  if (!body) return undefined

  return world.spawn(
    Position({ x: params.position[0], y: params.position[1], z: params.position[2] }),
    Velocity({ x: 0, y: 0, z: 0 }),
    Mass({ value: params.mass }),
    Drag({ value: params.drag }),
    RigidBody(),
    RapierHandle({ handle: body.handle as unknown as number }),
    Projectile(),
    TrajectoryRecorder({ points: [], recording: false }),
  )
}
