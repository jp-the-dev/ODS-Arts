'use client'

// Global error boundary — required to be a Client Component by Next.js.
// This previously rendered an empty <div />, so any runtime error showed the
// customer a blank page with no way back and nothing reported.

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // The digest is the only handle on the server-side stack in production,
    // so it goes to the console where support can ask for it.
    console.error('Unhandled application error', error)
  }, [error])

  return (
    <main className="bg-ivory min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] w-10 bg-gold/40" />
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">
            Something went wrong
          </span>
          <div className="h-[1px] w-10 bg-gold/40" />
        </div>

        <h1 className="font-display text-[clamp(28px,4vw,44px)] text-obsidian leading-tight mb-5">
          That didn&apos;t go to plan.
        </h1>

        <p className="font-body text-[14px] leading-[1.8] text-pewter-dark mb-10">
          A problem stopped this page from loading. Your cart and saved items are
          untouched — try again, and if it keeps happening let us know.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={reset}
            className="bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.25em] px-8 py-4 hover:bg-obsidian/90 transition-colors"
          >
            Try again
          </button>

          <Link
            href="/"
            className="border border-obsidian/25 text-obsidian font-body text-[11px] uppercase tracking-[0.25em] px-8 py-4 hover:border-obsidian transition-colors"
          >
            Back to home
          </Link>
        </div>

        {error.digest && (
          <p className="font-body text-[11px] text-pewter/70 mt-10">
            Reference: <span className="text-pewter-dark">{error.digest}</span>
          </p>
        )}
      </div>
    </main>
  )
}
