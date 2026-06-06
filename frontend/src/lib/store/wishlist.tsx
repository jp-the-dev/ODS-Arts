'use client'

import React, {
  createContext, useCallback, useContext,
  useEffect, useReducer, useRef,
} from 'react'
import { useAuth } from '@/lib/store/auth'
import { addToWishlist as apiAdd, getWishlist as apiGet, removeFromWishlist as apiRemove } from '@/lib/services/wishlist'

interface WishlistState {
  slugs: string[]
}

type WishlistAction =
  | { type: 'ADD';     slug: string }
  | { type: 'REMOVE';  slug: string }
  | { type: 'TOGGLE';  slug: string }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; slugs: string[] }

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

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, { slugs: [] })
  const { user, loading: authLoading } = useAuth()
  const idMap = useRef<Map<string, number>>(new Map())
  const synced = useRef(false)
  const stateRef = useRef(state)
  stateRef.current = state

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) dispatch({ type: 'HYDRATE', slugs: JSON.parse(stored) })
    } catch { /* ignore corrupt storage */ }
  }, [])

  // Sync with server when user becomes authenticated
  useEffect(() => {
    if (authLoading || !user || synced.current) return
    synced.current = true

    apiGet().then((items) => {
      const serverSlugs = items.map((i) => i.product.slug)
      items.forEach((i) => idMap.current.set(i.product.slug, i.id))

      const merged = [...new Set([...stateRef.current.slugs, ...serverSlugs])]
      dispatch({ type: 'HYDRATE', slugs: merged })
    }).catch(() => {})
  }, [user, authLoading])

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.slugs))
    } catch { /* ignore quota errors */ }
  }, [state.slugs])

  const isInWishlist = useCallback((slug: string) => state.slugs.includes(slug), [state.slugs])

  const addToWishlist = useCallback((slug: string) => {
    dispatch({ type: 'ADD', slug })
    if (user) {
      apiAdd({ slug }).then((item) => {
        idMap.current.set(item.product.slug, item.id)
      }).catch(() => {})
    }
  }, [user])

  const removeFromWishlist = useCallback((slug: string) => {
    dispatch({ type: 'REMOVE', slug })
    if (user) {
      const id = idMap.current.get(slug)
      if (id) {
        apiRemove(id).then(() => {
          idMap.current.delete(slug)
        }).catch(() => {})
      }
    }
  }, [user])

  const toggleWishlist = useCallback((slug: string) => {
    if (state.slugs.includes(slug)) {
      removeFromWishlist(slug)
    } else {
      addToWishlist(slug)
    }
  }, [state.slugs, addToWishlist, removeFromWishlist])

  const clearWishlist = useCallback(() => {
    dispatch({ type: 'CLEAR' })
    if (user) {
      const ids = [...idMap.current.values()]
      ids.forEach((id) => { apiRemove(id).catch(() => {}) })
      idMap.current.clear()
    }
  }, [user])

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

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>')
  return ctx
}
