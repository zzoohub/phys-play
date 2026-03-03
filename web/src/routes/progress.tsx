import { createFileRoute } from '@tanstack/react-router'
import { ProgressPage } from '~/site/views/progress'

export const Route = createFileRoute('/progress')({
  component: ProgressPage,
})
