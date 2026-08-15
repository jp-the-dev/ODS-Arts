import type { Metadata } from 'next'
import {
  cormorant,
  cormorantGaramond,
  cormorantInfant,
  cormorantSC,
  jost,
} from '@/lib/fonts'
import { BRAND } from '@/constants'
import { AuthProvider } from '@/lib/store/auth'
import { CartProvider } from '@/lib/store/cart'
import { WishlistProvider } from '@/lib/store/wishlist'
import { QuickViewProvider } from '@/providers/QuickViewProvider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: `%s | ${BRAND.name}`,
    default: `${BRAND.name} — ${BRAND.tagline}`,
  },
  description: 'Premium photo frames and wall art. Where memory becomes art.',
  metadataBase: new URL(BRAND.url),
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: 'Premium photo frames and wall art.',
    url: BRAND.url,
    siteName: BRAND.name,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: BRAND.name,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: 'Premium photo frames and wall art.',
    images: ['/opengraph-image'],
  },
}

// JSON-LD: Organization structured data
const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BRAND.name,
  url: BRAND.url,
  logo: `${BRAND.url}/logo.png`,
  description: 'Handcrafted premium photo frames and original wall art prints, made to order in India.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: BRAND.email,
    contactType: 'customer service',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    BRAND.instagram,
    BRAND.pinterest,
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`
        ${cormorant.variable}
        ${cormorantGaramond.variable}
        ${cormorantInfant.variable}
        ${cormorantSC.variable}
        ${jost.variable}
      `}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-obsidian text-ivory selection:bg-gold/30">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <QuickViewProvider>
              {children}
              </QuickViewProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
