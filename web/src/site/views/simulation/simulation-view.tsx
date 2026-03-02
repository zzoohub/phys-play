import { useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useLang } from '#/shared/stores'
import { getModule, getModuleKey, getNextModule } from '#/shared/constants'
import { ComingSoonModule } from '#/shared/ui'
import { SimulationTopBar, PlaybackBar, ControlPanel } from '#/site/widgets'

interface SimulationViewProps {
  trackId: string
  moduleId: string
}

export function SimulationView({ trackId, moduleId }: SimulationViewProps) {
  const { lang } = useLang()
  const navigate = useNavigate()
  const moduleKey = getModuleKey(trackId, moduleId)
  const module = getModule(moduleKey)
  const nextModule = getNextModule(trackId, moduleId)

  const [isPlaying, setIsPlaying] = useState(false)
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [showVectors, setShowVectors] = useState(false)

  const handlePlay = useCallback(() => setIsPlaying(true), [])
  const handlePause = useCallback(() => setIsPlaying(false), [])
  const handleReset = useCallback(() => setIsPlaying(false), [])
  const handleNextModule = useCallback(() => {
    if (nextModule) {
      navigate({ to: '/module/$trackId/$moduleId', params: { trackId: nextModule.trackId, moduleId: nextModule.moduleId } })
    }
  }, [navigate, nextModule])
  const handleToggleVectors = useCallback(() => setShowVectors(v => !v), [])
  const handleShowFormula = useCallback(() => { /* TODO: open formula bottom sheet */ }, [])

  // Module not found or not available
  if (!module) {
    return (
      <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50">
        <ComingSoonModule lang={lang} />
      </div>
    )
  }

  if (!module.available) {
    return (
      <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50">
        <ComingSoonModule lang={lang} />
      </div>
    )
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950">
      {/* 3D Canvas placeholder */}
      <div className={`absolute inset-0 bg-gradient-to-br ${module.themeGradient} opacity-20`} />
      <div className="absolute inset-0 bg-slate-950/60" />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 3D placeholder content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-4 opacity-20">
          <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
          <p className="text-sm text-slate-500 tracking-widest uppercase">3D Scene</p>
        </div>
      </div>

      {/* Reset viewpoint button */}
      <button
        type="button"
        aria-label="Reset viewpoint"
        className="absolute left-3 bottom-[calc(50%)] z-20 hidden md:flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/60 border border-white/[0.06] text-slate-500 hover:text-white transition-all cursor-pointer"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
      </button>

      {/* HUD Layers */}
      <SimulationTopBar moduleName={module.name[lang]} />

      {/* Playback bar — desktop: below top bar, mobile: above bottom panel */}
      <div className="absolute left-0 right-0 md:right-auto md:left-0 md:top-12 bottom-[45vh] md:bottom-auto z-20 md:w-[calc(100%-320px)]"
        style={{
          ...(panelCollapsed ? { width: '100%' } : {}),
        }}
      >
        <PlaybackBar
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
          onNextModule={handleNextModule}
          showVectors={showVectors}
          onToggleVectors={handleToggleVectors}
          onShowFormula={handleShowFormula}
          hasNextModule={!!nextModule}
        />
      </div>

      {/* Control Panel */}
      <ControlPanel
        moduleKey={moduleKey}
        collapsed={panelCollapsed}
        onToggleCollapse={() => setPanelCollapsed(v => !v)}
      />
    </div>
  )
}
