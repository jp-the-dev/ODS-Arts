'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ANIMATIONS } from '@/lib/config/animations'
import StepProgressBar from '@/components/custom-framing/StepProgressBar'
import FramePreview from '@/components/custom-framing/FramePreview'
import Step1Artwork from '@/components/custom-framing/steps/Step1Artwork'
import Step2Size from '@/components/custom-framing/steps/Step2Size'
import Step3Mat from '@/components/custom-framing/steps/Step3Mat'
import Step4Frame from '@/components/custom-framing/steps/Step4Frame'
import Step5Review from '@/components/custom-framing/steps/Step5Review'
import type { FramingConfig } from '@/components/custom-framing/types'
import { INITIAL_FRAMING_CONFIG } from '@/components/custom-framing/types'

// Re-export so any existing imports don't break
export type { FramingConfig }

const TOTAL_STEPS = 5

// Slide direction variants
const slideVariants = (direction: 1 | -1) => ({
  initial: { x: direction * 60, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.55, ease: ANIMATIONS.ease.luxury } },
  exit: { x: direction * -60, opacity: 0, transition: { duration: 0.35, ease: ANIMATIONS.ease.luxury } },
})

export default function CustomFramingWizard() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [highestStep, setHighestStep] = useState(1)
  const [config, setConfig] = useState<FramingConfig>(INITIAL_FRAMING_CONFIG)
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1)
    setStep(next)
    if (next > highestStep) setHighestStep(next)
    // Scroll right panel to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function patchArtwork(updates: Partial<FramingConfig['artwork']>) {
    setConfig((c) => ({ ...c, artwork: { ...c.artwork, ...updates } }))
  }
  function patchSize(updates: Partial<FramingConfig['size']>) {
    setConfig((c) => ({ ...c, size: { ...c.size, ...updates } }))
  }
  function patchMat(updates: Partial<FramingConfig['mat']>) {
    setConfig((c) => ({ ...c, mat: { ...c.mat, ...updates } }))
  }
  function patchFrame(updates: Partial<FramingConfig['frame']>) {
    setConfig((c) => ({ ...c, frame: { ...c.frame, ...updates } }))
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: '#1C1916' }}>

      {/* ── LEFT: Live Frame Preview ──────────────────────────────────────── */}
      <div
        className="lg:sticky lg:top-0 lg:h-screen lg:w-[45%] flex-shrink-0 flex items-center justify-center order-2 lg:order-1"
        style={{ background: '#141210', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <FramePreview config={config} estimatedPrice={estimatedPrice} />
      </div>

      {/* ── RIGHT: Steps ─────────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col order-1 lg:order-2 overflow-hidden"
        style={{ background: '#231F1B' }}
      >
        {/* Progress bar header */}
        <div
          className="px-10 md:px-16 pt-12 pb-7 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <StepProgressBar
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            onStepClick={goTo}
            completedUpTo={highestStep}
          />
        </div>

        {/* Step content — animated */}
        <div className="flex-1 overflow-y-auto px-10 md:px-16 py-12">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={{
                initial: (dir: number) => ({ x: dir * 60, opacity: 0 }),
                animate: { x: 0, opacity: 1, transition: { duration: 0.55, ease: ANIMATIONS.ease.luxury } },
                exit: (dir: number) => ({ x: dir * -60, opacity: 0, transition: { duration: 0.35, ease: ANIMATIONS.ease.luxury } }),
              }}
              initial="initial"
              animate="animate"
              exit="exit"
              className="max-w-lg"
            >
              {step === 1 && (
                <Step1Artwork config={config} onChange={patchArtwork} onNext={() => goTo(2)} />
              )}
              {step === 2 && (
                <Step2Size config={config} onChange={patchSize} onNext={() => goTo(3)} onBack={() => goTo(1)} />
              )}
              {step === 3 && (
                <Step3Mat config={config} onChange={patchMat} onNext={() => goTo(4)} onBack={() => goTo(2)} />
              )}
              {step === 4 && (
                <Step4Frame config={config} onChange={patchFrame} onPriceChange={setEstimatedPrice} onNext={() => goTo(5)} onBack={() => goTo(3)} sizePreset={config.size.preset ?? 'custom'} />
              )}
              {step === 5 && (
                <Step5Review config={config} estimatedPrice={estimatedPrice} onBack={() => goTo(4)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
