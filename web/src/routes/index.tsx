import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '~/site/views/landing'

export const Route = createFileRoute('/')({
  component: LandingPage,
})
