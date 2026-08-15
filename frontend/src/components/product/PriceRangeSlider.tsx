'use client'

import { useCallback, useRef, useState } from 'react'
import { formatPrice } from '@/lib/types/product'

interface PriceRangeSliderProps {
  minPaise: number
  maxPaise: number
  currentMin: number
  currentMax: number
  onChange: (min: number, max: number) => void
}

export default function PriceRangeSlider({
  minPaise,
  maxPaise,
  currentMin,
  currentMax,
  onChange,
}: PriceRangeSliderProps) {
  const [localMin, setLocalMin] = useState(currentMin)
  const [localMax, setLocalMax] = useState(currentMax)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Re-sync when the props change from outside (e.g. "Clear all"). Adjusted
  // during render rather than in an effect — this is React's documented pattern
  // for derived-from-props state, and avoids the extra render an effect costs.
  const [prevBounds, setPrevBounds] = useState({ min: currentMin, max: currentMax })

  if (prevBounds.min !== currentMin || prevBounds.max !== currentMax) {
    setPrevBounds({ min: currentMin, max: currentMax })
    setLocalMin(currentMin)
    setLocalMax(currentMax)
  }

  const commit = useCallback(
    (min: number, max: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => onChange(min, max), 300)
    },
    [onChange]
  )

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), localMax - 50000)
    setLocalMin(v)
    commit(v, localMax)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), localMin + 50000)
    setLocalMax(v)
    commit(localMin, v)
  }

  // Percentage positions for the gold track fill
  const range = maxPaise - minPaise || 1
  const leftPct  = ((localMin - minPaise) / range) * 100
  const rightPct = ((localMax - minPaise) / range) * 100

  return (
    <div className="flex flex-col gap-4">
      {/* Price labels */}
      <div className="flex items-center justify-between">
        <span
          className="font-body text-[11px] uppercase tracking-[0.15em]"
          style={{ color: 'rgba(139,134,128,0.9)' }}
        >
          {formatPrice(localMin)}
        </span>
        <span
          className="font-body text-[11px] uppercase tracking-[0.15em]"
          style={{ color: 'rgba(139,134,128,0.9)' }}
        >
          {formatPrice(localMax)}
        </span>
      </div>

      {/* Dual range track */}
      <div className="relative h-1 w-full" style={{ background: 'rgba(14,13,11,0.12)' }}>
        {/* Gold filled range */}
        <div
          className="absolute top-0 h-full transition-all duration-100"
          style={{
            left:  `${leftPct}%`,
            width: `${rightPct - leftPct}%`,
            background: 'linear-gradient(90deg, #C9A96E, #D4B483)',
          }}
        />

        {/* Min handle */}
        <input
          type="range"
          min={minPaise}
          max={maxPaise}
          step={50000}
          value={localMin}
          onChange={handleMinChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: localMin > maxPaise - 50000 ? 5 : 3 }}
          aria-label="Minimum price"
        />
        {/* Max handle */}
        <input
          type="range"
          min={minPaise}
          max={maxPaise}
          step={50000}
          value={localMax}
          onChange={handleMaxChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
          aria-label="Maximum price"
        />

        {/* Visual handles */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-gold bg-ivory transition-transform duration-100 hover:scale-110"
          style={{ left: `calc(${leftPct}% - 7px)`, pointerEvents: 'none' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-gold bg-ivory transition-transform duration-100 hover:scale-110"
          style={{ left: `calc(${rightPct}% - 7px)`, pointerEvents: 'none' }}
        />
      </div>
    </div>
  )
}
