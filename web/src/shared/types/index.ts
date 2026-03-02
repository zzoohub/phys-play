export type Language = 'en' | 'ko'
export type Theme = 'light' | 'dark'

export type ModuleId = '1' | '2' | '3' | '4' | '5' | '6'
export type TrackId = '1' | '2' | '3' | '4'

export type GravityEnvironment = 'earth' | 'moon' | 'zero-g'

export interface Module {
  trackId: TrackId
  moduleId: ModuleId
  available: boolean
}

export interface Track {
  id: TrackId
  modules: Module[]
  available: boolean
}

export interface SliderConfig {
  label: Record<Language, string>
  unit: string
  min: number
  max: number
  step: number
  defaultValue: number
}

export interface ToggleConfig {
  label: Record<Language, string>
  defaultValue: boolean
}
