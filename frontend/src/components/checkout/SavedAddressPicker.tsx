'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api/client'
import { authHeaders, useAuth } from '@/lib/store/auth'

export interface SavedAddress {
  id: number
  label: string
  is_default: boolean
  full_name: string
  phone: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
}

/** The subset of the checkout form a saved address can fill. */
export interface AddressFill {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
}

interface Props {
  onSelect: (fill: AddressFill) => void
  /** Called once with the customer's name/email so contact fields prefill too. */
  onIdentify?: (identity: { fullName: string; email: string; phone: string }) => void
}

export function toAddressFill(address: SavedAddress): AddressFill {
  return {
    fullName: address.full_name,
    phone: address.phone,
    addressLine1: address.address_line1,
    addressLine2: address.address_line2 ?? '',
    city: address.city,
    state: address.state,
    pincode: address.postal_code,
  }
}

/**
 * Lets a signed-in customer reuse a saved address instead of retyping it.
 *
 * Renders nothing for guests — checkout must stay usable without an account,
 * so this is an enhancement rather than a gate.
 */
export default function SavedAddressPicker({ onSelect, onIdentify }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth()

  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [selectedId, setSelectedId] = useState<number | 'new' | null>(null)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<SavedAddress[]>('/auth/addresses', {
        headers: authHeaders(),
        revalidate: false,
      })

      const list = data ?? []
      setAddresses(list)

      // Preselect the default so the common case needs no interaction.
      const preferred = list.find((a) => a.is_default) ?? list[0]

      if (preferred) {
        setSelectedId(preferred.id)
        onSelect(toAddressFill(preferred))
      }
    } catch {
      // Offline or a rejected token — checkout still works, just unassisted.
    } finally {
      setLoaded(true)
    }
  }, [onSelect])

  useEffect(() => {
    if (isLoading || !isAuthenticated) return

    let cancelled = false

    ;(async () => {
      if (!cancelled) await load()
    })()

    return () => {
      cancelled = true
    }
  }, [isLoading, isAuthenticated, load])

  // Prefill contact details from the account regardless of saved addresses.
  useEffect(() => {
    if (!user || !onIdentify) return

    onIdentify({
      fullName: user.name,
      email: user.email,
      phone: user.phone ?? '',
    })
  }, [user, onIdentify])

  if (isLoading) return null

  if (!isAuthenticated) {
    return (
      <div className="border border-obsidian/10 bg-ivory-200/40 px-5 py-4">
        <p className="font-body text-[13px] text-pewter-dark">
          <Link href="/login?next=/checkout" className="text-obsidian border-b border-gold/50 pb-0.5">
            Sign in
          </Link>{' '}
          to use a saved address — or just fill the form below, no account needed.
        </p>
      </div>
    )
  }

  if (!loaded || addresses.length === 0) return null

  function choose(address: SavedAddress) {
    setSelectedId(address.id)
    onSelect(toAddressFill(address))
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-body text-[10px] uppercase tracking-[0.25em] text-pewter">
        Use a saved address
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addresses.map((address) => {
          const active = selectedId === address.id

          return (
            <button
              key={address.id}
              type="button"
              onClick={() => choose(address)}
              aria-pressed={active}
              className={`text-left border px-4 py-3 transition-colors ${
                active
                  ? 'border-gold bg-gold/5'
                  : 'border-obsidian/12 hover:border-obsidian/30'
              }`}
            >
              <span className="flex items-center justify-between mb-1.5">
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-pewter">
                  {address.label}
                </span>
                {address.is_default && (
                  <span className="font-body text-[9px] uppercase tracking-[0.16em] text-obsidian bg-gold/20 px-1.5 py-0.5">
                    Default
                  </span>
                )}
              </span>
              <span className="block font-body text-[12.5px] leading-[1.6] text-obsidian">
                {address.full_name}
                <br />
                {address.address_line1}, {address.city} {address.postal_code}
              </span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setSelectedId('new')}
          aria-pressed={selectedId === 'new'}
          className={`text-left border border-dashed px-4 py-3 transition-colors ${
            selectedId === 'new'
              ? 'border-gold bg-gold/5'
              : 'border-obsidian/20 hover:border-obsidian/40'
          }`}
        >
          <span className="font-body text-[12.5px] text-obsidian">Use a different address</span>
          <span className="block font-body text-[11px] text-pewter mt-1">
            Fill the fields below
          </span>
        </button>
      </div>
    </div>
  )
}
