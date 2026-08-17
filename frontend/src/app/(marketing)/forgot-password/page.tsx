import type { Metadata } from 'next'
import PasswordResetForm from '@/components/account/PasswordResetForm'

export const metadata: Metadata = {
  title: 'Forgotten Password | ODSArts',
  description: 'Request a link to set a new password for your ODSArts account.',
  robots: { index: false, follow: true },
}

export default function ForgotPasswordPage() {
  return (
    <main className="bg-ivory min-h-screen flex justify-center px-6 md:px-10 pt-32 pb-24">
      <PasswordResetForm mode="request" />
    </main>
  )
}
