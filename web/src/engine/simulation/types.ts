import type { ChallengeConfig, PredictionData, SimulationResult, DiscoverOutcome } from '#/platform/types/index.ts'

export interface SimulationEngine {
  readonly engineId: string
  setup(config: ChallengeConfig): void
  step(dt: number): void
  isComplete(): boolean
  getResult(): SimulationResult
  evaluate(prediction: PredictionData | undefined, result: SimulationResult): DiscoverOutcome
  cleanup(): void
}
