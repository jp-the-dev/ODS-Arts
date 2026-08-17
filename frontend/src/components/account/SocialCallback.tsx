'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api/client'
import { useAuth } from '@/lib/store/auth'

/** What the API can tell us went wrong, in words a customer can act on. */
const ERRORS: Record<string, string> = {
  cancelled: 'Sign-in was cancelled. Nothing has changed on your account.',
  unavailable: 'Google sign-in is not available right now. Please use your email and password.',
  failed: 'We could not complete sign-in with Google. Please try again.',
  'no-email': 'Google did not share an email address with us, so we cannot match it to an account. Please sign in with your email instead.',
  expired: 'That sign-in link has expired. Please try again.',
}

export default function SocialCallback({ code, error }: { code?: string; error?: string }) {
  const router = useRouter()
  const { adoptToken } = useAuth()
  const [failure, setFailure] = useState<string | null>(error ? (ERRORS[error] ?? ERRORS.failed) : null)

  // The code is single-use: React 19 mounts effects twice in development, and a
  // second exchange would spend a code that has already been redeemed and show
  // a spurious "expired". This guards the effect body, not the state.
  const claimed = useRef(false)

  useEffect(() => {
    if (!code || error || claimed.current) return

    claimed.current = true

    let cancelled = false

    ;(async () => {
      try {
        const data = await apiFetch<{ token: string }>('/auth/social/exchange', {
          method: 'POST',
          body: JSON.stringify({ code }),
          revalidate: false,
        })

        await adoptToken(data.token)

        if (cancelled) return

        // Where they were headed before signing in, stashed by the button.
        let next = '/account'

        try {
          const stored = sessionStorage.getItem('odsarts_social_next')
          sessionStorage.removeItem('odsarts_social_next')

          // Same-site paths only — never bounce to an attacker-supplied host.
          if (stored && stored.startsWith('/') && !stored.startsWith('//')) next = stored
        } catch {
          // Storage unavailable — /account is a fine destination.
        }

        router.replace(next)
      } catch {
        if (!cancelled) setFailure(ERRORS.expired)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [code, error, adoptToken, router])

  if (failure) {
    return (
      <div className="max-w-md w-full text-center">
        <h1 className="font-display text-[clamp(26px,3.5vw,36px)] text-obsidian leading-tight mb-4">
          Sign-in did not complete.
        </h1>
        <p className="font-body text-[14px] leading-[1.8] text-pewter-dark mb-10">{failure}</p>

        <Link
          href="/login"
          className="font-body text-[11px] uppercase tracking-[0.25em] text-obsidian border-b border-gold/50 pb-1"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <p className="font-body text-[13px] text-pewter py-16 text-center">Signing you in…</p>
  )
}
