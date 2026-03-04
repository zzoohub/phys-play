import { useState, useCallback, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { Vec3Tuple } from '#/platform/types/index.ts'

interface PlacementMarkerProps {
  onPlace?: (position: Vec3Tuple) => void
  position?: Vec3Tuple
  enabled?: boolean
}

export function PlacementMarker({ onPlace, position, enabled = true }: PlacementMarkerProps) {
  const { camera, size } = useThree()
  const [hover, setHover] = useState<[number, number, number] | undefined>()
  const raycaster = useRef(new THREE.Raycaster())
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))

  const screenToWorld = useCallback(
    (screenX: number, screenY: number): [number, number, number] | undefined => {
      const ndc = new THREE.Vector2(
        (screenX / size.width) * 2 - 1,
        -(screenY / size.height) * 2 + 1,
      )
      raycaster.current.setFromCamera(ndc, camera)
      const target = new THREE.Vector3()
      const hit = raycaster.current.ray.intersectPlane(groundPlane.current, target)
      if (!hit) return undefined
      return [target.x, 0.5, target.z]
    },
    [camera, size],
  )

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!enabled) return
      const pt = screenToWorld(e.nativeEvent.clientX, e.nativeEvent.clientY)
      if (pt) setHover(pt)
    },
    [enabled, screenToWorld],
  )

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (!enabled) return
      e.stopPropagation()
      const pt = screenToWorld(e.nativeEvent.clientX, e.nativeEvent.clientY)
      if (pt) onPlace?.(pt as Vec3Tuple)
    },
    [enabled, screenToWorld, onPlace],
  )

  const markerPos = position
    ? [position[0], position[1], position[2]] as [number, number, number]
    : hover

  return (
    <>
      <mesh
        visible={false}
        rotation-x={-Math.PI / 2}
        position-y={0.02}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
      >
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {markerPos && (
        <group position={markerPos}>
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial
              color="#0db9f2"
              transparent
              opacity={position ? 0.8 : 0.4}
            />
          </mesh>
          <mesh rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.3, 0.5, 32]} />
            <meshBasicMaterial
              color="#0db9f2"
              transparent
              opacity={position ? 0.5 : 0.2}
            />
          </mesh>
        </group>
      )}
    </>
  )
}
