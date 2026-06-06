'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store/auth'

export default function SocialCallbackPage() {
  const { refreshUser, user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  useEffect(() => {
    if (loading) return

    if (user) {
      router.replace('/')
    } else {
      router.replace('/auth/login?error=social-auth-failed')
    }
  }, [user, loading, router])

  return (
    <main className="bg-ivory min-h-screen pt-28 pb-20">
      <div className="max-w-md mx-auto px-4 text-center">
        <h1 className="font-display-heading text-h3 text-obsidian mb-2">Completing sign in...</h1>
        <p className="font-body text-body text-obsidian/60">Please wait while we complete your authentication.</p>
      </div>
    </main>
  )
}
