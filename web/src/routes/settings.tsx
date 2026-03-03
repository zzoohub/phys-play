import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '~/site/views/settings'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})
