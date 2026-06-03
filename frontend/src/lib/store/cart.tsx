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

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import type { CartItem, ProductVariant, FinishOption, Product } from '@/lib/types/product'

// ── State ──────────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[]
  isDrawerOpen: boolean
}

// ── Actions ────────────────────────────────────────────────────────────────────

type CartAction =
  | { type: 'ADD_ITEM';    payload: { product: Product; variant: ProductVariant; finish: FinishOption; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { key: string } }
  | { type: 'UPDATE_QTY';  payload: { key: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'HYDRATE';     payload: CartItem[] }

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
            },
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

  const addItem = useCallback(
    (product: Product, variant: ProductVariant, finish: FinishOption, quantity = 1) =>
      dispatch({ type: 'ADD_ITEM', payload: { product, variant, finish, quantity } }),
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
