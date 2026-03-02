import { createFileRoute } from '@tanstack/react-router'
import { TracksView } from '#/site/views/tracks'

export const Route = createFileRoute('/tracks')({
  component: TracksView,
})
