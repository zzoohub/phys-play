import { createFileRoute } from '@tanstack/react-router'
import { MechanicsLabExperience } from '#/domains/mechanics-lab/index.tsx'

export const Route = createFileRoute('/lab')({
  component: LabPage,
})

function LabPage() {
  return <MechanicsLabExperience />
}
