'use client'

/**
 * ODSArts — Cart Store
 *
 * A lightweight React Context + useReducer store. No external library.
 *
 * When the backend cart API is ready:
 *   1. Add a `syncWithServer` action that calls POST /cart/sync
 *   2. useEffect in CartProvider to hydrate from GET /cart on mount
 *   3. All cart mutations already return the right CartItem shape
 *
 * Persisted to localStorage so the cart survives page refreshes.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import { apiFetch } from '@/lib/api/client'
import { authHeaders, useAuth } from '@/lib/store/auth'
import type { CartItem, FrameCartItem, ProductVariant, FinishOption, Product } from '@/lib/types/product'
import type { ArtProduct, ArtMaterialVariant, ArtCartItem } from '@/lib/types/art'

// ── State ──────────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[]
  isDrawerOpen: boolean
}

// ── Actions ────────────────────────────────────────────────────────────────────

type CartAction =
  | { type: 'ADD_ITEM';     payload: { product: Product; variant: ProductVariant; finish: FinishOption; quantity: number } }
  | { type: 'ADD_ART_ITEM'; payload: { artProduct: ArtProduct; artVariant: ArtMaterialVariant; quantity: number } }
  | { type: 'REMOVE_ITEM';  payload: { key: string } }
  | { type: 'UPDATE_QTY';   payload: { key: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'HYDRATE';      payload: CartItem[] }

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeKey(variantId: string, finishId: string): string {
  return `${variantId}__${finishId}`
}

// ── Reducer ────────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, items: action.payload }

    case 'ADD_ITEM': {
      const { product, variant, finish, quantity } = action.payload
      const key = makeKey(variant.id, finish.id)
      const unitPricePaise = variant.basePricePaise + finish.priceDeltaPaise
      const existing = state.items.find((i) => i.key === key)

      const newItems: CartItem[] = existing
        ? state.items.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [
            ...state.items,
            {
              itemType: 'frame' as const,
              key,
              product: {
                id: product.id,
                slug: product.slug,
                collectionSlug: product.collectionSlug,
                name: product.name,
                currency: product.currency,
                images: product.images,
              },
              variant,
              finish,
              quantity,
              unitPricePaise,
            } satisfies FrameCartItem,
          ]

      return { ...state, items: newItems, isDrawerOpen: true }
    }

    case 'ADD_ART_ITEM': {
      const { artProduct, artVariant, quantity } = action.payload
      const key = `art__${artVariant.id}`
      const existing = state.items.find((i) => i.key === key)

      const newItems: CartItem[] = existing
        ? state.items.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [
            ...state.items,
            {
              itemType: 'art' as const,
              key,
              artProduct: {
                id: artProduct.id,
                slug: artProduct.slug,
                categorySlug: artProduct.categorySlug,
                name: artProduct.name,
                currency: artProduct.currency,
                images: artProduct.images,
              },
              artVariant,
              quantity,
              unitPricePaise: artVariant.pricePaise,
            } satisfies ArtCartItem,
          ]

      return { ...state, items: newItems, isDrawerOpen: true }
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.key !== action.payload.key) }

    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.key === action.payload.key ? { ...i, quantity: action.payload.quantity } : i
          )
          .filter((i) => i.quantity > 0),
      }

    case 'CLEAR_CART':
      return { ...state, items: [] }

    case 'OPEN_DRAWER':
      return { ...state, isDrawerOpen: true }

    case 'CLOSE_DRAWER':
      return { ...state, isDrawerOpen: false }

    default:
      return state
  }
}

// ── Context ────────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[]
  isDrawerOpen: boolean
  subtotalPaise: number
  totalItems: number
  addItem: (product: Product, variant: ProductVariant, finish: FinishOption, quantity?: number) => void
  addArtItem: (artProduct: ArtProduct, artVariant: ArtMaterialVariant, quantity?: number) => void
  removeItem: (key: string) => void
  updateQty: (key: string, quantity: number) => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'odsarts_cart_v1'

// ── Provider ───────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isDrawerOpen: false,
  })

  // Hydrate from localStorage on first mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        dispatch({ type: 'HYDRATE', payload: JSON.parse(stored) })
      }
    } catch {
      // Ignore corrupt storage
    }
  }, [])

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // Ignore storage quota errors
    }
  }, [state.items])

  // ── Server sync (signed-in customers only) ─────────────────────────────────
  //
  // localStorage stays the source of truth while browsing; the server copy makes
  // a cart follow the customer between devices.
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const hasMergedRef = useRef(false)

  // Latest items without making the merge effect depend on them.
  const stateRef = useRef(state.items)

  // Mirrored in an effect, not during render: React 19 forbids mutating a ref
  // while rendering, and this only needs to be current by the time an effect runs.
  useEffect(() => {
    stateRef.current = state.items
  }, [state.items])

  // On sign-in, merge rather than overwrite: a guest who filled a cart and then
  // logged in must not lose it, and neither must their previous session's cart.
  useEffect(() => {
    if (authLoading || !isAuthenticated || hasMergedRef.current) return

    hasMergedRef.current = true

    let cancelled = false

    ;(async () => {
      try {
        const remote = await apiFetch<{ items?: CartItem[] }>('/auth/cart', {
          headers: authHeaders(),
          revalidate: false,
        })

        if (cancelled) return

        const remoteItems = remote.items ?? []
        const localKeys = new Set(stateRef.current.map((item) => item.key))
        const merged = [
          ...stateRef.current,
          ...remoteItems.filter((item) => !localKeys.has(item.key)),
        ]

        dispatch({ type: 'HYDRATE', payload: merged })
      } catch {
        // Offline or a rejected token — the local cart still works.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated])

  // Reset the merge guard on sign-out so the next sign-in merges again.
  useEffect(() => {
    if (!isAuthenticated) hasMergedRef.current = false
  }, [isAuthenticated])

  // Push every change up once signed in.
  useEffect(() => {
    if (authLoading || !isAuthenticated || !hasMergedRef.current) return

    const timer = setTimeout(() => {
      apiFetch('/auth/cart/sync', {
        method: 'POST',
        body: JSON.stringify({ items: state.items }),
        headers: authHeaders(),
        revalidate: false,
      }).catch(() => {
        // Best effort — the cart is never lost, it just isn't mirrored yet.
      })
    }, 600) // debounce rapid quantity changes into one request

    return () => clearTimeout(timer)
  }, [state.items, isAuthenticated, authLoading])

  const addItem = useCallback(
    (product: Product, variant: ProductVariant, finish: FinishOption, quantity = 1) =>
      dispatch({ type: 'ADD_ITEM', payload: { product, variant, finish, quantity } }),
    []
  )

  const addArtItem = useCallback(
    (artProduct: ArtProduct, artVariant: ArtMaterialVariant, quantity = 1) =>
      dispatch({ type: 'ADD_ART_ITEM', payload: { artProduct, artVariant, quantity } }),
    []
  )

  const removeItem = useCallback(
    (key: string) => dispatch({ type: 'REMOVE_ITEM', payload: { key } }),
    []
  )

  const updateQty = useCallback(
    (key: string, quantity: number) =>
      dispatch({ type: 'UPDATE_QTY', payload: { key, quantity } }),
    []
  )

  const clearCart   = useCallback(() => dispatch({ type: 'CLEAR_CART' }),   [])
  const openDrawer  = useCallback(() => dispatch({ type: 'OPEN_DRAWER' }),  [])
  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), [])

  const subtotalPaise = state.items.reduce(
    (sum, i) => sum + i.unitPricePaise * i.quantity,
    0
  )

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isDrawerOpen: state.isDrawerOpen,
        subtotalPaise,
        totalItems,
        addItem,
        addArtItem,
        removeItem,
        updateQty,
        clearCart,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
