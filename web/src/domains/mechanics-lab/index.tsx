import { useEffect, useCallback, useRef, Suspense } from 'react'
import { m } from '#/paraglide/messages.js'
import { ExperienceCanvas } from '#/experience/canvas/index.ts'
import { LabEnvironment } from '#/experience/scene/environments/index.ts'
import { LabCamera } from '#/experience/scene/cameras/index.ts'
import { ProjectileSphere } from '#/experience/scene/objects/projectile-sphere.tsx'
import { TargetMarker } from '#/experience/scene/objects/target-marker.tsx'
import { LaunchPlatform } from '#/experience/scene/objects/launch-platform.tsx'
import { GodHandThrow } from '#/experience/scene/interactions/god-hand-throw.tsx'
import { TrajectoryLine } from '#/experience/scene/helpers/trajectory-line.tsx'
import { SimulationLoop } from '#/domains/mechanics-lab/use-cases/simulation-loop.tsx'
import { FpsMonitor } from './fps-monitor.tsx'
import { fpsValue } from './fps-ref.ts'
import { HudRoot } from '#/experience/hud/index.ts'
import { FpsCounter } from '#/experience/hud/controls/fps-counter.tsx'
import { useCoreLoopStore } from '#/platform/stores/core-loop.ts'
import { useLabStore } from './stores/lab-store.ts'
import { usePhysics } from '#/experience/scene/hooks/use-physics.ts'
import { getDefaultChallenge } from '#/engine/challenge/index.ts'
import { ProjectileEngine } from '#/engine/simulation/projectile/engine.ts'
import { registerEngine, createEngine } from '#/engine/simulation/registry.ts'
import type { Entity } from 'koota'

// Register the projectile engine
registerEngine('projectile', () => new ProjectileEngine())

function MechanicsLabScene() {
  const phase = useCoreLoopStore((s) => s.phase)
  const result = useCoreLoopStore((s) => s.result)
  const engineInstance = useLabStore((s) => s.engineInstance)
  const setEngineInstance = useLabStore((s) => s.setEngineInstance)

  const projectileEntityRef = useRef<Entity | undefined>(undefined)
  const targetEntityRef = useRef<Entity | undefined>(undefined)

  // Load challenge on mount
  useEffect(() => {
    const challenge = getDefaultChallenge()
    const engine = createEngine(challenge.engineId) as ProjectileEngine
    engine.setup(challenge)
    setEngineInstance(engine)

    projectileEntityRef.current = engine.getProjectileEntity()
    targetEntityRef.current = engine.getTargetEntity()

    useCoreLoopStore.getState().loadChallenge(challenge)

    return () => {
      engine.cleanup()
      setEngineInstance(undefined)
    }
  }, [setEngineInstance])

  // Re-setup on nextChallenge
  useEffect(() => {
    if (phase === 'PREDICT' && !engineInstance) {
      const challenge = getDefaultChallenge()
      const engine = createEngine(challenge.engineId) as ProjectileEngine
      engine.setup(challenge)
      setEngineInstance(engine)
      projectileEntityRef.current = engine.getProjectileEntity()
      targetEntityRef.current = engine.getTargetEntity()
    }
  }, [phase, engineInstance, setEngineInstance])

  const handleLaunch = useCallback(() => {
    const engine = engineInstance as ProjectileEngine | undefined
    engine?.markLaunched()
  }, [engineInstance])

  return (
    <>
      <LabEnvironment />
      <LabCamera />
      <LaunchPlatform />

      <ProjectileSphere entity={projectileEntityRef.current} />
      <TargetMarker entity={targetEntityRef.current} />

      {phase === 'PLAY' && (
        <GodHandThrow
          projectileEntity={projectileEntityRef.current}
          onLaunch={handleLaunch}
          enabled={phase === 'PLAY'}
        />
      )}

      {/* Show trajectories in discover phase */}
      {phase === 'DISCOVER' && result && (
        <TrajectoryLine
          points={result.trajectoryPoints}
          color="#f59e0b"
          lineWidth={3}
          opacity={0.9}
        />
      )}

      <SimulationLoop />
      <FpsMonitor />
    </>
  )
}

export function MechanicsLabExperience() {
  const { ready, error } = usePhysics()
  const setPhysicsReady = useLabStore((s) => s.setPhysicsReady)

  useEffect(() => {
    setPhysicsReady(ready)
  }, [ready, setPhysicsReady])

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-dark">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
          <p className="text-red-400 font-medium">{m.lab_error()}</p>
          <p className="text-slate-500 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-dark">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium text-sm">{m.lab_loading()}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full bg-bg-dark overflow-hidden">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-bg-dark">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        }
      >
        <ExperienceCanvas>
          <MechanicsLabScene />
        </ExperienceCanvas>
      </Suspense>
      <HudRoot />
      <FpsCounterHud />
    </div>
  )
}

/** FPS counter bridge — reads FPS from R3F context via a child component */
function FpsCounterHud() {
  // FPS is measured inside R3F canvas; we display it as an HTML overlay
  // The FpsMonitor inside the canvas stores FPS in a ref we can read
  return <FpsCounter fps={fpsValue.current} />
}

// Re-export for convenience
export { fpsValue } from './fps-ref.ts'
