import { apiFetch } from '@/lib/api/client'

export interface WishlistItem {
  id: number
  product_id: number
  product: {
    id: number
    slug: string
    name: string
    tagline: string | null
    price: number        // in rupees (float) as returned by backend accessor
    thumbnail: string | null
    collection_slug: string | null
  }
  created_at: string
}

export interface AddToWishlistInput {
  slug: string
}

// apiFetch auto-unwraps the top-level `data` envelope from Laravel resources.
// WishlistItemResource::collection returns { data: [...] }  → apiFetch unwraps → WishlistItem[]
// WishlistItemResource (single) returns { data: {...} }     → apiFetch unwraps → WishlistItem

export async function getWishlist(): Promise<WishlistItem[]> {
  return apiFetch<WishlistItem[]>('/auth/wishlist')
}

export async function addToWishlist(input: AddToWishlistInput): Promise<WishlistItem> {
  return apiFetch<WishlistItem>('/auth/wishlist', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function removeFromWishlist(id: number): Promise<void> {
  await apiFetch(`/auth/wishlist/${id}`, {
    method: 'DELETE',
  })
}
