'use client'

import HomeStoryBlock from '@/components/lifestyle/HomeStoryBlock'

const HOMES = [
  {
    imageSrc: '/images/lifestyle/ahmedabad.png',
    imageAlt: 'Large framed family portrait in a premium walnut frame above a textured sofa',
    location: 'Ahmedabad, Gujarat',
    spaceName: 'Family Home',
    clientName: 'The Shah Family',
    story: 'A gallery wall built around three generations of memories.',
  },
  {
    imageSrc: '/images/lifestyle/surat.png',
    imageAlt: 'Gallery wall of framed wedding photographs in a luxury hallway',
    location: 'Surat, Gujarat',
    spaceName: 'Wedding Wall',
    clientName: 'Wedding Collection',
    story: 'A custom walnut frame series preserving a once-in-a-lifetime day.',
  },
  {
    imageSrc: '/images/lifestyle/mumbai.png',
    imageAlt: 'Minimalist creative studio workspace with thin black frames',
    location: 'Mumbai, Maharashtra',
    spaceName: 'Studio Space',
    clientName: 'Creative Studio',
    story: 'Minimal black gallery frames designed for a modern workspace.',
  },
]

export default function CustomerHomesSection() {
  return (
    <section className="bg-ivory w-full relative overflow-hidden py-24 md:py-40">
      
      {/* ── Section Header ── */}
      <div className="max-w-7xl mx-auto px-6 mb-24 md:mb-32 text-center flex flex-col items-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] w-12 bg-gold/50" />
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
            Real Spaces
          </span>
          <div className="h-[1px] w-12 bg-gold/50" />
        </div>
        
        <h2 className="font-display text-[clamp(36px,4.5vw,64px)] leading-[1.05] tracking-[-0.02em] text-obsidian mb-6">
          Living With <span className="italic text-walnut">ODSArts</span>
        </h2>
        
        <p className="font-body text-[clamp(15px,1.2vw,17px)] leading-[1.8] text-pewter-dark max-w-xl">
          See how our frames integrate into beautiful homes across the country, transforming blank walls into meaningful galleries.
        </p>
      </div>

      {/* ── Editorial Blocks ── */}
      <div className="w-full">
        {HOMES.map((home, index) => (
          <HomeStoryBlock key={index} {...home} />
        ))}
      </div>

      {/* ── Bottom Elegant Rule ── */}
      <div className="w-full flex justify-center mt-16 md:mt-32">
        <div className="w-[1px] h-24 bg-gradient-to-b from-gold/40 to-transparent" />
      </div>

    </section>
  )
}
