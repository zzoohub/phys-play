import type { ChallengeConfig, ChallengeConfigRaw } from '#/platform/types/index.ts'
import { getLocale } from '#/paraglide/runtime.js'
import monkeyHunterRaw from '#/content/challenges/projectile/monkey-hunter.json'

const rawChallenges = new Map<string, ChallengeConfigRaw>([
  ['projectile-monkey-hunter', monkeyHunterRaw as unknown as ChallengeConfigRaw],
])

function resolveLocale(raw: ChallengeConfigRaw): ChallengeConfig {
  const locale = getLocale() as 'en' | 'ko'
  const options = raw.predict.options?.[locale]
  return {
    ...raw,
    predict: {
      type: raw.predict.type,
      question: raw.predict.question[locale],
      ...(options !== undefined ? { options } : {}),
    },
    discover: {
      relatedConcepts: raw.discover.relatedConcepts,
      level1: raw.discover.level1[locale],
      level2: raw.discover.level2[locale],
      level3: raw.discover.level3[locale],
    },
  }
}

export function loadChallenge(id: string): ChallengeConfig | undefined {
  const raw = rawChallenges.get(id)
  if (!raw) return undefined
  return resolveLocale(raw)
}

export function getDefaultChallenge(): ChallengeConfig {
  return resolveLocale(monkeyHunterRaw as unknown as ChallengeConfigRaw)
}
