import { useCoreLoopStore } from '#/platform/stores/core-loop.ts'
import { HudTopBar } from './controls/hud-top-bar.tsx'
import { HudBottomBar } from './controls/hud-bottom-bar.tsx'
import { PredictOverlay } from './overlays/predict-overlay.tsx'
import { DiscoverOverlay } from './overlays/discover-overlay.tsx'

export function HudRoot() {
  const phase = useCoreLoopStore((s) => s.phase)

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div className="pointer-events-auto">
        <HudTopBar />
      </div>
      {phase === 'PREDICT' && <PredictOverlay />}
      {phase === 'DISCOVER' && <DiscoverOverlay />}
      <HudBottomBar />
    </div>
  )
}
