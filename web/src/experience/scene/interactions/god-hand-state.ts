export type GodHandMode = 'idle' | 'aiming' | 'launched'

export interface AimState {
  startScreenPos: { x: number; y: number }
  currentScreenPos: { x: number; y: number }
  direction: { x: number; y: number; z: number }
  power: number // 0 to 1
}

export const MAX_DRAG_PIXELS = 200
export const MAX_LAUNCH_SPEED = 30
export const MIN_LAUNCH_SPEED = 3
