import type { SimulationEngine } from '#/engine/simulation/types.ts'
import type {
  ChallengeConfig,
  PredictionData,
  SimulationResult,
  DiscoverOutcome,
  Vec3Tuple,
} from '#/platform/types/index.ts'
import { MAX_SIMULATION_DURATION_S } from '#/platform/constants/physics.ts'
import { world } from '#/engine/ecs/world.ts'
import { Position, Projectile, TrajectoryRecorder } from '#/engine/ecs/components/index.ts'
import { spawnProjectile } from '#/engine/ecs/prefabs/projectile-ball.ts'
import { spawnTarget, releaseTarget } from '#/engine/ecs/prefabs/target.ts'
import { createPhysicsWorld, stepPhysics } from '#/engine/physics/rapier-context.ts'
import { syncRapierToECS } from '#/engine/physics/rapier-sync.ts'
import { trajectoryRecordSystem } from './systems/trajectory-record-system.ts'
import { createQuery, type Entity } from 'koota'

const projectileQuery = createQuery(Position, Projectile)

export class ProjectileEngine implements SimulationEngine {
  readonly engineId = 'projectile'

  private config: ChallengeConfig | undefined
  private projectileEntity: Entity | undefined
  private targetEntity: Entity | undefined
  private elapsedTime = 0
  private launched = false
  private complete = false
  private trajectoryPoints: Vec3Tuple[] = []

  setup(config: ChallengeConfig): void {
    this.config = config
    this.elapsedTime = 0
    this.launched = false
    this.complete = false
    this.trajectoryPoints = []

    createPhysicsWorld(config.params.gravity)

    // Spawn projectile at origin
    this.projectileEntity = spawnProjectile({
      position: [0, 0.8, 0],
      mass: config.params.mass,
      drag: config.params.drag,
    })

    // Spawn target if position is defined
    if (config.params.targetPosition) {
      const dropOnLaunch = config.params.targetDropOnLaunch === true
      this.targetEntity = spawnTarget({
        position: [...config.params.targetPosition] as [number, number, number],
        dropOnLaunch,
      })
    }
  }

  getProjectileEntity(): Entity | undefined {
    return this.projectileEntity
  }

  getTargetEntity(): Entity | undefined {
    return this.targetEntity
  }

  markLaunched(): void {
    if (this.launched) return
    this.launched = true

    // Start recording trajectory
    if (this.projectileEntity) {
      this.projectileEntity.set(TrajectoryRecorder, { points: [], recording: true })
    }

    // Release target (Monkey & Hunter)
    if (this.targetEntity && this.config?.params.targetDropOnLaunch) {
      releaseTarget(this.targetEntity)
    }
  }

  step(_dt: number): void {
    if (this.complete || !this.launched) return

    this.elapsedTime += 1 / 60

    stepPhysics()
    syncRapierToECS()
    trajectoryRecordSystem()

    // Check completion conditions
    const projectiles = world.query(projectileQuery)
    for (const entity of projectiles) {
      const pos = entity.get(Position)
      if (!pos) continue

      // Hit ground or timeout
      if (pos.y < -0.5 || this.elapsedTime > MAX_SIMULATION_DURATION_S) {
        this.complete = true

        // Stop recording
        const recorder = entity.get(TrajectoryRecorder)
        if (recorder) {
          this.trajectoryPoints = recorder.points.map(
            (p: { x: number; y: number; z: number }) => [p.x, p.y, p.z] as Vec3Tuple,
          )
          entity.set(TrajectoryRecorder, { points: recorder.points, recording: false })
        }
      }
    }
  }

  isComplete(): boolean {
    return this.complete
  }

  getResult(): SimulationResult {
    const points = this.trajectoryPoints
    const landing = points.length > 0 ? points[points.length - 1] : undefined
    const maxHeight = points.reduce((max, p) => Math.max(max, p[1]), 0)
    const totalDistance = landing ? Math.sqrt(landing[0] ** 2 + landing[2] ** 2) : 0

    return {
      trajectoryPoints: points,
      landingPosition: landing,
      maxHeight,
      totalDistance,
      totalTime: this.elapsedTime,
    }
  }

  evaluate(prediction: PredictionData | undefined, _result: SimulationResult): DiscoverOutcome {
    if (!prediction) return 'skipped'

    // For the Monkey & Hunter challenge: "Directly at the target" is correct
    if (prediction.type === 'placement' || prediction.type === 'binary') {
      const choice = prediction.type === 'binary' ? prediction.choice : ''
      if (choice === 'Directly at the target') return 'correct'
      if (choice === 'Above the target') return 'close'
      return 'wrong'
    }

    return 'close'
  }

  cleanup(): void {
    if (this.projectileEntity && this.projectileEntity.has(Position)) {
      this.projectileEntity.destroy()
    }
    if (this.targetEntity && this.targetEntity.has(Position)) {
      this.targetEntity.destroy()
    }
    this.projectileEntity = undefined
    this.targetEntity = undefined
    this.config = undefined
  }
}
