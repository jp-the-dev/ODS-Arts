'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store/auth'
import SocialLoginButton from '@/components/account/SocialLoginButton'
import { ApiValidationError, ApiError } from '@/lib/api/client'

type Mode = 'login' | 'register'

const COPY = {
  login: {
    eyebrow: 'Your Account',
    heading: 'Welcome back.',
    blurb: 'Sign in to see your orders, saved addresses and wishlist.',
    submit: 'Sign in',
    switchPrompt: 'New to ODSArts?',
    switchLabel: 'Create an account',
    switchHref: '/register',
  },
  register: {
    eyebrow: 'Your Account',
    heading: 'Create your account.',
    blurb: 'Keep your orders, addresses and wishlist in one place.',
    submit: 'Create account',
    switchPrompt: 'Already have an account?',
    switchLabel: 'Sign in',
    switchHref: '/login',
  },
} as const

interface Props {
  mode: Mode
  /**
   * Set when the customer has just completed a password reset, read from the
   * query string by the page's Server Component. Passed as a prop rather than
   * read here: useSearchParams() would force this form under Suspense, and an
   * effect would be a setState cascade.
   */
  justReset?: boolean
}

export default function AuthForm({ mode, justReset = false }: Props) {
  const copy = COPY[mode]
  const router = useRouter()
  const { login, register } = useAuth()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Where to go after signing in — e.g. `?next=/checkout`.
   *
   * Read from `window.location` at submit time rather than via
   * `useSearchParams()`, which would force this form under a Suspense boundary
   * and leave the page blank until hydration.
   */
  function redirectTarget(): string {
    if (typeof window === 'undefined') return '/account'

    const next = new URLSearchParams(window.location.search).get('next')

    // Only same-site paths — never redirect to an attacker-supplied host.
    return next && next.startsWith('/') && !next.startsWith('//') ? next : '/account'
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const local: Record<string, string> = {}
    if (mode === 'register' && !form.name.trim()) local.name = 'Please tell us your name'
    if (!form.email.trim()) local.email = 'Email is required'
    if (!form.password) local.password = 'Password is required'
    else if (mode === 'register' && form.password.length < 8)
      local.password = 'Use at least 8 characters'

    if (Object.keys(local).length > 0) {
      setErrors(local)
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'login') await login(form.email, form.password)
      else await register(form.name, form.email, form.password)

      router.push(redirectTarget())
    } catch (error) {
      if (error instanceof ApiValidationError) {
        // Laravel's field errors, including the deliberately generic
        // "credentials do not match" message on login.
        setErrors(
          Object.fromEntries(
            Object.entries(error.errors).map(([key, messages]) => [key, messages[0]])
          )
        )
      } else if (error instanceof ApiError && error.status === 429) {
        setErrors({ form: 'Too many attempts. Please wait a minute and try again.' })
      } else {
        setErrors({ form: 'Something went wrong. Please try again.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClass =
    'w-full bg-transparent border-b border-obsidian/15 focus:border-gold outline-none py-3 font-body text-[14px] text-obsidian placeholder:text-pewter/60 transition-colors'

  return (
    <div className="max-w-md w-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-[1px] w-10 bg-gold/40" />
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">
          {copy.eyebrow}
        </span>
      </div>

      <h1 className="font-display text-[clamp(30px,4vw,44px)] text-obsidian leading-tight mb-4">
        {copy.heading}
      </h1>
      <p className="font-body text-[14px] leading-[1.8] text-pewter-dark mb-10">
        {copy.blurb}
      </p>

      {justReset && (
        <p className="font-body text-[13px] text-obsidian border border-gold/40 bg-gold/5 px-5 py-4 mb-8">
          Your password has been changed. Sign in with the new one.
        </p>
      )}

      <SocialLoginButton next={redirectTarget()} />

      <div className="flex items-center gap-4 my-8">
        <div className="h-[1px] flex-1 bg-obsidian/10" />
        <span className="font-body text-[10px] uppercase tracking-[0.25em] text-pewter">or</span>
        <div className="h-[1px] flex-1 bg-obsidian/10" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
        {mode === 'register' && (
          <div>
            <label htmlFor="name" className="block font-body text-[10px] uppercase tracking-[0.25em] text-pewter mb-1">
              Your name
            </label>
            <input
              id="name" name="name" type="text" autoComplete="name"
              value={form.name} onChange={handleChange}
              placeholder="Priya Mehta" className={fieldClass}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="font-body text-[11px] text-red-700 mt-1.5">{errors.name}</p>}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block font-body text-[10px] uppercase tracking-[0.25em] text-pewter mb-1">
            Email
          </label>
          <input
            id="email" name="email" type="email" autoComplete="email"
            value={form.email} onChange={handleChange}
            placeholder="you@example.com" className={fieldClass}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className="font-body text-[11px] text-red-700 mt-1.5">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block font-body text-[10px] uppercase tracking-[0.25em] text-pewter mb-1">
            Password
          </label>
          <input
            id="password" name="password" type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={form.password} onChange={handleChange}
            placeholder="••••••••" className={fieldClass}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && <p className="font-body text-[11px] text-red-700 mt-1.5">{errors.password}</p>}

          {mode === 'login' && (
            <p className="font-body text-[12px] text-pewter-dark mt-3">
              <Link href="/forgot-password" className="text-obsidian border-b border-gold/50 pb-0.5">
                Forgotten your password?
              </Link>
            </p>
          )}
        </div>

        {errors.form && <p className="font-body text-[12px] text-red-700">{errors.form}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.25em] px-10 py-4 hover:bg-obsidian/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Please wait…' : copy.submit}
        </button>
      </form>

      <p className="font-body text-[13px] text-pewter-dark mt-8">
        {copy.switchPrompt}{' '}
        <Link href={copy.switchHref} className="text-obsidian border-b border-gold/50 pb-0.5">
          {copy.switchLabel}
        </Link>
      </p>
    </div>
  )
}
