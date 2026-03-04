import { create } from 'zustand'
import type {
  CoreLoopPhase,
  ChallengeConfig,
  PredictionData,
  SimulationResult,
  DiscoverOutcome,
} from '#/platform/types/index.ts'

interface CoreLoopState {
  phase: CoreLoopPhase
  challenge: ChallengeConfig | undefined
  prediction: PredictionData | undefined
  result: SimulationResult | undefined
  outcome: DiscoverOutcome | undefined

  loadChallenge: (challenge: ChallengeConfig) => void
  submitPrediction: (prediction: PredictionData) => void
  skipPrediction: () => void
  startPlay: () => void
  completeSimulation: (result: SimulationResult) => void
  nextChallenge: () => void
  exitLab: () => void
}

const initialState = {
  phase: 'IDLE' as const,
  challenge: undefined,
  prediction: undefined,
  result: undefined,
  outcome: undefined,
}

export const useCoreLoopStore = create<CoreLoopState>()((set, get) => ({
  ...initialState,

  loadChallenge: (challenge) => {
    set({
      phase: 'PREDICT',
      challenge,
      prediction: undefined,
      result: undefined,
      outcome: undefined,
    })
  },

  submitPrediction: (prediction) => {
    if (get().phase !== 'PREDICT') return
    set({ phase: 'PLAY', prediction })
  },

  skipPrediction: () => {
    if (get().phase !== 'PREDICT') return
    set({ phase: 'PLAY', prediction: undefined })
  },

  startPlay: () => {
    if (get().phase !== 'PREDICT') return
    set({ phase: 'PLAY' })
  },

  completeSimulation: (result) => {
    if (get().phase !== 'PLAY') return
    set({ phase: 'DISCOVER', result })
  },

  nextChallenge: () => {
    const { challenge } = get()
    if (challenge) {
      set({
        phase: 'PREDICT',
        prediction: undefined,
        result: undefined,
        outcome: undefined,
      })
    } else {
      set(initialState)
    }
  },

  exitLab: () => {
    set(initialState)
  },
}))
