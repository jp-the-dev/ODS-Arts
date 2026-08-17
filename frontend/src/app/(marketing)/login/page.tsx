import type { Metadata } from 'next'
import AuthForm from '@/components/account/AuthForm'

export const metadata: Metadata = {
  title: 'Sign In | ODSArts',
  description: 'Sign in to see your ODSArts orders, saved addresses and wishlist.',
  robots: { index: false, follow: true },
}

/** A completed password reset redirects here with `?reset=1` so we can say so. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>
}) {
  const { reset } = await searchParams

  return (
    <main className="bg-ivory min-h-screen flex justify-center px-6 md:px-10 pt-32 pb-24">
      <AuthForm mode="login" justReset={reset === '1'} />
    </main>
  )
}
