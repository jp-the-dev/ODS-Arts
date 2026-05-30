// Marketing layout — Navigation + Footer
// Wraps all public-facing pages: /, /collections, /products, /about, etc.
// Server Component (default)

import Navigation from '@/components/layout/Navigation'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation />
      {children}
    </>
  )
}
