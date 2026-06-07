import type { Metadata } from 'next'

// Wishlist is user-specific ephemeral state — should NOT be crawled.
export const metadata: Metadata = {
  title: 'Your Wishlist',
  description: 'Frames and art you have saved while browsing ODSArts.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
