import { createFileRoute } from '@tanstack/react-router'
import { LandingView } from '#/site/views/landing'

export const Route = createFileRoute('/')({
  component: LandingView,
})
