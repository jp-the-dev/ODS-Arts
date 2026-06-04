// Custom Framing — /custom-framing
// Server Component shell
import type { Metadata } from 'next'
import CustomFramingWizard from '@/components/custom-framing/CustomFramingWizard'

export const metadata: Metadata = {
  title: 'Custom Framing',
  description:
    'Commission a bespoke frame crafted exactly to your specifications. Upload your artwork, choose your size, mat, and frame material — then request a quote from our studio.',
}

export default function CustomFramingPage() {
  return (
    <main>
      {/* Immersive dark configurator — no nav chrome inside */}
      <CustomFramingWizard />
    </main>
  )
}
