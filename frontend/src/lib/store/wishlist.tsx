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
  useEffect, useReducer,
} from 'react'

// ── State ──────────────────────────────────────────────────────────────────────

interface WishlistState {
  slugs: string[]
}

// ── Actions ────────────────────────────────────────────────────────────────────

type WishlistAction =
  | { type: 'ADD';     slug: string }
  | { type: 'REMOVE';  slug: string }
  | { type: 'TOGGLE';  slug: string }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; slugs: string[] }

// ── Reducer ────────────────────────────────────────────────────────────────────

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'HYDRATE': return { slugs: action.slugs }
    case 'ADD':
      return state.slugs.includes(action.slug)
        ? state
        : { slugs: [...state.slugs, action.slug] }
    case 'REMOVE':
      return { slugs: state.slugs.filter((s) => s !== action.slug) }
    case 'TOGGLE':
      return {
        slugs: state.slugs.includes(action.slug)
          ? state.slugs.filter((s) => s !== action.slug)
          : [...state.slugs, action.slug],
      }
    case 'CLEAR':
      return { slugs: [] }
    default:
      return state
  }
}

// ── Context ────────────────────────────────────────────────────────────────────

interface WishlistContextValue {
  slugs: string[]
  count: number
  isInWishlist: (slug: string) => boolean
  addToWishlist: (slug: string) => void
  removeFromWishlist: (slug: string) => void
  toggleWishlist: (slug: string) => void
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

const STORAGE_KEY = 'odsarts_wishlist_v1'

// ── Provider ───────────────────────────────────────────────────────────────────

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, { slugs: [] })

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) dispatch({ type: 'HYDRATE', slugs: JSON.parse(stored) })
    } catch { /* ignore corrupt storage */ }
  }, [])

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.slugs))
    } catch { /* ignore quota errors */ }
  }, [state.slugs])

  const isInWishlist      = useCallback((slug: string) => state.slugs.includes(slug), [state.slugs])
  const addToWishlist     = useCallback((slug: string) => dispatch({ type: 'ADD',    slug }), [])
  const removeFromWishlist = useCallback((slug: string) => dispatch({ type: 'REMOVE', slug }), [])
  const toggleWishlist    = useCallback((slug: string) => dispatch({ type: 'TOGGLE', slug }), [])
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
