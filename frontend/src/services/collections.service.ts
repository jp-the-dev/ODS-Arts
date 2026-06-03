// Collection data fetching — Server only (uses ISR caching via apiFetch)
import { apiFetch } from '@/lib/api/client'
import type { Collection } from '@/types'

export async function getCollections(): Promise<Collection[]> {
  return apiFetch<Collection[]>('/collections', { revalidate: 3600 })
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    return await apiFetch<Collection>(`/collections/${slug}`, { revalidate: 3600 })
  } catch {
    return null
  }
}

export async function getFeaturedCollections(): Promise<Collection[]> {
  return apiFetch<Collection[]>('/collections', { revalidate: 3600 })
}
