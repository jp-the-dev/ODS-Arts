'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch, ApiError, ApiValidationError } from '@/lib/api/client'

type Mode = 'request' | 'reset'

const COPY = {
  request: {
    eyebrow: 'Your Account',
    heading: 'Forgotten your password?',
    blurb: 'Give us the email on your account and we will send a link to set a new password.',
    submit: 'Send reset link',
  },
  reset: {
    eyebrow: 'Your Account',
    heading: 'Choose a new password.',
    blurb: 'Pick something you have not used elsewhere. Signing in again everywhere else will be required.',
    submit: 'Set new password',
  },
} as const

const fieldClass =
  'w-full bg-transparent border-b border-obsidian/15 focus:border-gold outline-none py-3 font-body text-[14px] text-obsidian placeholder:text-pewter/60 transition-colors'

interface Props {
  mode: Mode
  /**
   * Both arrive from the emailed link's query string, read by the page's Server
   * Component and passed down.
   *
   * Reading them here instead would mean either `useSearchParams()`, which
   * forces this form under a Suspense boundary, or `window.location` in an
   * effect, which is a setState-in-effect cascade. Props avoid both.
   */
  token?: string
  initialEmail?: string
}

export default function PasswordResetForm({ mode, token = '', initialEmail = '' }: Props) {
  const copy = COPY[mode]
  const router = useRouter()

  const [form, setForm] = useState({
    email: initialEmail,
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const local: Record<string, string> = {}
    if (!form.email.trim()) local.email = 'Email is required'

    if (mode === 'reset') {
      if (!form.password) local.password = 'Password is required'
      else if (form.password.length < 8) local.password = 'Use at least 8 characters'
      else if (form.password !== form.password_confirmation)
        local.password_confirmation = 'The two passwords do not match'
    }

    if (Object.keys(local).length > 0) {
      setErrors(local)

      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'request') {
        await apiFetch('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: form.email }),
          revalidate: false,
        })

        // The API answers the same way whether or not the address is
        // registered, so that this page cannot be used to discover who has an
        // account. Say the same thing back rather than implying a match.
        setSent(true)
      } else {
        await apiFetch('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({
            token,
            email: form.email,
            password: form.password,
            password_confirmation: form.password_confirmation,
          }),
          revalidate: false,
        })

        // A reset revokes every existing token server-side, so there is no
        // session to keep — send them to sign in with the new password.
        router.push('/login?reset=1')
      }
    } catch (error) {
      if (error instanceof ApiValidationError) {
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

  if (mode === 'request' && sent) {
    return (
      <div className="max-w-md w-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-[1px] w-10 bg-gold/40" />
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">
            Check your inbox
          </span>
        </div>

        <h1 className="font-display text-[clamp(30px,4vw,44px)] text-obsidian leading-tight mb-4">
          On its way.
        </h1>
        <p className="font-body text-[14px] leading-[1.8] text-pewter-dark mb-10">
          If <span className="text-obsidian">{form.email}</span> is registered with us, a link to set
          a new password is in your inbox. It expires in an hour.
        </p>

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
      <p className="font-body text-[14px] leading-[1.8] text-pewter-dark mb-10">{copy.blurb}</p>

      {/* A reset link with no token cannot work, and the reason is worth saying
          plainly — otherwise the form fails on submit for no visible reason. */}
      {mode === 'reset' && token === '' && (
        <p className="font-body text-[12px] text-red-700 mb-8">
          This reset link is incomplete. Request a new one from{' '}
          <Link href="/forgot-password" className="text-obsidian border-b border-gold/50">
            forgotten password
          </Link>
          .
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
        <div>
          <label
            htmlFor="email"
            className="block font-body text-[10px] uppercase tracking-[0.25em] text-pewter mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={fieldClass}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <p className="font-body text-[11px] text-red-700 mt-1.5">{errors.email}</p>
          )}
        </div>

        {mode === 'reset' && (
          <>
            <div>
              <label
                htmlFor="password"
                className="block font-body text-[10px] uppercase tracking-[0.25em] text-pewter mb-1"
              >
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={fieldClass}
                aria-invalid={Boolean(errors.password)}
              />
              {errors.password && (
                <p className="font-body text-[11px] text-red-700 mt-1.5">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password_confirmation"
                className="block font-body text-[10px] uppercase tracking-[0.25em] text-pewter mb-1"
              >
                Confirm new password
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="••••••••"
                className={fieldClass}
                aria-invalid={Boolean(errors.password_confirmation)}
              />
              {errors.password_confirmation && (
                <p className="font-body text-[11px] text-red-700 mt-1.5">
                  {errors.password_confirmation}
                </p>
              )}
            </div>
          </>
        )}

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
        Remembered it?{' '}
        <Link href="/login" className="text-obsidian border-b border-gold/50 pb-0.5">
          Sign in
        </Link>
      </p>
    </div>
  )
}
