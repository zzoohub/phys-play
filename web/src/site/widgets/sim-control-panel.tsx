import { useState } from "react";
import { Icon, Slider, Toggle, SegmentedControl } from "#/shared/ui";

type SimControlPanelProps = {
  moduleKey: string;
};

export function SimControlPanel({ moduleKey }: SimControlPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop: Right side panel */}
      <div
        className={[
          "hidden lg:flex flex-col transition-all duration-300 ease-smooth",
          collapsed ? "w-0 overflow-hidden" : "w-[340px]",
        ].join(" ")}
      >
        <div className="flex flex-col h-full glass-card-elevated border-l border-white/5 overflow-y-auto hide-scrollbar">
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-between px-5 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
            aria-label={collapsed ? "Expand panel" : "Collapse panel"}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Controls
            </span>
            <Icon
              name={collapsed ? "chevron_left" : "chevron_right"}
              size="sm"
              className="text-slate-500"
            />
          </button>

          {/* Controls */}
          <div className="flex flex-col gap-5 p-5">
            <ModuleControls moduleKey={moduleKey} />
          </div>
        </div>
      </div>

      {/* Desktop collapse button (visible when collapsed) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 h-12 w-8 items-center justify-center rounded-l-lg bg-surface-dark-raised border border-r-0 border-white/10 cursor-pointer hover:bg-slate-800 transition-colors"
          aria-label="Expand control panel"
        >
          <Icon name="chevron_left" size="sm" className="text-slate-400" />
        </button>
      )}

      {/* Mobile: Bottom sheet */}
      <MobileControlSheet moduleKey={moduleKey} />
    </>
  );
}

/* ── Mobile bottom sheet ───────────────────────────────────────── */

function MobileControlSheet({ moduleKey }: { moduleKey: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={[
        "lg:hidden flex flex-col glass-card-elevated border-t border-white/5",
        "transition-all duration-300 ease-smooth overflow-hidden",
        expanded ? "max-h-[60vh]" : "max-h-48",
      ].join(" ")}
    >
      {/* Drag handle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-center py-2 cursor-pointer"
        aria-label={expanded ? "Collapse controls" : "Expand controls"}
      >
        <div className="w-10 h-1 rounded-full bg-slate-600" />
      </button>

      <div className="flex flex-col gap-4 px-5 pb-5 overflow-y-auto hide-scrollbar">
        <ModuleControls moduleKey={moduleKey} />
      </div>
    </div>
  );
}

/* ── Per-module controls ───────────────────────────────────────── */

function ModuleControls({ moduleKey }: { moduleKey: string }) {
  switch (moduleKey) {
    case "1-1":
      return <MotionForceControls />;
    case "1-2":
      return <EnergyWorkControls />;
    case "1-3":
      return <WavesControls />;
    default:
      return <MotionForceControls />;
  }
}

/* ── Module 1-1: Motion & Force ────────────────────────────────── */

const GRAVITY_OPTIONS = [
  { value: "earth", label: "Earth" },
  { value: "moon", label: "Moon" },
  { value: "zero-g", label: "Zero-G" },
] as const;

function MotionForceControls() {
  const [force, setForce] = useState(50);
  const [friction, setFriction] = useState(0.3);
  const [mass, setMass] = useState(5);
  const [gravity, setGravity] = useState<string>("earth");
  const [frictionOn, setFrictionOn] = useState(true);
  const [showVelocity, setShowVelocity] = useState(false);
  const [showAcceleration, setShowAcceleration] = useState(false);

  return (
    <>
      <Slider
        label="Force magnitude"
        value={force}
        min={0}
        max={200}
        step={1}
        unit="N"
        onChange={setForce}
      />
      <Slider
        label="Friction coefficient"
        value={friction}
        min={0}
        max={1}
        step={0.1}
        onChange={setFriction}
      />
      <Slider
        label="Mass"
        value={mass}
        min={0.1}
        max={100}
        step={0.1}
        unit="kg"
        onChange={setMass}
      />
      <SegmentedControl
        label="Gravity environment"
        value={gravity}
        options={GRAVITY_OPTIONS}
        onChange={setGravity}
      />
      <Toggle label="Friction" checked={frictionOn} onChange={setFrictionOn} />
      <Toggle
        label="Show velocity vector"
        checked={showVelocity}
        onChange={setShowVelocity}
      />
      <Toggle
        label="Show acceleration vector"
        checked={showAcceleration}
        onChange={setShowAcceleration}
      />
    </>
  );
}

/* ── Module 1-2: Energy & Work ─────────────────────────────────── */

const TRACK_PRESETS = [
  { value: "basic-loop", label: "Basic loop" },
  { value: "s-curve", label: "S-curve" },
  { value: "big-hill", label: "Big hill" },
  { value: "custom", label: "Custom" },
] as const;

function EnergyWorkControls() {
  const [trackPreset, setTrackPreset] = useState<string>("basic-loop");
  const [frictionOn, setFrictionOn] = useState(false);
  const [startHeight, setStartHeight] = useState(10);
  const [showEnergyBar, setShowEnergyBar] = useState(true);

  return (
    <>
      <SegmentedControl
        label="Track preset"
        value={trackPreset}
        options={TRACK_PRESETS}
        onChange={setTrackPreset}
      />
      <Toggle label="Friction" checked={frictionOn} onChange={setFrictionOn} />
      <Slider
        label="Starting height"
        value={startHeight}
        min={1}
        max={20}
        step={1}
        unit="m"
        onChange={setStartHeight}
      />
      <Toggle
        label="Energy bar display"
        checked={showEnergyBar}
        onChange={setShowEnergyBar}
      />
    </>
  );
}

/* ── Module 1-3: Waves ─────────────────────────────────────────── */

const SOURCE_COUNT_OPTIONS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
] as const;

function WavesControls() {
  const [amplitude, setAmplitude] = useState(1.0);
  const [wavelength, setWavelength] = useState(3.0);
  const [spacing, setSpacing] = useState(5);
  const [sources, setSources] = useState<string>("1");
  const [superposition, setSuperposition] = useState(false);

  return (
    <>
      <Slider
        label="Amplitude"
        value={amplitude}
        min={0.1}
        max={5.0}
        step={0.1}
        onChange={setAmplitude}
      />
      <Slider
        label="Wavelength"
        value={wavelength}
        min={0.5}
        max={10.0}
        step={0.1}
        onChange={setWavelength}
      />
      <Slider
        label="Dual source spacing"
        value={spacing}
        min={1}
        max={20}
        step={1}
        onChange={setSpacing}
      />
      <SegmentedControl
        label="Number of sources"
        value={sources}
        options={SOURCE_COUNT_OPTIONS}
        onChange={setSources}
      />
      <Toggle
        label="Superposition mode"
        checked={superposition}
        onChange={setSuperposition}
      />
    </>
  );
}
