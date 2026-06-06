'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'
import GuestGuard from '@/components/auth/GuestGuard'
import SocialLoginButton from '@/components/auth/SocialLoginButton'
import { useAuth } from '@/lib/store/auth'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirect') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password })
      router.replace(redirectTo)
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
    <GuestGuard>
      <main className="bg-ivory min-h-screen pt-28 pb-20">
        <div className="max-w-md mx-auto px-4">
          <h1 className="font-display-heading text-h3 text-obsidian text-center mb-2">Sign In</h1>
          <p className="font-body text-body text-obsidian/60 text-center mb-10">
            Welcome back to {process.env.NEXT_PUBLIC_BRAND_NAME ?? 'ODSArts'}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-body">
              {error}
            </div>
          )}

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
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-obsidian/15 bg-ivory text-obsidian font-body focus:outline-none focus:border-obsidian/40 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 font-body text-obsidian/60 cursor-pointer">
                <input type="checkbox" name="remember" className="accent-obsidian" />
                Remember me
              </label>
              <Link
                href="/auth/forgot-password"
                className="font-body text-obsidian/60 hover:text-obsidian underline underline-offset-2 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-obsidian text-ivory font-body text-label uppercase tracking-label hover:bg-obsidian/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-obsidian/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-ivory px-4 font-body text-body text-obsidian/40">OR</span>
            </div>
          </div>

          <SocialLoginButton provider="google" />

          <p className="mt-8 text-center font-body text-body text-obsidian/60">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-obsidian underline underline-offset-2 hover:text-obsidian/70 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </GuestGuard>
  )
}
