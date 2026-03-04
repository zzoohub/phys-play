import { useState, useCallback, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import type { Vec3Tuple } from '#/platform/types/index.ts'

interface TrajectoryDrawerProps {
  onComplete?: (points: Vec3Tuple[]) => void
  enabled?: boolean
}

export function TrajectoryDrawer({ onComplete, enabled = true }: TrajectoryDrawerProps) {
  const { camera, size } = useThree()
  const [points, setPoints] = useState<[number, number, number][]>([])
  const [drawing, setDrawing] = useState(false)
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
      return [target.x, Math.max(0, target.z * -0.3 + 2), target.z]
    },
    [camera, size],
  )

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!enabled || e.nativeEvent.button !== 0) return
      e.stopPropagation()
      setDrawing(true)
      const pt = screenToWorld(e.nativeEvent.clientX, e.nativeEvent.clientY)
      if (pt) setPoints([pt])
    },
    [enabled, screenToWorld],
  )

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!drawing) return
      const pt = screenToWorld(e.nativeEvent.clientX, e.nativeEvent.clientY)
      if (pt) {
        setPoints((prev) => [...prev, pt])
      }
    },
    [drawing, screenToWorld],
  )

  const handlePointerUp = useCallback(() => {
    if (!drawing) return
    setDrawing(false)
    if (points.length >= 2) {
      onComplete?.(points as Vec3Tuple[])
    }
  }, [drawing, points, onComplete])

  return (
    <>
      <mesh
        visible={false}
        rotation-x={-Math.PI / 2}
        position-y={0.02}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {points.length >= 2 && (
        <Line
          points={points}
          color="#0db9f2"
          lineWidth={2}
          dashed
          dashSize={0.3}
          gapSize={0.2}
          transparent
          opacity={0.7}
        />
      )}
    </>
  )
}
