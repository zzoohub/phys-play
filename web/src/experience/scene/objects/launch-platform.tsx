interface LaunchPlatformProps {
  position?: [number, number, number]
}

export function LaunchPlatform({ position = [0, 0.25, 0] }: LaunchPlatformProps) {
  return (
    <group position={position}>
      {/* Base platform */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.5, 1.5]} />
        <meshStandardMaterial color="#1a3138" roughness={0.7} metalness={0.4} />
      </mesh>
      {/* Top accent */}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[1.3, 0.02, 1.3]} />
        <meshStandardMaterial
          color="#0db9f2"
          emissive="#0db9f2"
          emissiveIntensity={0.4}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}
