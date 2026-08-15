import { apiFetch, ApiError } from '@/lib/api/client'
import type { Collection } from '@/lib/data/collections'

interface ApiCollection {
  id: number
  slug: string
  name: string
  number: string | null
  eyebrow: string | null
  tagline: string | null
  description: string | null
  long_description: string | null
  materials: string[]
  features: string[]
  image_src: string | null
  image_alt: string | null
  image_position: string | null
  cover_image: string | null
  products_count: number
}

type GetCollectionsResponse = { data: ApiCollection[] }
type GetCollectionResponse = { data: ApiCollection }

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

function toFrontendCollection(c: ApiCollection): Collection {
  const title = c.name

  return {
    slug: c.slug,
    number: c.number ?? '00',
    eyebrow: c.eyebrow ?? '',
    title,
    description: c.description ?? '',
    longDescription: c.long_description ?? '',
    materials: c.materials ?? [],
    features: c.features ?? [],
    imageSrc: c.image_src ?? '',
    imageAlt: c.image_alt ?? '',
    imagePosition: (c.image_position as 'left' | 'right') ?? 'left',
  }
}

export async function getAllCollections(): Promise<Collection[]> {
  if (USE_MOCK) {
    const { COLLECTIONS } = await import('@/lib/data/collections')
    return COLLECTIONS
  }

  const raw = await apiFetch<GetCollectionsResponse>('/collections')
  const data = 'data' in raw ? (raw as GetCollectionsResponse).data : (raw as ApiCollection[])
  return data.map(toFrontendCollection)
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  if (USE_MOCK) {
    const { COLLECTIONS } = await import('@/lib/data/collections')
    return COLLECTIONS.find((c) => c.slug === slug) ?? null
  }

  try {
    const raw = await apiFetch<GetCollectionResponse>(`/collections/${slug}`)
    const collection = 'data' in raw ? (raw as GetCollectionResponse).data : (raw as ApiCollection)
    return toFrontendCollection(collection)
  } catch (error) {
    // Only a genuine 404 means "no such collection". Swallowing everything hid
    // real failures: with the API down, every collection page rendered as
    // not-found instead of surfacing the outage.
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}
