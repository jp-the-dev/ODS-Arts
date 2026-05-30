'use client'
// Global error boundary — required to be a Client Component by Next.js
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <div />
}
