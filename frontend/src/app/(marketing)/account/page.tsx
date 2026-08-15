import type { Metadata } from 'next'
import AccountDashboard from '@/components/account/AccountDashboard'

export const metadata: Metadata = {
  title: 'Your Account | ODSArts',
  description: 'Your ODSArts orders, saved addresses and account details.',
  // Private to the customer — never index.
  robots: { index: false, follow: false },
}

export default function AccountPage() {
  return (
    <main className="bg-ivory min-h-screen px-6 md:px-10 pt-32 pb-24">
      <AccountDashboard />
    </main>
  )
}
