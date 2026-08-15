import type { Metadata } from 'next'
import AuthForm from '@/components/account/AuthForm'

export const metadata: Metadata = {
  title: 'Create Account | ODSArts',
  description: 'Create an ODSArts account to keep your orders, addresses and wishlist in one place.',
  robots: { index: false, follow: true },
}

export default function RegisterPage() {
  return (
    <main className="bg-ivory min-h-screen flex justify-center px-6 md:px-10 pt-32 pb-24">
      <AuthForm mode="register" />
    </main>
  )
}
