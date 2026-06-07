import { apiFetch } from '@/lib/api/client'
import type { CartItem } from '@/lib/types/product'

/**
 * Fetch the authenticated user's cart items from the server.
 */
export async function getCart(): Promise<{ items: CartItem[] }> {
  return apiFetch<{ items: CartItem[] }>('/auth/cart')
}

/**
 * Sync the local cart state with the server.
 */
export async function syncCart(items: CartItem[]): Promise<{ items: CartItem[]; message: string }> {
  return apiFetch<{ items: CartItem[]; message: string }>('/auth/cart/sync', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}
