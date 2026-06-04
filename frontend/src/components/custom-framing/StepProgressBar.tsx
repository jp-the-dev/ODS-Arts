'use client'

import { motion } from 'framer-motion'

const STEP_LABELS = ['Artwork', 'Size', 'Mat', 'Frame', 'Review']

interface StepProgressBarProps {
  currentStep: number
  totalSteps: number
  onStepClick: (step: number) => void
  completedUpTo: number
}

export default function StepProgressBar({
  currentStep,
  totalSteps,
  onStepClick,
  completedUpTo,
}: StepProgressBarProps) {
  const progress = (currentStep - 1) / (totalSteps - 1)

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Step labels */}
      <div className="flex justify-between items-center">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1
          const isActive = stepNum === currentStep
          const isCompleted = stepNum < currentStep
          const isReachable = stepNum <= completedUpTo

          return (
            <button
              key={label}
              type="button"
              onClick={() => isReachable && onStepClick(stepNum)}
              disabled={!isReachable}
              className="font-body uppercase tracking-[0.15em] transition-all duration-300 focus:outline-none"
              style={{
                fontSize: '11px',
                color: isActive ? '#C9A96E' : isCompleted ? 'rgba(245,240,232,0.55)' : 'rgba(245,240,232,0.22)',
                cursor: isReachable ? 'pointer' : 'default',
                fontWeight: isActive ? '500' : '400',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Gold fill track */}
      <div className="relative h-[1.5px] w-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          className="absolute left-0 top-0 bottom-0 origin-left"
          style={{ background: 'linear-gradient(90deg, #C9A96E, #D4B483)', width: '100%' }}
          animate={{ scaleX: progress }}
          initial={{ scaleX: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0, 0, 1] }}
        />
      </div>

      {/* Step counter */}
      <p className="font-body uppercase tracking-[0.22em]" style={{ fontSize: '10px', color: 'rgba(245,240,232,0.28)' }}>
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  )
}
