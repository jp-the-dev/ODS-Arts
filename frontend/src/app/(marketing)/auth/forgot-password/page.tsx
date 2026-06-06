'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { forgotPassword } from '@/lib/services/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="bg-ivory min-h-screen pt-28 pb-20">
      <div className="max-w-md mx-auto px-4">
        <h1 className="font-display-heading text-h3 text-obsidian text-center mb-2">Forgot Password</h1>
        <p className="font-body text-body text-obsidian/60 text-center mb-10">
          Enter your email and we&apos;ll send you a reset link
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-body">
            {error}
          </div>
        )}

        {sent ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm font-body">
              If an account with that email exists, we&apos;ve sent a password reset link.
            </div>
            <Link
              href="/auth/login"
              className="font-body text-obsidian underline underline-offset-2 hover:text-obsidian/70 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block font-body text-label uppercase tracking-label text-obsidian/70 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-obsidian/15 bg-ivory text-obsidian font-body focus:outline-none focus:border-obsidian/40 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-obsidian text-ivory font-body text-label uppercase tracking-label hover:bg-obsidian/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center font-body text-body text-obsidian/60">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-obsidian underline underline-offset-2 hover:text-obsidian/70 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
