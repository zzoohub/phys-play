import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCoreLoopStore } from '#/platform/stores/core-loop.ts'
import { useLabStore } from '#/domains/mechanics-lab/stores/lab-store.ts'

export function SimulationLoop() {
  const phase = useCoreLoopStore((s) => s.phase)
  const completeSimulation = useCoreLoopStore((s) => s.completeSimulation)
  const engineInstance = useLabStore((s) => s.engineInstance)
  const launchedRef = useRef(false)

  useEffect(() => {
    if (phase === 'PLAY') {
      launchedRef.current = false
    }
  }, [phase])

  useFrame(() => {
    if (phase !== 'PLAY' || !engineInstance) return

    // The engine's step handles physics internally
    engineInstance.step(1 / 60)

    if (engineInstance.isComplete()) {
      const result = engineInstance.getResult()
      completeSimulation(result)
    }
  })

  return null
}
