import type { Metadata } from 'next'
import PageTransitionWrapper from '@/components/motion/PageTransitionWrapper'
import InspirationGallery from '@/components/sections/InspirationGallery'
import FinalCTASection from '@/components/sections/FinalCTASection'
import Container from '@/components/layout/Container'
import EyebrowLabel from '@/components/ui/EyebrowLabel'

export const metadata: Metadata = {
  title: 'Inspiration Gallery | ODSArts',
  description: 'Explore how ODSArts frames live in the world. Discover curated interiors and styling ideas.',
}

export default function InspirationPage() {
  return (
    <PageTransitionWrapper>
      <main className="flex flex-col min-h-screen bg-ivory">
        
        {/* Minimal Hero Section */}
        <section className="relative w-full pt-40 pb-16 md:pt-48 md:pb-24">
          <Container size="text" className="text-center">
            <div className="flex flex-col items-center justify-center space-y-6">
              <EyebrowLabel color="obsidian">Spaces & Styling</EyebrowLabel>
              <h1 className="font-display text-[clamp(40px,5vw,72px)] leading-[1.05] tracking-tightest text-obsidian">
                Inspiration <span className="italic text-pewter">Gallery</span>
              </h1>
              <p className="font-body text-[clamp(15px,1.2vw,18px)] leading-relaxed text-pewter-dark max-w-xl mx-auto mt-4">
                See how our signature collections integrate into different architectural spaces and interior design aesthetics.
              </p>
            </div>
          </Container>
        </section>

        {/* Filterable Masonry Gallery */}
        <InspirationGallery />

        <FinalCTASection />
      </main>
    </PageTransitionWrapper>
  )
}
