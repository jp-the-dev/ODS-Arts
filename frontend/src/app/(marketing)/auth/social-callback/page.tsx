import type { Metadata } from 'next'
import SocialCallback from '@/components/account/SocialCallback'

export const metadata: Metadata = {
  title: 'Signing You In | ODSArts',
  robots: { index: false, follow: false },
}

/**
 * Where the API sends the browser after a social sign-in.
 *
 * It carries either a one-time `code` to exchange for a token, or an `error`
 * explaining why there is none. Read here in the Server Component and passed
 * down, as with the other auth pages.
 */
export default async function SocialCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>
}) {
  const { code, error } = await searchParams

  return (
    <main className="bg-ivory min-h-screen flex justify-center px-6 md:px-10 pt-32 pb-24">
      <SocialCallback code={code} error={error} />
    </main>
  )
}
