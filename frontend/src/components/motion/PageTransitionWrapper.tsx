'use client'

/**
 * PageTransitionWrapper
 *
 * WHY THIS EXISTS:
 * Next.js App Router uses client-side navigation — it does NOT unmount/remount
 * page components when you navigate between routes. This means Framer Motion
 * animations that fired on mount (initial/animate) or whileInView (which
 * tracks IntersectionObserver state) will NOT re-fire when the user navigates
 * away and returns.
 *
 * FIX: By keying this wrapper on `usePathname()`, React treats every route
 * change as a full remount of the page tree underneath. Framer Motion's
 * internal animation state is reset, IntersectionObserver subscriptions are
 * fresh, and all scroll-triggered animations work correctly again.
 *
 * This is the same principle used by the Hero section's CSS-only animation
 * approach — just applied at the page level via React's key reconciliation.
 */

import { usePathname } from 'next/navigation'

export default function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div key={pathname}>
      {children}
    </div>
  )
}
