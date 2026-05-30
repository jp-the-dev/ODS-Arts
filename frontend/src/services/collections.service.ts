// Collection data fetching — Server only
import type { Collection } from '@/types'

export async function getCollections(): Promise<Collection[]> {
  return []
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  return null
}

export async function getFeaturedCollections(): Promise<Collection[]> {
  return []
}
