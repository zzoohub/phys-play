export type CoreLoopPhase = 'IDLE' | 'PREDICT' | 'PLAY' | 'DISCOVER'

export type PredictionType = 'trajectory' | 'binary' | 'pattern' | 'placement'

export type Vec3Tuple = readonly [x: number, y: number, z: number]

export type PredictionData =
  | { type: 'trajectory'; points: Vec3Tuple[] }
  | { type: 'binary'; choice: string }
  | { type: 'pattern'; selectedIndex: number }
  | { type: 'placement'; position: Vec3Tuple }

export interface SimulationResult {
  readonly trajectoryPoints: Vec3Tuple[]
  readonly landingPosition: Vec3Tuple | undefined
  readonly maxHeight: number
  readonly totalDistance: number
  readonly totalTime: number
}

export type DiscoverOutcome = 'correct' | 'close' | 'wrong' | 'skipped'
