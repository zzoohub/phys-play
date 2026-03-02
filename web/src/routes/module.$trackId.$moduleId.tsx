import { createFileRoute } from '@tanstack/react-router'
import { SimulationView } from '#/site/views/simulation'

export const Route = createFileRoute('/module/$trackId/$moduleId')({
  component: SimulationRoute,
})

function SimulationRoute() {
  const { trackId, moduleId } = Route.useParams()
  return <SimulationView trackId={trackId} moduleId={moduleId} />
}
