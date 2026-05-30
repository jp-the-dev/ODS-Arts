import { BRAND } from '@/constants'

export const SEO_CONFIG = {
  defaultTitle: `${BRAND.name} — ${BRAND.tagline}`,
  titleTemplate: `%s | ${BRAND.name}`,
  description: 'Premium photo frames and wall art. Where memory becomes art.',
  siteUrl: BRAND.url,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BRAND.url,
    siteName: BRAND.name,
  },
  twitter: {
    cardType: 'summary_large_image',
  },
} as const
