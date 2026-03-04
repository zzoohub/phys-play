import { trait } from 'koota'

export const Projectile = trait()
export const Ground = trait()
export const Target = trait()

export const TrajectoryRecorder = trait(() => ({
  points: [] as Array<{ x: number; y: number; z: number }>,
  recording: false as boolean,
}))
