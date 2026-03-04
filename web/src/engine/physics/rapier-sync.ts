import type RAPIER from '@dimforge/rapier3d-compat'
import { world } from '#/engine/ecs/world.ts'
import { Position, Velocity, RapierHandle } from '#/engine/ecs/components/index.ts'
import { createQuery } from 'koota'
import { getPhysicsWorld } from './rapier-context.ts'

const physicsEntities = createQuery(Position, Velocity, RapierHandle)

/** Sync Rapier body positions/velocities back to ECS components */
export function syncRapierToECS(): void {
  const physWorld = getPhysicsWorld()
  if (!physWorld) return

  for (const entity of world.query(physicsEntities)) {
    const handle = entity.get(RapierHandle)
    if (!handle) continue

    const body = physWorld.getRigidBody(handle.handle as unknown as RAPIER.RigidBodyHandle)
    if (!body) continue

    const pos = body.translation()
    entity.set(Position, { x: pos.x, y: pos.y, z: pos.z })

    const vel = body.linvel()
    entity.set(Velocity, { x: vel.x, y: vel.y, z: vel.z })
  }
}
