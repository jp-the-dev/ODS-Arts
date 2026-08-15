'use client'

/**
 * ODSArts — Wishlist Store
 *
 * localStorage-first, account-ready pattern.
 *
 * When user accounts go live:
 *   1. Add a `syncWithServer` action calling POST /wishlist/sync
 *   2. useEffect on mount: hydrate from GET /wishlist (if authenticated)
 *   3. The wishlist interface & hook signature remain unchanged
 *
 * Stores product slugs only — lightweight, no stale product data.
 */

import React, {
  createContext, useCallback, useContext,
  useEffect, useReducer, useRef,
} from 'react'
import { apiFetch } from '@/lib/api/client'
import { authHeaders, useAuth } from '@/lib/store/auth'

// ── State ──────────────────────────────────────────────────────────────────────

export type WishlistItemType = 'frame' | 'art'

interface WishlistState {
  slugs: string[]
  /** Which catalogue each slug came from — frames and art have separate tables. */
  types: Record<string, WishlistItemType>
}

// ── Actions ────────────────────────────────────────────────────────────────────

type WishlistAction =
  | { type: 'ADD';     slug: string; itemType: WishlistItemType }
  | { type: 'REMOVE';  slug: string }
  | { type: 'TOGGLE';  slug: string; itemType: WishlistItemType }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; slugs: string[]; types?: Record<string, WishlistItemType> }

// ── Reducer ────────────────────────────────────────────────────────────────────

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'HYDRATE':
      return { slugs: action.slugs, types: { ...state.types, ...(action.types ?? {}) } }
    case 'ADD':
      return state.slugs.includes(action.slug)
        ? state
        : {
            slugs: [...state.slugs, action.slug],
            types: { ...state.types, [action.slug]: action.itemType },
          }
    case 'REMOVE':
      return {
        slugs: state.slugs.filter((s) => s !== action.slug),
        types: state.types,
      }
    case 'TOGGLE':
      return state.slugs.includes(action.slug)
        ? { slugs: state.slugs.filter((s) => s !== action.slug), types: state.types }
        : {
            slugs: [...state.slugs, action.slug],
            types: { ...state.types, [action.slug]: action.itemType },
          }
    case 'CLEAR':
      return { slugs: [], types: {} }
    default:
      return state
  }
}

// ── Context ────────────────────────────────────────────────────────────────────

interface WishlistContextValue {
  slugs: string[]
  count: number
  isInWishlist: (slug: string) => boolean
  addToWishlist: (slug: string, itemType?: WishlistItemType) => void
  removeFromWishlist: (slug: string) => void
  toggleWishlist: (slug: string, itemType?: WishlistItemType) => void
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

const STORAGE_KEY = 'odsarts_wishlist_v1'

// ── Provider ───────────────────────────────────────────────────────────────────

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, { slugs: [], types: {} })

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // v1 stored a bare slug array; v2 stores { slugs, types }.
        if (Array.isArray(parsed)) dispatch({ type: 'HYDRATE', slugs: parsed })
        else dispatch({ type: 'HYDRATE', slugs: parsed.slugs ?? [], types: parsed.types ?? {} })
      }
    } catch { /* ignore corrupt storage */ }
  }, [])

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ slugs: state.slugs, types: state.types }))
    } catch { /* ignore quota errors */ }
  }, [state.slugs, state.types])

  // ── Server sync (signed-in customers only) ─────────────────────────────────
  //
  // The API stores one row per item, so instead of replacing state wholesale this
  // merges the two sets and pushes anything the server is missing. Frames and art
  // both sync now; each push carries its catalogue so the server saves the right one.
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const hasSyncedRef = useRef(false)

  const typesRef = useRef(state.types)
  const slugsRef = useRef(state.slugs)

  // Mirrored in an effect, not during render: React 19 forbids mutating a ref
  // while rendering, and this only needs to be current by the time an effect runs.
  useEffect(() => {
    slugsRef.current = state.slugs
    typesRef.current = state.types
  }, [state.slugs, state.types])

  useEffect(() => {
    if (!isAuthenticated) {
      hasSyncedRef.current = false
      return
    }

    if (authLoading || hasSyncedRef.current) return

    hasSyncedRef.current = true

    let cancelled = false

    ;(async () => {
      try {
        const remote = await apiFetch<{ type?: WishlistItemType; product?: { slug?: string } }[]>('/auth/wishlist', {
          headers: authHeaders(),
          revalidate: false,
        })

        if (cancelled) return

        const remoteSlugs = (remote ?? [])
          .map((item) => item.product?.slug)
          .filter((slug): slug is string => Boolean(slug))

        const remoteTypes = Object.fromEntries(
          (remote ?? [])
            .filter((item) => item.product?.slug)
            .map((item) => [item.product!.slug as string, (item.type ?? 'frame') as WishlistItemType])
        )

        const local = slugsRef.current
        const merged = Array.from(new Set([...local, ...remoteSlugs]))

        dispatch({ type: 'HYDRATE', slugs: merged, types: remoteTypes })

        // Push up anything saved while signed out, tagged with its catalogue.
        // allSettled so one rejected slug cannot fail the whole merge.
        await Promise.allSettled(
          local
            .filter((slug) => !remoteSlugs.includes(slug))
            .map((slug) =>
              apiFetch('/auth/wishlist', {
                method: 'POST',
                body: JSON.stringify({ slug, type: typesRef.current[slug] ?? 'frame' }),
                headers: authHeaders(),
                revalidate: false,
              })
            )
        )
      } catch {
        // Offline or rejected token — the local wishlist still works.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, authLoading])

  const isInWishlist      = useCallback((slug: string) => state.slugs.includes(slug), [state.slugs])
  const addToWishlist      = useCallback((slug: string, itemType: WishlistItemType = 'frame') => dispatch({ type: 'ADD',    slug, itemType }), [])
  const removeFromWishlist = useCallback((slug: string) => dispatch({ type: 'REMOVE', slug }), [])
  const toggleWishlist     = useCallback((slug: string, itemType: WishlistItemType = 'frame') => dispatch({ type: 'TOGGLE', slug, itemType }), [])
  const clearWishlist     = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  return (
    <WishlistContext.Provider
      value={{
        slugs: state.slugs,
        count: state.slugs.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>')
  return ctx
}
