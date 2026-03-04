import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { fpsValue } from './fps-ref.ts'

/** Runs inside R3F canvas to measure FPS and expose it to the DOM overlay */
export function FpsMonitor() {
  const frames = useRef(0)
  const lastTime = useRef(performance.now())

  useFrame(() => {
    frames.current++
    const now = performance.now()
    const delta = now - lastTime.current

    if (delta >= 1000) {
      fpsValue.current = Math.round((frames.current * 1000) / delta)
      frames.current = 0
      lastTime.current = now
    }
  })

  return null
}
