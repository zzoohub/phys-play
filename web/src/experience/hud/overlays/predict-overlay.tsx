import { useState } from 'react'
import { useCoreLoopStore } from '#/platform/stores/core-loop.ts'
import type { PredictionData, Vec3Tuple } from '#/platform/types/index.ts'
import { m } from '#/paraglide/messages.js'

export function PredictOverlay() {
  const challenge = useCoreLoopStore((s) => s.challenge)
  const submitPrediction = useCoreLoopStore((s) => s.submitPrediction)
  const skipPrediction = useCoreLoopStore((s) => s.skipPrediction)
  const [selectedOption, setSelectedOption] = useState<string>()

  if (!challenge) return null

  const { predict } = challenge

  const handleSubmit = () => {
    if (!selectedOption && predict.type !== 'trajectory') return

    let prediction: PredictionData

    switch (predict.type) {
      case 'binary':
        prediction = { type: 'binary', choice: selectedOption ?? '' }
        break
      case 'pattern':
        prediction = { type: 'pattern', selectedIndex: predict.options?.indexOf(selectedOption ?? '') ?? 0 }
        break
      case 'placement':
        prediction = { type: 'placement', position: [0, 0, 0] as unknown as Vec3Tuple }
        break
      default:
        prediction = { type: 'trajectory', points: [] }
    }

    submitPrediction(prediction)
  }

  return (
    <div className="absolute inset-x-0 bottom-24 z-20 flex justify-center pointer-events-auto">
      <div className="bg-bg-dark/80 backdrop-blur-xl border border-primary/30 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl">
        {/* Question */}
        <p className="text-white text-lg font-semibold mb-4 leading-relaxed">
          {predict.question}
        </p>

        {/* Options (for binary/pattern predictions) */}
        {predict.options && (
          <div className="flex flex-col gap-2 mb-4">
            {predict.options.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                className={`px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                  selectedOption === option
                    ? 'bg-primary/20 border-primary/50 text-primary border'
                    : 'bg-surface-dark/60 border-border-dark text-slate-300 border hover:border-primary/30'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={skipPrediction}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            {m.common_skip()}
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-full bg-primary text-bg-dark text-sm font-bold hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(13,185,242,0.3)]"
          >
            {m.predict_submit()}
          </button>
        </div>
      </div>
    </div>
  )
}
