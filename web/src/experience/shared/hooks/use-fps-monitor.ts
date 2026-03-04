import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

export function useFpsMonitor() {
  const [fps, setFps] = useState(60)
  const frames = useRef(0)
  const lastTime = useRef(performance.now())

  useFrame(() => {
    frames.current++
    const now = performance.now()
    const delta = now - lastTime.current

    if (delta >= 1000) {
      setFps(Math.round((frames.current * 1000) / delta))
      frames.current = 0
      lastTime.current = now
    }
  })

  return fps
}
