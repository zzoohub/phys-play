import { useState, useEffect } from 'react'
import { initRapier, disposePhysics } from '#/engine/physics/index.ts'

/** Initializes Rapier WASM. World creation is done by the simulation engine. */
export function usePhysics() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<Error>()

  useEffect(() => {
    let disposed = false

    initRapier()
      .then(() => {
        if (!disposed) setReady(true)
      })
      .catch((err: unknown) => {
        if (!disposed) setError(err instanceof Error ? err : new Error(String(err)))
      })

    return () => {
      disposed = true
      disposePhysics()
      setReady(false)
    }
  }, [])

  return { ready, error }
}
