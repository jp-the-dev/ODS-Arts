'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GuestGuard from '@/components/auth/GuestGuard'
import SocialLoginButton from '@/components/auth/SocialLoginButton'
import { useAuth } from '@/lib/store/auth'

const QUOTES = [
  {
    text: 'Every frame we craft holds not just an image, but the soul of a moment.',
    attribution: 'The ODSArts Studio',
  },
  {
    text: 'Where precision meets passion — museum-quality craftsmanship for memories that matter.',
    attribution: 'Our Master Framers',
  },
  {
    text: 'We believe walls should speak. Let yours tell your story.',
    attribution: 'ODSArts Philosophy',
  },
]

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirect') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const quote = QUOTES[0]

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password })
      setSuccess(true)
      setTimeout(() => router.replace(redirectTo), 900)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <GuestGuard>
      <div className="min-h-screen flex bg-obsidian">

        {/* ── Left Panel: Brand / Art ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0, 0, 1] }}
          className="hidden lg:flex lg:w-[55%] relative overflow-hidden"
        >
          <Image
            src="/images/hero/hero-main.jpg"
            alt="ODSArts — Handcrafted frames"
            fill
            priority
            className="object-cover object-center scale-105"
            sizes="55vw"
          />
          {/* Dark gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-obsidian/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/20" />

          {/* Content over image */}
          <div className="relative z-10 flex flex-col justify-between p-12 h-full w-full">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Link href="/" className="font-display text-2xl text-ivory tracking-[0.12em] hover:text-gold transition-colors duration-300">
                ODSArts
              </Link>
            </motion.div>

            {/* Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0, 0, 1] }}
              className="max-w-sm"
            >
              <div className="w-8 h-[1px] bg-gold mb-6" />
              <blockquote className="font-display text-[clamp(20px,2.2vw,28px)] text-ivory leading-[1.5] mb-6 italic">
                "{quote.text}"
              </blockquote>
              <p className="font-body text-[11px] uppercase tracking-[0.25em] text-gold/80">
                — {quote.attribution}
              </p>

              {/* Decorative dots */}
              <div className="flex gap-2 mt-8">
                {QUOTES.map((_, i) => (
                  <div
                    key={i}
                    className={`h-[2px] transition-all duration-300 ${i === 0 ? 'w-8 bg-gold' : 'w-3 bg-ivory/30'}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Right Panel: Form ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col min-h-screen bg-ivory overflow-y-auto"
        >
          {/* Top bar for mobile logo + back link */}
          <div className="flex items-center justify-between px-8 pt-8 pb-4 lg:px-12 lg:pt-12">
            <Link
              href="/"
              className="font-display text-xl text-obsidian tracking-[0.1em] hover:text-gold transition-colors duration-300 lg:hidden"
            >
              ODSArts
            </Link>
            <Link
              href="/"
              className="ml-auto flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-obsidian/50 hover:text-obsidian transition-colors duration-300 group"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
                <path d="M13 7H1M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to site
            </Link>
          </div>

          {/* Form area */}
          <div className="flex-1 flex items-center justify-center px-8 py-12 lg:px-16">
            <div className="w-full max-w-[400px]">

              <AnimatePresence mode="wait">
                {success ? (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6"
                    >
                      <motion.svg
                        width="28" height="28" viewBox="0 0 24 24" fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <path d="M4 12l5 5 11-11" stroke="#C9A96E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    </motion.div>
                    <h2 className="font-display text-3xl text-obsidian mb-2">Welcome back</h2>
                    <p className="font-body text-sm text-obsidian/60">Redirecting you now…</p>
                    <div className="mt-6 w-32 h-[2px] bg-obsidian/10 rounded overflow-hidden">
                      <motion.div
                        className="h-full bg-gold"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.85, ease: 'linear' }}
                      />
                    </div>
                  </motion.div>
                ) : (
                  /* ── Login form ── */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6, ease: [0.25, 0, 0, 1] }}
                  >
                    {/* Heading */}
                    <div className="mb-9">
                      <p className="font-body text-[10px] uppercase tracking-[0.35em] text-gold mb-2">
                        Welcome back
                      </p>
                      <h1 className="font-display text-[clamp(32px,4vw,44px)] text-obsidian leading-tight mb-2">
                        Sign in
                      </h1>
                      <p className="font-body text-[13px] text-obsidian/50">
                        Don't have an account?{' '}
                        <Link
                          href={`/auth/register${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                          className="text-obsidian underline underline-offset-2 hover:text-gold transition-colors"
                        >
                          Create one
                        </Link>
                      </p>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -8, height: 0 }}
                          className="mb-6 overflow-hidden"
                        >
                          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
                              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/>
                              <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            </svg>
                            <p className="font-body text-[13px] leading-relaxed">{error}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="font-body text-[10px] uppercase tracking-[0.22em] text-obsidian/60">
                          Email address
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-4 py-3.5 bg-transparent border border-obsidian/20 text-obsidian font-body text-sm placeholder:text-obsidian/25 focus:outline-none focus:border-obsidian/60 hover:border-obsidian/35 transition-colors duration-200"
                        />
                      </div>

                      {/* Password */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="password" className="font-body text-[10px] uppercase tracking-[0.22em] text-obsidian/60">
                            Password
                          </label>
                          <Link
                            href="/auth/forgot-password"
                            className="font-body text-[11px] text-obsidian/40 hover:text-obsidian transition-colors underline underline-offset-2"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3.5 pr-12 bg-transparent border border-obsidian/20 text-obsidian font-body text-sm placeholder:text-obsidian/25 focus:outline-none focus:border-obsidian/60 hover:border-obsidian/35 transition-colors duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-obsidian/35 hover:text-obsidian/70 transition-colors"
                          >
                            {showPassword ? (
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M2 2l20 20"/>
                              </svg>
                            ) : (
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Remember me */}
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div className="relative">
                          <input type="checkbox" name="remember" className="sr-only peer" />
                          <div className="w-4 h-4 border border-obsidian/25 peer-checked:bg-obsidian peer-checked:border-obsidian transition-colors group-hover:border-obsidian/50" />
                          <svg
                            width="10" height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            className="absolute inset-0 m-auto opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                          >
                            <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="font-body text-[12px] text-obsidian/55">Remember me</span>
                      </label>

                      {/* Submit button */}
                      <motion.button
                        type="submit"
                        disabled={submitting}
                        whileTap={{ scale: 0.985 }}
                        className="relative w-full py-4 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.22em] flex items-center justify-center gap-3 overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed transition-opacity duration-200 mt-2"
                      >
                        <span className="absolute inset-0 bg-walnut translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0,0,1)]" />
                        <span className="relative flex items-center gap-3">
                          {submitting ? (
                            <>
                              <svg className="animate-spin w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"/>
                              </svg>
                              Signing in…
                            </>
                          ) : (
                            <>
                              Sign In
                              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="opacity-60 group-hover:translate-x-0.5 transition-transform">
                                <path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </>
                          )}
                        </span>
                      </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-obsidian/10" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-ivory px-4 font-body text-[10px] uppercase tracking-[0.2em] text-obsidian/35">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <SocialLoginButton provider="google" />

                    {/* Footer note */}
                    <p className="mt-8 text-center font-body text-[11px] text-obsidian/35 leading-relaxed">
                      By signing in you agree to our{' '}
                      <Link href="/terms" className="underline underline-offset-2 hover:text-obsidian/60 transition-colors">Terms</Link>
                      {' & '}
                      <Link href="/privacy" className="underline underline-offset-2 hover:text-obsidian/60 transition-colors">Privacy Policy</Link>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </GuestGuard>
  )
}
