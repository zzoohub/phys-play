import { create } from 'zustand'
import type { SimulationEngine } from '#/engine/simulation/types.ts'

interface LabState {
  currentStation: string
  engineInstance: SimulationEngine | undefined
  physicsReady: boolean

  setStation: (station: string) => void
  setEngineInstance: (engine: SimulationEngine | undefined) => void
  setPhysicsReady: (ready: boolean) => void
}

export const useLabStore = create<LabState>()((set) => ({
  currentStation: 'projectile',
  engineInstance: undefined,
  physicsReady: false,

  setStation: (station) => set({ currentStation: station }),
  setEngineInstance: (engine) => set({ engineInstance: engine }),
  setPhysicsReady: (ready) => set({ physicsReady: ready }),
}))
