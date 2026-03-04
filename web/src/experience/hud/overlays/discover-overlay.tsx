import { useState } from 'react'
import { useCoreLoopStore } from '#/platform/stores/core-loop.ts'
import { m } from '#/paraglide/messages.js'

export function DiscoverOverlay() {
  const challenge = useCoreLoopStore((s) => s.challenge)
  const result = useCoreLoopStore((s) => s.result)
  const prediction = useCoreLoopStore((s) => s.prediction)
  const nextChallenge = useCoreLoopStore((s) => s.nextChallenge)
  const exitLab = useCoreLoopStore((s) => s.exitLab)
  const [detailLevel, setDetailLevel] = useState<1 | 2 | 3>(1)

  if (!challenge || !result) return null

  const { discover } = challenge
  const explanations = {
    1: discover.level1,
    2: discover.level2,
    3: discover.level3,
  }

  return (
    <div className="absolute inset-y-0 right-0 z-20 w-[380px] pointer-events-auto">
      <div className="h-full bg-surface-dark/90 backdrop-blur-2xl border-l border-primary/20 flex flex-col shadow-2xl">
        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-primary text-2xl">insights</span>
              <h3 className="text-xl font-bold text-white">{m.discover_title()}</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {explanations[detailLevel]}
            </p>
          </div>

          {/* Detail level tabs */}
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDetailLevel(level)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  detailLevel === level
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-surface-darker text-slate-400 border border-border-dark hover:border-primary/30'
                }`}
              >
                {level === 1 ? m.discover_simple() : level === 2 ? m.discover_detailed() : m.discover_math()}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-3">
            <div className="bg-surface-darker/80 rounded-xl p-4 border border-border-dark">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {m.discover_prediction_label()}
              </span>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="w-6 h-0.5 border-b-2 border-dashed border-primary" />
                <span className="text-sm text-slate-200">
                  {prediction
                    ? prediction.type === 'binary'
                      ? prediction.choice
                      : prediction.type
                    : m.discover_skipped()}
                </span>
              </div>
            </div>

            <div className="bg-surface-darker/80 rounded-xl p-4 border border-amber-500/20">
              <span className="text-xs text-amber-500 font-semibold uppercase tracking-wider">
                {m.discover_result_label()}
              </span>
              <div className="mt-1.5 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{m.discover_max_height()}</span>
                  <span className="text-amber-400 font-medium">{result.maxHeight.toFixed(1)}m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{m.discover_distance()}</span>
                  <span className="text-amber-400 font-medium">{result.totalDistance.toFixed(1)}m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{m.discover_flight_time()}</span>
                  <span className="text-amber-400 font-medium">{result.totalTime.toFixed(2)}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Concepts */}
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {m.discover_related_concepts()}
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {challenge.discover.relatedConcepts.map((concept) => (
                <span
                  key={concept}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="p-6 border-t border-border-dark flex gap-3">
          <button
            onClick={exitLab}
            className="flex-1 px-4 py-3 rounded-xl bg-surface-darker border border-border-dark text-slate-300 text-sm font-medium hover:border-primary/30 transition-colors"
          >
            {m.discover_exit_hub()}
          </button>
          <button
            onClick={nextChallenge}
            className="flex-1 px-4 py-3 rounded-xl bg-primary text-bg-dark text-sm font-bold hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(13,185,242,0.3)] flex items-center justify-center gap-2"
          >
            {m.discover_next_challenge()}
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}
