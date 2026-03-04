export {
  initRapier,
  createPhysicsWorld,
  getPhysicsWorld,
  stepPhysics,
  disposePhysics,
  RAPIER,
} from './rapier-context.ts'
export { syncRapierToECS } from './rapier-sync.ts'
export {
  createDynamicSphere,
  createStaticPlane,
  createDynamicBox,
} from './body-factory.ts'
