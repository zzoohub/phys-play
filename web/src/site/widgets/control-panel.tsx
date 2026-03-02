import { useState } from 'react'
import { useLang } from '#/shared/stores'
import { t } from '#/shared/constants'
import { Slider, Toggle, SegmentedControl } from '#/shared/ui'
import type { GravityEnvironment } from '#/shared/types'

interface ControlPanelProps {
  moduleKey: string
  collapsed: boolean
  onToggleCollapse: () => void
}

export function ControlPanel({ moduleKey, collapsed, onToggleCollapse }: ControlPanelProps) {
  const { lang } = useLang()

  // Module 1-1 state
  const [force, setForce] = useState(50)
  const [frictionCoeff, setFrictionCoeff] = useState(0.3)
  const [mass, setMass] = useState(5)
  const [gravity, setGravity] = useState<GravityEnvironment>('earth')
  const [friction, setFriction] = useState(true)
  const [showVectors, setShowVectors] = useState(false)

  // Module 1-2 state
  const [startingHeight, setStartingHeight] = useState(10)
  const [frictionEnergy, setFrictionEnergy] = useState(false)
  const [showEnergyBar, setShowEnergyBar] = useState(true)

  // Module 1-3 state
  const [amplitude, setAmplitude] = useState(1.0)
  const [wavelength, setWavelength] = useState(3.0)
  const [dualSourceSpacing, setDualSourceSpacing] = useState(5)
  const [superposition, setSuperposition] = useState(false)

  const gravityOptions = [
    { value: 'earth' as const, label: t.earth[lang] },
    { value: 'moon' as const, label: t.moon[lang] },
    { value: 'zero-g' as const, label: t.zeroG[lang] },
  ]

  return (
    <>
      {/* Desktop: right panel */}
      <div
        className={`
          hidden md:flex flex-col
          absolute right-0 top-12 bottom-0 z-10
          bg-slate-950/80 backdrop-blur-xl border-l border-white/[0.06]
          transition-all duration-300 ease-out overflow-hidden
          ${collapsed ? 'w-0 border-l-0' : 'w-[320px]'}
        `}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-w-[320px]">
          {moduleKey === '1-1' && (
            <Module11Controls
              lang={lang}
              force={force} setForce={setForce}
              frictionCoeff={frictionCoeff} setFrictionCoeff={setFrictionCoeff}
              mass={mass} setMass={setMass}
              gravity={gravity} setGravity={setGravity}
              gravityOptions={gravityOptions}
              friction={friction} setFriction={setFriction}
              showVectors={showVectors} setShowVectors={setShowVectors}
            />
          )}
          {moduleKey === '1-2' && (
            <Module12Controls
              lang={lang}
              startingHeight={startingHeight} setStartingHeight={setStartingHeight}
              frictionEnergy={frictionEnergy} setFrictionEnergy={setFrictionEnergy}
              showEnergyBar={showEnergyBar} setShowEnergyBar={setShowEnergyBar}
            />
          )}
          {moduleKey === '1-3' && (
            <Module13Controls
              lang={lang}
              amplitude={amplitude} setAmplitude={setAmplitude}
              wavelength={wavelength} setWavelength={setWavelength}
              dualSourceSpacing={dualSourceSpacing} setDualSourceSpacing={setDualSourceSpacing}
              superposition={superposition} setSuperposition={setSuperposition}
            />
          )}
        </div>
      </div>

      {/* Collapse toggle (desktop) */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className={`
          hidden md:flex absolute z-20 top-1/2 -translate-y-1/2
          h-12 w-5 items-center justify-center rounded-l-md
          bg-slate-900/80 border border-r-0 border-white/[0.06]
          text-slate-500 hover:text-white transition-all cursor-pointer
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400
          ${collapsed ? 'right-0' : 'right-[320px]'}
        `}
        aria-label={collapsed ? 'Expand controls' : 'Collapse controls'}
      >
        <svg className={`h-3 w-3 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Mobile: bottom sheet */}
      <div
        className={`
          md:hidden absolute left-0 right-0 bottom-0 z-10
          bg-slate-950/90 backdrop-blur-xl border-t border-white/[0.06]
          transition-all duration-300 ease-out overflow-hidden
          ${collapsed ? 'max-h-0 border-t-0' : 'max-h-[45vh]'}
        `}
      >
        {/* Drag handle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full flex justify-center py-2 cursor-pointer"
          aria-label={collapsed ? 'Expand controls' : 'Collapse controls'}
        >
          <div className="h-1 w-8 rounded-full bg-slate-600" />
        </button>

        <div className="overflow-y-auto px-4 pb-4 space-y-3 max-h-[calc(45vh-32px)]">
          {moduleKey === '1-1' && (
            <Module11Controls
              lang={lang}
              force={force} setForce={setForce}
              frictionCoeff={frictionCoeff} setFrictionCoeff={setFrictionCoeff}
              mass={mass} setMass={setMass}
              gravity={gravity} setGravity={setGravity}
              gravityOptions={gravityOptions}
              friction={friction} setFriction={setFriction}
              showVectors={showVectors} setShowVectors={setShowVectors}
            />
          )}
          {moduleKey === '1-2' && (
            <Module12Controls
              lang={lang}
              startingHeight={startingHeight} setStartingHeight={setStartingHeight}
              frictionEnergy={frictionEnergy} setFrictionEnergy={setFrictionEnergy}
              showEnergyBar={showEnergyBar} setShowEnergyBar={setShowEnergyBar}
            />
          )}
          {moduleKey === '1-3' && (
            <Module13Controls
              lang={lang}
              amplitude={amplitude} setAmplitude={setAmplitude}
              wavelength={wavelength} setWavelength={setWavelength}
              dualSourceSpacing={dualSourceSpacing} setDualSourceSpacing={setDualSourceSpacing}
              superposition={superposition} setSuperposition={setSuperposition}
            />
          )}
        </div>
      </div>

      {/* Mobile collapse toggle (when collapsed) */}
      {collapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="md:hidden absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex h-8 items-center gap-1.5 rounded-full bg-slate-900/80 border border-white/[0.06] px-3 text-xs text-slate-400 hover:text-white transition-all cursor-pointer"
          aria-label="Show controls"
        >
          <svg className="h-3 w-3 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
          Controls
        </button>
      )}
    </>
  )
}

/* Per-module control groups */

interface Module11Props {
  lang: 'en' | 'ko'
  force: number; setForce: (v: number) => void
  frictionCoeff: number; setFrictionCoeff: (v: number) => void
  mass: number; setMass: (v: number) => void
  gravity: GravityEnvironment; setGravity: (v: GravityEnvironment) => void
  gravityOptions: { value: GravityEnvironment; label: string }[]
  friction: boolean; setFriction: (v: boolean) => void
  showVectors: boolean; setShowVectors: (v: boolean) => void
}

function Module11Controls(props: Module11Props) {
  const { lang } = props
  return (
    <>
      <Slider label={t.forceMagnitude[lang]} value={props.force} min={0} max={200} step={1} unit="N" onChange={props.setForce} />
      <Slider label={t.frictionCoefficient[lang]} value={props.frictionCoeff} min={0} max={1} step={0.05} unit="" onChange={props.setFrictionCoeff} />
      <Slider label={t.mass[lang]} value={props.mass} min={0.1} max={100} step={0.1} unit="kg" onChange={props.setMass} />
      <SegmentedControl label={t.gravity[lang]} options={props.gravityOptions} value={props.gravity} onChange={props.setGravity} />
      <Toggle label={t.friction[lang]} checked={props.friction} onChange={props.setFriction} />
      <Toggle label={t.showVectors[lang]} checked={props.showVectors} onChange={props.setShowVectors} />
    </>
  )
}

interface Module12Props {
  lang: 'en' | 'ko'
  startingHeight: number; setStartingHeight: (v: number) => void
  frictionEnergy: boolean; setFrictionEnergy: (v: boolean) => void
  showEnergyBar: boolean; setShowEnergyBar: (v: boolean) => void
}

function Module12Controls(props: Module12Props) {
  const { lang } = props
  return (
    <>
      <SegmentedControl
        label={lang === 'en' ? 'Track preset' : '트랙 프리셋'}
        options={[
          { value: 'loop', label: lang === 'en' ? 'Basic loop' : '기본 루프' },
          { value: 's-curve', label: lang === 'en' ? 'S-curve' : 'S-커브' },
          { value: 'big-hill', label: lang === 'en' ? 'Big hill' : '큰 언덕' },
        ]}
        value="loop"
        onChange={() => {}}
      />
      <Slider
        label={lang === 'en' ? 'Starting height' : '시작 높이'}
        value={props.startingHeight} min={1} max={20} step={0.5} unit="m"
        onChange={props.setStartingHeight}
      />
      <Toggle label={t.friction[lang]} checked={props.frictionEnergy} onChange={props.setFrictionEnergy} />
      <Toggle
        label={lang === 'en' ? 'Energy bar' : '에너지 바'}
        checked={props.showEnergyBar} onChange={props.setShowEnergyBar}
      />
    </>
  )
}

interface Module13Props {
  lang: 'en' | 'ko'
  amplitude: number; setAmplitude: (v: number) => void
  wavelength: number; setWavelength: (v: number) => void
  dualSourceSpacing: number; setDualSourceSpacing: (v: number) => void
  superposition: boolean; setSuperposition: (v: boolean) => void
}

function Module13Controls(props: Module13Props) {
  const { lang } = props
  return (
    <>
      <Slider
        label={lang === 'en' ? 'Amplitude' : '진폭'}
        value={props.amplitude} min={0.1} max={5} step={0.1} unit=""
        onChange={props.setAmplitude}
      />
      <Slider
        label={lang === 'en' ? 'Wavelength' : '파장'}
        value={props.wavelength} min={0.5} max={10} step={0.1} unit=""
        onChange={props.setWavelength}
      />
      <Slider
        label={lang === 'en' ? 'Source spacing' : '파원 간격'}
        value={props.dualSourceSpacing} min={1} max={20} step={1} unit=""
        onChange={props.setDualSourceSpacing}
      />
      <SegmentedControl
        label={lang === 'en' ? 'Sources' : '파원 수'}
        options={[
          { value: '1', label: '1' },
          { value: '2', label: '2' },
        ]}
        value="1"
        onChange={() => {}}
      />
      <Toggle
        label={lang === 'en' ? 'Superposition' : '중첩 모드'}
        checked={props.superposition} onChange={props.setSuperposition}
      />
    </>
  )
}
