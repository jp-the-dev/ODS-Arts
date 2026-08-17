'use client'

import { API_BASE_URL } from '@/lib/api/client'

/**
 * Starts the OAuth handshake.
 *
 * A plain link, not a fetch: the provider's consent screen is a full browser
 * navigation and cannot be driven from XHR. `next` is carried through so the
 * customer lands back where they were headed — the callback page reads it.
 */
export default function SocialLoginButton({ next }: { next?: string }) {
  function start() {
    // Remembered across the round trip, because the provider redirects to the
    // API and only the API's own callback URL is registered with Google.
    try {
      if (next) sessionStorage.setItem('odsarts_social_next', next)
      else sessionStorage.removeItem('odsarts_social_next')
    } catch {
      // Private browsing — the customer just lands on /account instead.
    }

    window.location.href = `${API_BASE_URL}/auth/social/google`
  }

  return (
    <button
      type="button"
      onClick={start}
      className="w-full flex items-center justify-center gap-3 border border-obsidian/20 hover:border-obsidian/50 font-body text-[12px] tracking-[0.08em] text-obsidian py-3.5 transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
        <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
      </svg>
      Continue with Google
    </button>
  )
}
