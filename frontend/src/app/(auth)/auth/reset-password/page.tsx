'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      setTimeout(() => router.replace('/auth/login'), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <h1 className="font-display text-3xl text-obsidian mb-4">Invalid Reset Link</h1>
          <p className="font-body text-[13px] text-obsidian/55 mb-8">This password reset link is invalid or has expired.</p>
          <Link href="/auth/forgot-password" className="font-body text-[11px] uppercase tracking-[0.2em] text-obsidian underline underline-offset-2 hover:text-gold transition-colors">
            Request a new reset link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-obsidian">
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9 }}
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden"
      >
        <Image src="/images/hero/hero-main.jpg" alt="ODSArts" fill priority className="object-cover scale-105" sizes="55vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-obsidian/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/20" />
        <div className="relative z-10 flex flex-col justify-between p-12 h-full w-full">
          <Link href="/" className="font-display text-2xl text-ivory tracking-[0.12em] hover:text-gold transition-colors">ODSArts</Link>
          <div className="max-w-sm">
            <div className="w-8 h-[1px] bg-gold mb-6" />
            <h2 className="font-display text-[clamp(20px,2vw,28px)] text-ivory leading-[1.5] italic">
              "Your journey with timeless art starts fresh today."
            </h2>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col min-h-screen bg-ivory overflow-y-auto"
      >
        <div className="flex items-center justify-between px-8 pt-8 pb-4 lg:px-12 lg:pt-12">
          <Link href="/" className="font-display text-xl text-obsidian tracking-[0.1em] hover:text-gold transition-colors lg:hidden">ODSArts</Link>
          <Link href="/auth/login" className="ml-auto flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-obsidian/50 hover:text-obsidian transition-colors group">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
              <path d="M13 7H1M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to sign in
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12 lg:px-16">
          <div className="w-full max-w-[400px]">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M4 12l5 5 11-11" stroke="#C9A96E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="font-display text-3xl text-obsidian mb-2">Password reset!</h2>
                  <p className="font-body text-[13px] text-obsidian/55 mb-6">Redirecting you to sign in…</p>
                  <div className="w-32 h-[2px] bg-obsidian/10 rounded overflow-hidden">
                    <motion.div className="h-full bg-gold" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.3, ease: 'linear' }} />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
                  <div className="mb-9">
                    <p className="font-body text-[10px] uppercase tracking-[0.35em] text-gold mb-2">Secure reset</p>
                    <h1 className="font-display text-[clamp(32px,4vw,44px)] text-obsidian leading-tight mb-2">New password</h1>
                    <p className="font-body text-[13px] text-obsidian/50">Choose a strong password for your account.</p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                          </svg>
                          <p className="font-body text-[13px]">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                      { id: 'email', label: 'Email address', type: 'email', value: email, setter: setEmail, placeholder: 'you@example.com' },
                      { id: 'password', label: 'New Password', type: 'password', value: password, setter: setPassword, placeholder: 'Min. 8 characters', min: 8 },
                      { id: 'password_confirmation', label: 'Confirm Password', type: 'password', value: passwordConfirmation, setter: setPasswordConfirmation, placeholder: 'Repeat your password', min: 8 },
                    ].map(({ id, label, type, value, setter, placeholder }) => (
                      <div key={id} className="flex flex-col gap-1.5">
                        <label htmlFor={id} className="font-body text-[10px] uppercase tracking-[0.22em] text-obsidian/60">{label}</label>
                        <input
                          id={id}
                          type={type}
                          required
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          placeholder={placeholder}
                          className="w-full px-4 py-3.5 bg-transparent border border-obsidian/20 text-obsidian font-body text-sm placeholder:text-obsidian/25 focus:outline-none focus:border-obsidian/60 hover:border-obsidian/35 transition-colors"
                        />
                      </div>
                    ))}

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileTap={{ scale: 0.985 }}
                      className="relative w-full py-4 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.22em] flex items-center justify-center overflow-hidden group disabled:opacity-60 mt-2"
                    >
                      <span className="absolute inset-0 bg-walnut translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0,0,1)]" />
                      <span className="relative">{submitting ? 'Resetting…' : 'Reset Password'}</span>
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
