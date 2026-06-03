import type { Metadata } from 'next'
import PageTransitionWrapper from '@/components/motion/PageTransitionWrapper'
import AboutHero from '@/components/hero/AboutHero'
import CraftsmanshipSection from '@/components/sections/CraftsmanshipSection'
import FinalCTASection from '@/components/sections/FinalCTASection'

export const metadata: Metadata = {
  title: 'Craftsmanship | ODSArts',
  description: 'Step inside the ODSArts studio to see how centuries-old woodworking techniques meet modern archival preservation.',
}

export default function AboutPage() {
  return (
    <PageTransitionWrapper>
      <main className="flex flex-col min-h-screen bg-ivory">
        <AboutHero />
        <CraftsmanshipSection />
        <FinalCTASection />
      </main>
    </PageTransitionWrapper>
  )
}
