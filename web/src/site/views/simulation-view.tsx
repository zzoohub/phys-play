import { useState, useCallback } from "react";
import { SimTopBar } from "#/site/widgets/sim-top-bar";
import { SimCanvasPlaceholder } from "#/site/widgets/sim-canvas-placeholder";
import { SimControlPanel } from "#/site/widgets/sim-control-panel";
import { SimPlaybackBar } from "#/site/widgets/sim-playback-bar";

/* ── Module registry ───────────────────────────────────────────── */

type ModuleInfo = {
  name: string;
  moduleKey: string;
  color: string;
  nextHref: string | null;
};

const MODULE_MAP: Record<string, ModuleInfo> = {
  "1-1": {
    name: "Motion & Force",
    moduleKey: "1-1",
    color: "rgba(37, 106, 244, 0.18)",
    nextHref: "/module/1/2",
  },
  "1-2": {
    name: "Energy & Work",
    moduleKey: "1-2",
    color: "rgba(168, 85, 247, 0.18)",
    nextHref: "/module/1/3",
  },
  "1-3": {
    name: "Waves",
    moduleKey: "1-3",
    color: "rgba(20, 184, 166, 0.18)",
    nextHref: null,
  },
};

const FALLBACK_MODULE: ModuleInfo = {
  name: "Unknown Module",
  moduleKey: "1-1",
  color: "rgba(37, 106, 244, 0.18)",
  nextHref: null,
};

/* ── Component ─────────────────────────────────────────────────── */

type SimulationViewProps = {
  trackId: string;
  moduleId: string;
};

export function SimulationView({ trackId, moduleId }: SimulationViewProps) {
  const moduleKey = `${trackId}-${moduleId}`;
  const module = MODULE_MAP[moduleKey] ?? FALLBACK_MODULE;

  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleShowFormula = useCallback(() => {
    // Formula reveal — will be implemented as a bottom sheet
  }, []);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-surface-dark-sunken">
      {/* 3D Canvas (background) */}
      <SimCanvasPlaceholder moduleColor={module.color} />

      {/* Top bar (overlay) */}
      <SimTopBar moduleName={module.name} />

      {/* Main layout: canvas area + side panel */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full h-full pt-[52px]">
        {/* Canvas + playback area */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Spacer for 3D canvas (takes remaining space) */}
          <div className="flex-1" />

          {/* Playback bar */}
          <SimPlaybackBar
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onShowFormula={handleShowFormula}
            nextModuleHref={module.nextHref}
          />

          {/* Mobile control panel */}
          <div className="lg:hidden">
            <SimControlPanel moduleKey={module.moduleKey} />
          </div>
        </div>

        {/* Desktop side panel */}
        <div className="hidden lg:flex h-full">
          <SimControlPanel moduleKey={module.moduleKey} />
        </div>
      </div>
    </div>
  );
}
