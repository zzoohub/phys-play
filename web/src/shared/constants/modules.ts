import { t } from './i18n'
import type { Language, TrackId, ModuleId } from '#/shared/types'

export interface ModuleInfo {
  trackId: TrackId
  moduleId: ModuleId
  name: Record<Language, string>
  description?: Record<Language, string>
  available: boolean
  themeColor: string
  themeGradient: string
}

export interface TrackInfo {
  id: TrackId
  name: Record<Language, string>
  subtitle: Record<Language, string>
  available: boolean
  icon: string
  modules: ModuleInfo[]
}

export const MODULES = {
  '1-1': {
    trackId: '1',
    moduleId: '1',
    name: t.motionAndForce,
    description: t.motionAndForceDesc,
    available: true,
    themeColor: '#3b82f6',
    themeGradient: 'from-blue-600 to-indigo-800',
  },
  '1-2': {
    trackId: '1',
    moduleId: '2',
    name: t.energyAndWork,
    description: t.energyAndWorkDesc,
    available: true,
    themeColor: '#f59e0b',
    themeGradient: 'from-amber-500 to-orange-700',
  },
  '1-3': {
    trackId: '1',
    moduleId: '3',
    name: t.waves,
    description: t.wavesDesc,
    available: true,
    themeColor: '#06b6d4',
    themeGradient: 'from-cyan-500 to-teal-700',
  },
  '1-4': {
    trackId: '1',
    moduleId: '4',
    name: t.soundAndLight,
    available: false,
    themeColor: '#8b5cf6',
    themeGradient: 'from-violet-500 to-purple-700',
  },
  '1-5': {
    trackId: '1',
    moduleId: '5',
    name: t.electricityAndMagnetism,
    available: false,
    themeColor: '#eab308',
    themeGradient: 'from-yellow-500 to-amber-700',
  },
  '1-6': {
    trackId: '1',
    moduleId: '6',
    name: t.electromagneticWaves,
    available: false,
    themeColor: '#ec4899',
    themeGradient: 'from-pink-500 to-rose-700',
  },
} satisfies Record<string, ModuleInfo>

export const TRACKS: TrackInfo[] = [
  {
    id: '1',
    name: t.classicalPhysics,
    subtitle: t.classicalPhysicsDesc,
    available: true,
    icon: '⚡',
    modules: [
      MODULES['1-1'],
      MODULES['1-2'],
      MODULES['1-3'],
      MODULES['1-4'],
      MODULES['1-5'],
      MODULES['1-6'],
    ],
  },
  {
    id: '2',
    name: t.chemistry,
    subtitle: t.chemistryDesc,
    available: false,
    icon: '🧪',
    modules: [],
  },
  {
    id: '3',
    name: t.spaceScience,
    subtitle: t.spaceScienceDesc,
    available: false,
    icon: '🚀',
    modules: [],
  },
  {
    id: '4',
    name: t.quantumMechanics,
    subtitle: t.quantumMechanicsDesc,
    available: false,
    icon: '⚛',
    modules: [],
  },
]

export type ModuleKey = keyof typeof MODULES

export const AVAILABLE_MODULES = Object.values(MODULES).filter(m => m.available)

export function getModuleKey(trackId: string, moduleId: string): string {
  return `${trackId}-${moduleId}`
}

export function getModule(key: string): ModuleInfo | undefined {
  return (MODULES as Record<string, ModuleInfo>)[key]
}

export function getNextModule(trackId: string, moduleId: string): ModuleInfo | null {
  const currentIdx = Number(moduleId)
  const next = getModule(`${trackId}-${currentIdx + 1}`)
  return next?.available ? next : null
}
