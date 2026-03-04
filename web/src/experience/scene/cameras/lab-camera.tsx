import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

export function LabCamera() {
  return (
    <OrbitControls
      mouseButtons={{
        LEFT: undefined as unknown as THREE.MOUSE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.ROTATE,
      }}
      enableDamping
      dampingFactor={0.1}
      minDistance={3}
      maxDistance={30}
      maxPolarAngle={Math.PI / 2 - 0.05}
      target={[5, 2, 0]}
    />
  )
}
