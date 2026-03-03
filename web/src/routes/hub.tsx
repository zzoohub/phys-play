import { createFileRoute } from '@tanstack/react-router'
import { HubPage } from '~/site/views/hub'

export const Route = createFileRoute('/hub')({
  component: HubPage,
})
