import { Canvas } from '@react-three/fiber'
import { WorldProvider } from 'koota/react'
import { world } from '#/engine/ecs/world.ts'

export function ExperienceCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ position: 'absolute', inset: 0 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <WorldProvider world={world}>
          {children}
        </WorldProvider>
      </Canvas>
    </div>
  )
}
