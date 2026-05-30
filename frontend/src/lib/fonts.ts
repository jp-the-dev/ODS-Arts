// next/font/google instances — single source of truth for all fonts
// Imported ONLY in app/layout.tsx to apply CSS variables to <html>
// Reference: agents/04-typography.md → Next.js Integration

import {
  Cormorant,
  Cormorant_Garamond,
  Cormorant_Infant,
  Cormorant_SC,
  Jost,
} from 'next/font/google'

export const cormorant = Cormorant({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
})

export const cormorantInfant = Cormorant_Infant({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant-infant',
  display: 'swap',
})

export const cormorantSC = Cormorant_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-cormorant-sc',
  display: 'swap',
})

export const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
})
