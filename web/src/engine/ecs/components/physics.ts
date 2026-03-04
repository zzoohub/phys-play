import { trait } from 'koota'

export const Velocity = trait({ x: 0, y: 0, z: 0 })
export const Force = trait({ x: 0, y: 0, z: 0 })
export const Mass = trait({ value: 1 })
export const Drag = trait({ value: 0 })
export const RigidBody = trait()
export const RapierHandle = trait({ handle: 0 })
