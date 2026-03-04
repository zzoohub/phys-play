import type { PredictionType, Vec3Tuple } from './simulation.ts'

export type EngineId = 'projectile' | 'collision-energy' | 'wave'
export type EnvironmentPreset =
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'space'
  | 'station'

/** Locale-keyed text field in raw challenge JSON */
export type LocaleText = { readonly en: string; readonly ko: string }
/** Locale-keyed string array in raw challenge JSON */
export type LocaleTextArray = { readonly en: readonly string[]; readonly ko: readonly string[] }

/** Resolved challenge config — all text fields are plain strings in the active locale */
export interface ChallengeConfig {
  readonly id: string
  readonly engineId: EngineId
  readonly version: number
  readonly params: ProjectileParams
  readonly predict: PredictConfig
  readonly discover: DiscoverConfig
  readonly difficulty: number
  readonly space: string
  readonly station: string
  readonly tags: readonly string[]
  readonly contextHint?: string
}

/** Raw challenge JSON format — text fields are locale-keyed objects */
export interface ChallengeConfigRaw {
  readonly id: string
  readonly engineId: EngineId
  readonly version: number
  readonly params: ProjectileParams
  readonly predict: PredictConfigRaw
  readonly discover: DiscoverConfigRaw
  readonly difficulty: number
  readonly space: string
  readonly station: string
  readonly tags: readonly string[]
  readonly contextHint?: string
}

export interface ProjectileParams {
  readonly gravity: number
  readonly launchSpeed: number
  readonly mass: number
  readonly drag: number
  readonly targetPosition?: Vec3Tuple
  readonly targetDropOnLaunch?: boolean
  readonly environmentPreset: EnvironmentPreset
}

export interface PredictConfig {
  readonly type: PredictionType
  readonly question: string
  readonly options?: readonly string[]
}

export interface PredictConfigRaw {
  readonly type: PredictionType
  readonly question: LocaleText
  readonly options?: LocaleTextArray
}

export interface DiscoverConfig {
  readonly relatedConcepts: readonly string[]
  readonly level1: string
  readonly level2: string
  readonly level3: string
}

export interface DiscoverConfigRaw {
  readonly relatedConcepts: readonly string[]
  readonly level1: LocaleText
  readonly level2: LocaleText
  readonly level3: LocaleText
}
