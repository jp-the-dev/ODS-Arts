import type { Metadata } from 'next'
import PasswordResetForm from '@/components/account/PasswordResetForm'

export const metadata: Metadata = {
  title: 'Set A New Password | ODSArts',
  description: 'Choose a new password for your ODSArts account.',
  robots: { index: false, follow: false },
}

/** The emailed link carries `?token=…&email=…`; read here so the form need not. */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>
}) {
  const { token, email } = await searchParams

  return (
    <main className="bg-ivory min-h-screen flex justify-center px-6 md:px-10 pt-32 pb-24">
      <PasswordResetForm mode="reset" token={token} initialEmail={email} />
    </main>
  )
}
