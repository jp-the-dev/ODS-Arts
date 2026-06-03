// Marketing layout — Navigation + Footer + Cart
// Wraps all public-facing pages: /, /collections, /products, /about, etc.
// Server Component (default)

import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/layout/CartDrawer'
import FloatingNavigation from '@/components/layout/FloatingNavigation'
import { CartProvider } from '@/lib/store/cart'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <Navigation />
      {children}
      <FloatingNavigation />
      <CartDrawer />
      <Footer />
    </CartProvider>
  )
}
