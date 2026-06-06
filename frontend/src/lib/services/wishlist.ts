import { apiFetch } from '@/lib/api/client'

export interface WishlistItem {
  id: number
  product_id: number
  product: {
    id: number
    slug: string
    name: string
    tagline: string | null
    price: number
    thumbnail?: string
  }
  created_at: string
}

export interface AddToWishlistInput {
  slug: string
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const res = await apiFetch<{ data: WishlistItem[] }>('/auth/wishlist')
  return res.data
}

export async function addToWishlist(input: AddToWishlistInput): Promise<WishlistItem> {
  const res = await apiFetch<{ data: WishlistItem }>('/auth/wishlist', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return res.data
}

export async function removeFromWishlist(id: number): Promise<void> {
  await apiFetch(`/auth/wishlist/${id}`, {
    method: 'DELETE',
  })
}
