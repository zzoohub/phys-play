import RAPIER from '@dimforge/rapier3d-compat'
import { getPhysicsWorld } from './rapier-context.ts'

export function createDynamicSphere(
  position: [number, number, number],
  radius: number,
  mass: number,
): RAPIER.RigidBody | undefined {
  const physWorld = getPhysicsWorld()
  if (!physWorld) return undefined

  const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
    position[0],
    position[1],
    position[2],
  )
  const body = physWorld.createRigidBody(bodyDesc)

  const colliderDesc = RAPIER.ColliderDesc.ball(radius).setDensity(
    mass / ((4 / 3) * Math.PI * radius ** 3),
  )
  physWorld.createCollider(colliderDesc, body)

  return body
}

export function createStaticPlane(
  position: [number, number, number] = [0, 0, 0],
  halfExtents: [number, number, number] = [30, 0.05, 30],
): RAPIER.RigidBody | undefined {
  const physWorld = getPhysicsWorld()
  if (!physWorld) return undefined

  const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
    position[0],
    position[1],
    position[2],
  )
  const body = physWorld.createRigidBody(bodyDesc)

  const colliderDesc = RAPIER.ColliderDesc.cuboid(
    halfExtents[0],
    halfExtents[1],
    halfExtents[2],
  )
  physWorld.createCollider(colliderDesc, body)

  return body
}

export function createDynamicBox(
  position: [number, number, number],
  halfExtents: [number, number, number],
  mass: number,
): RAPIER.RigidBody | undefined {
  const physWorld = getPhysicsWorld()
  if (!physWorld) return undefined

  const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
    position[0],
    position[1],
    position[2],
  )
  const body = physWorld.createRigidBody(bodyDesc)

  const volume = 8 * halfExtents[0] * halfExtents[1] * halfExtents[2]
  const colliderDesc = RAPIER.ColliderDesc.cuboid(
    halfExtents[0],
    halfExtents[1],
    halfExtents[2],
  ).setDensity(mass / Math.max(volume, 0.001))
  physWorld.createCollider(colliderDesc, body)

  return body
}
