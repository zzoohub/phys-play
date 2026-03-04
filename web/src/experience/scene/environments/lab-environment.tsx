import { useMemo } from 'react'
import { createGridMaterial } from '#/experience/scene/materials/grid-material.ts'

export function LabEnvironment() {
  const gridMaterial = useMemo(() => createGridMaterial(), [])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Ground plane */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0d181b" roughness={0.9} />
      </mesh>

      {/* Grid overlay */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.001}>
        <planeGeometry args={[60, 60]} />
        <primitive object={gridMaterial} attach="material" />
      </mesh>

      {/* Background */}
      <color attach="background" args={['#0a1114']} />
      <fog attach="fog" args={['#0a1114', 20, 50]} />
    </>
  )
}
