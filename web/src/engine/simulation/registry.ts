import type { SimulationEngine } from './types.ts'

const registry = new Map<string, () => SimulationEngine>()

export function registerEngine(engineId: string, factory: () => SimulationEngine): void {
  registry.set(engineId, factory)
}

export function createEngine(engineId: string): SimulationEngine {
  const factory = registry.get(engineId)
  if (!factory) throw new Error(`Engine not registered: ${engineId}`)
  return factory()
}

export function hasEngine(engineId: string): boolean {
  return registry.has(engineId)
}
