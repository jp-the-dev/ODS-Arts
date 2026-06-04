// Shop layout — minimal nav for cart + checkout
// Server Component
import Link from 'next/link'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* ── Minimal Shop Nav ── */}
      <header className="bg-ivory border-b border-obsidian/8 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Back to shopping */}
          <Link
            href="/collections"
            className="flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-pewter hover:text-obsidian transition-colors duration-300 group"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            >
              <path
                d="M13 7H1M6 3L2 7l4 4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">Continue Shopping</span>
            <span className="sm:hidden">Back</span>
          </Link>

          {/* Logo */}
          <Link
            href="/"
            className="font-display text-xl tracking-wider text-obsidian hover:text-walnut transition-colors duration-300"
          >
            ODSArts
          </Link>

          {/* Secure badge */}
          <div className="flex items-center gap-1.5 text-pewter">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <path
                d="M6 1L1 3.5v4C1 10.08 3.24 12.82 6 13.5 8.76 12.82 11 10.08 11 7.5v-4L6 1z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-body text-[10px] uppercase tracking-[0.18em] hidden sm:inline">
              Secure
            </span>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">{children}</main>

      {/* ── Minimal shop footer ── */}
      <footer className="border-t border-obsidian/8 py-6 px-6 bg-ivory">
        <p className="text-center font-body text-[10px] uppercase tracking-[0.2em] text-pewter/60">
          © {new Date().getFullYear()} ODSArts · All Rights Reserved
        </p>
      </footer>
    </div>
  )
}
