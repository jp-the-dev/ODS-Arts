'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const STEPS = [
  {
    number: '01',
    title: 'Material Selection',
    description: 'We source only premium, sustainably harvested hardwoods. Each plank is inspected for grain character and structural integrity before it ever touches a saw.',
  },
  {
    number: '02',
    title: 'Precision Cutting',
    description: 'Using a blend of traditional joinery and modern precision tools, each length of molding is cut to museum-standard tolerances for a perfect, seamless mitre joint.',
  },
  {
    number: '03',
    title: 'Hand Finishing',
    description: "Every frame is sanded through progressive grits and finished by hand. Whether it's a natural wax polish on walnut or hand-gilded gold leaf, the touch is entirely human.",
  },
  {
    number: '04',
    title: 'Final Inspection',
    description: 'Fitted with UV-protective museum glass and acid-free archival matting, the frame is rigorously inspected under daylight bulbs before it is signed off for delivery.',
  },
]

export default function CraftsmanshipSection() {
  const imageContainerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: imageContainerRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], [-80, 80])

  // Direct DOM reveal refs — no React state, no timing issues
  const titleRef = useScrollReveal({ threshold: 0.15 })
  const step0Ref = useScrollReveal<HTMLDivElement>({ threshold: 0.08, delay: 0 })
  const step1Ref = useScrollReveal<HTMLDivElement>({ threshold: 0.08, delay: 100 })
  const step2Ref = useScrollReveal<HTMLDivElement>({ threshold: 0.08, delay: 200 })
  const step3Ref = useScrollReveal<HTMLDivElement>({ threshold: 0.08, delay: 300 })

  const stepRefs = [step0Ref, step1Ref, step2Ref, step3Ref]

  return (
    <section className="bg-ivory w-full relative pt-12 pb-32 md:pb-48">
      
      {/* ── 1. The Large Workshop Image ── */}
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mb-24 md:mb-40">
        <div 
          ref={imageContainerRef}
          className="relative w-full aspect-[4/3] md:aspect-[21/9] overflow-hidden bg-obsidian"
        >
          <motion.div 
            style={{ y: imageY }}
            className="absolute -inset-[10%] w-[120%] h-[120%] will-change-transform"
          >
            <Image
              src="/images/craft/workshop.png"
              alt="An artisan's wood workshop desk with premium walnut shavings and tools"
              fill
              sizes="100vw"
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-obsidian/10" />
          </motion.div>
        </div>
      </div>

      {/* ── 2. The Narrative Title ── */}
      <div 
        ref={titleRef}
        className="max-w-4xl mx-auto px-6 text-center mb-24 md:mb-32"
      >
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] w-16 bg-gold/50" />
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
            Our Process
          </span>
          <div className="h-[1px] w-16 bg-gold/50" />
        </div>
        
        <h2 className="font-display text-[clamp(40px,5vw,72px)] leading-[1.05] tracking-[-0.02em] text-obsidian mb-8">
          The Art of <span className="italic text-walnut">Craftsmanship</span>
        </h2>
        
        <p className="font-body text-[clamp(15px,1.2vw,18px)] leading-[1.8] text-pewter-dark max-w-2xl mx-auto">
          We don&apos;t mass-produce. Every frame that leaves our studio is the result of meticulous human touch, blending centuries-old joinery techniques with modern archival standards.
        </p>
      </div>

      {/* ── 3. The 4 Steps (Editorial Layout) ── */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-20 gap-x-16 lg:gap-x-32">
          {STEPS.map((step, index) => (
            <div 
              key={step.number}
              ref={stepRefs[index]}
              className={`flex flex-col ${index % 2 === 1 ? 'md:mt-32' : ''}`}
            >
              <div className="flex items-end gap-6 mb-8 border-b border-gold/20 pb-6">
                <span className="font-display text-[64px] leading-[0.75] text-gold/30 select-none">
                  {step.number}
                </span>
                <h3 className="font-display text-[28px] leading-[1.1] text-obsidian">
                  {step.title}
                </h3>
              </div>
              <p className="font-body text-[15px] leading-[1.8] text-pewter-dark max-w-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}
