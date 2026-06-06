'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { resetPassword } from '@/lib/services/auth'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') ?? ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await resetPassword({ email, token, password, password_confirmation: passwordConfirmation })
      setSuccess(true)
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

  if (!token) {
    return (
      <main className="bg-ivory min-h-screen pt-28 pb-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="font-display-heading text-h3 text-obsidian mb-4">Invalid Reset Link</h1>
          <p className="font-body text-body text-obsidian/60 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/auth/forgot-password"
            className="font-body text-obsidian underline underline-offset-2 hover:text-obsidian/70"
          >
            Request a new reset link
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-ivory min-h-screen pt-28 pb-20">
      <div className="max-w-md mx-auto px-4">
        <h1 className="font-display-heading text-h3 text-obsidian text-center mb-2">Reset Password</h1>
        <p className="font-body text-body text-obsidian/60 text-center mb-10">
          Choose a new password for your account
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-body">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm font-body">
              Password reset successfully.
            </div>
            <Link
              href="/auth/login"
              className="font-body text-obsidian underline underline-offset-2 hover:text-obsidian/70 transition-colors"
            >
              Sign in with your new password
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

            <div>
              <label htmlFor="password" className="block font-body text-label uppercase tracking-label text-obsidian/70 mb-1.5">
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-obsidian/15 bg-ivory text-obsidian font-body focus:outline-none focus:border-obsidian/40 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block font-body text-label uppercase tracking-label text-obsidian/70 mb-1.5">
                Confirm New Password
              </label>
              <input
                id="password_confirmation"
                type="password"
                required
                minLength={8}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full px-4 py-3 border border-obsidian/15 bg-ivory text-obsidian font-body focus:outline-none focus:border-obsidian/40 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-obsidian text-ivory font-body text-label uppercase tracking-label hover:bg-obsidian/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
