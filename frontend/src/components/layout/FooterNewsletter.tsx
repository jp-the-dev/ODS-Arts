'use client'

import { useState } from 'react'

export default function FooterNewsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    // Simulate API call
    setTimeout(() => {
      setStatus('success')
      setEmail('')
    }, 1000)
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-4 w-full max-w-md"
    >
      <span className="font-body text-[12px] text-pewter shrink-0">
        Stay in the studio.
      </span>
      <div className="relative flex-1 w-full flex items-center border-b border-gold/40 focus-within:border-gold transition-colors">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-transparent font-body text-[13px] text-ivory placeholder:text-pewter/50 focus:outline-none py-2 pr-8"
          disabled={status === 'loading' || status === 'success'}
        />
        <button 
          type="submit" 
          disabled={status === 'loading' || status === 'success'}
          className="absolute right-0 text-gold hover:text-ivory transition-colors disabled:opacity-50"
        >
          {status === 'success' ? '✓' : '→'}
        </button>
      </div>
    </form>
  )
}
