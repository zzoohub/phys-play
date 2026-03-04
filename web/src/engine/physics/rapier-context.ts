import RAPIER from '@dimforge/rapier3d-compat'
import { GRAVITY_EARTH } from '#/platform/constants/physics.ts'

let rapierWorld: RAPIER.World | undefined
let initialized = false

/** Initialize WASM only — does NOT create a world */
export async function initRapier(): Promise<void> {
  if (!initialized) {
    await RAPIER.init()
    initialized = true
  }
}

/** Create a fresh physics world (disposes previous if any) */
export function createPhysicsWorld(gravity: number = GRAVITY_EARTH): RAPIER.World {
  if (!initialized) {
    throw new Error('Rapier WASM not initialized. Call initRapier() first.')
  }
  // Dispose previous world safely
  if (rapierWorld) {
    try {
      rapierWorld.free()
    } catch {
      // Already freed or borrowed — ignore
    }
    rapierWorld = undefined
  }
  rapierWorld = new RAPIER.World(new RAPIER.Vector3(0, -gravity, 0))
  return rapierWorld
}

export function getPhysicsWorld(): RAPIER.World | undefined {
  return rapierWorld
}

export function stepPhysics(): void {
  rapierWorld?.step()
}

export function disposePhysics(): void {
  if (rapierWorld) {
    try {
      rapierWorld.free()
    } catch {
      // Already freed — ignore
    }
    rapierWorld = undefined
  }
}

export { RAPIER }
