import { world } from '#/engine/ecs/world.ts'
import {
  Position,
  Velocity,
  Mass,
  RigidBody,
  RapierHandle,
  Target,
} from '#/engine/ecs/components/index.ts'
import { createDynamicBox } from '#/engine/physics/body-factory.ts'
import { getPhysicsWorld, RAPIER } from '#/engine/physics/rapier-context.ts'
import type { Entity } from 'koota'

export function spawnTarget(params: {
  position: [number, number, number]
  dropOnLaunch?: boolean
}): Entity | undefined {
  const halfExtents: [number, number, number] = [0.4, 0.4, 0.4]

  if (params.dropOnLaunch) {
    // Create as dynamic but lock it initially
    const body = createDynamicBox(params.position, halfExtents, 1)
    if (!body) return undefined
    // Lock body until launch
    body.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true)

    return world.spawn(
      Position({ x: params.position[0], y: params.position[1], z: params.position[2] }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Mass({ value: 1 }),
      RigidBody(),
      RapierHandle({ handle: body.handle as unknown as number }),
      Target(),
    )
  }

  // Static target
  const physWorld = getPhysicsWorld()
  if (!physWorld) return undefined

  const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
    params.position[0],
    params.position[1],
    params.position[2],
  )
  const body = physWorld.createRigidBody(bodyDesc)
  const colliderDesc = RAPIER.ColliderDesc.cuboid(halfExtents[0], halfExtents[1], halfExtents[2])
  physWorld.createCollider(colliderDesc, body)

  return world.spawn(
    Position({ x: params.position[0], y: params.position[1], z: params.position[2] }),
    Target(),
    RigidBody(),
    RapierHandle({ handle: body.handle as unknown as number }),
  )
}

/** Unlock the target to start falling (for Monkey & Hunter) */
export function releaseTarget(entity: Entity): void {
  const physWorld = getPhysicsWorld()
  if (!physWorld) return

  const handle = entity.get(RapierHandle)
  if (!handle) return

  const body = physWorld.getRigidBody(handle.handle as unknown as import('@dimforge/rapier3d-compat').RigidBodyHandle)
  if (!body) return

  body.setBodyType(RAPIER.RigidBodyType.Dynamic, true)
}
