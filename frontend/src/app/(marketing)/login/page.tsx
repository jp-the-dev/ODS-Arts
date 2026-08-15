import type { Metadata } from 'next'
import AuthForm from '@/components/account/AuthForm'

export const metadata: Metadata = {
  title: 'Sign In | ODSArts',
  description: 'Sign in to see your ODSArts orders, saved addresses and wishlist.',
  robots: { index: false, follow: true },
}

export default function LoginPage() {
  return (
    <main className="bg-ivory min-h-screen flex justify-center px-6 md:px-10 pt-32 pb-24">
      <AuthForm mode="login" />
    </main>
  )
}
