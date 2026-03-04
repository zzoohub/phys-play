import { world } from '#/engine/ecs/world.ts'
import { Position, Projectile, TrajectoryRecorder } from '#/engine/ecs/components/index.ts'
import { createQuery } from 'koota'

const recordingQuery = createQuery(Position, Projectile, TrajectoryRecorder)

export function trajectoryRecordSystem(): void {
  for (const entity of world.query(recordingQuery)) {
    const recorder = entity.get(TrajectoryRecorder)
    if (!recorder || !recorder.recording) continue

    const pos = entity.get(Position)
    if (!pos) continue

    entity.set(TrajectoryRecorder, {
      points: [...recorder.points, { x: pos.x, y: pos.y, z: pos.z }],
      recording: true,
    })
  }
}
