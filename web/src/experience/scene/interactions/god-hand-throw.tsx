import { useState, useCallback, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { Entity } from 'koota'
import {
  type GodHandMode,
  type AimState,
  MAX_DRAG_PIXELS,
  MAX_LAUNCH_SPEED,
  MIN_LAUNCH_SPEED,
} from './god-hand-state.ts'
import { getPhysicsWorld, RAPIER } from '#/engine/physics/rapier-context.ts'
import { RapierHandle } from '#/engine/ecs/components/index.ts'
import { VelocityArrow } from './velocity-arrow.tsx'

interface GodHandThrowProps {
  projectileEntity: Entity | undefined
  onLaunch?: () => void
  enabled?: boolean
}

export function GodHandThrow({ projectileEntity, onLaunch, enabled = true }: GodHandThrowProps) {
  const { camera, size } = useThree()
  const [mode, setMode] = useState<GodHandMode>('idle')
  const [aim, setAim] = useState<AimState | undefined>()
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const raycaster = useRef(new THREE.Raycaster())

  const screenToWorld = useCallback(
    (screenX: number, screenY: number): THREE.Vector3 | undefined => {
      const ndc = new THREE.Vector2(
        (screenX / size.width) * 2 - 1,
        -(screenY / size.height) * 2 + 1,
      )
      raycaster.current.setFromCamera(ndc, camera)
      const target = new THREE.Vector3()
      const hit = raycaster.current.ray.intersectPlane(groundPlane.current, target)
      return hit ?? undefined
    },
    [camera, size],
  )

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!enabled || !projectileEntity || mode === 'launched') return
      if (e.nativeEvent.button !== 0) return

      e.stopPropagation()

      setMode('aiming')
      setAim({
        startScreenPos: { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY },
        currentScreenPos: { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY },
        direction: { x: 0, y: 0, z: 0 },
        power: 0,
      })
    },
    [enabled, projectileEntity, mode],
  )

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (mode !== 'aiming' || !aim) return

      const dx = e.nativeEvent.clientX - aim.startScreenPos.x
      const dy = e.nativeEvent.clientY - aim.startScreenPos.y
      const dragDist = Math.sqrt(dx * dx + dy * dy)
      const power = Math.min(dragDist / MAX_DRAG_PIXELS, 1)

      // Slingshot: drag backward to launch forward
      const startWorld = screenToWorld(aim.startScreenPos.x, aim.startScreenPos.y)
      const currentWorld = screenToWorld(e.nativeEvent.clientX, e.nativeEvent.clientY)

      if (startWorld && currentWorld) {
        const dir3d = new THREE.Vector3()
          .subVectors(startWorld, currentWorld)
          .normalize()
        // Add upward component based on vertical drag
        dir3d.y = Math.max(0.2, power * 0.8)
        dir3d.normalize()

        setAim({
          ...aim,
          currentScreenPos: { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY },
          direction: { x: dir3d.x, y: dir3d.y, z: dir3d.z },
          power,
        })
      }
    },
    [mode, aim, screenToWorld],
  )

  const handlePointerUp = useCallback(
    (_e: ThreeEvent<PointerEvent>) => {
      if (mode !== 'aiming' || !aim || !projectileEntity) return

      if (aim.power < 0.05) {
        setMode('idle')
        setAim(undefined)
        return
      }

      // Apply velocity to Rapier body
      const physWorld = getPhysicsWorld()
      const handle = projectileEntity.get(RapierHandle)
      if (physWorld && handle) {
        const body = physWorld.getRigidBody(
          handle.handle as unknown as import('@dimforge/rapier3d-compat').RigidBodyHandle,
        )
        if (body) {
          const speed = MIN_LAUNCH_SPEED + aim.power * (MAX_LAUNCH_SPEED - MIN_LAUNCH_SPEED)
          body.setLinvel(
            new RAPIER.Vector3(
              aim.direction.x * speed,
              aim.direction.y * speed,
              aim.direction.z * speed,
            ),
            true,
          )
        }
      }

      setMode('launched')
      setAim(undefined)
      onLaunch?.()
    },
    [mode, aim, projectileEntity, onLaunch],
  )

  return (
    <>
      {/* Invisible interaction plane */}
      <mesh
        visible={false}
        rotation-x={-Math.PI / 2}
        position-y={0.01}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Velocity arrow visualization */}
      {aim && mode === 'aiming' && (
        <VelocityArrow aim={aim} projectileEntity={projectileEntity} />
      )}
    </>
  )
}
