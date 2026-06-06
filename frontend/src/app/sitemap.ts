/**
 * sitemap.ts — ODSArts full sitemap
 *
 * Covers all static marketing routes + all dynamic collection/art slugs.
 * Dynamic slugs are imported from the same static mock data the pages use —
 * when the backend is live, replace the imports with API calls (async sitemap).
 */

import type { MetadataRoute } from 'next'
import { COLLECTIONS } from '@/lib/data/collections'
import { ART_CATEGORIES } from '@/lib/data/artCategories'
import { MOCK_ART } from '@/lib/mock/art'
import { BRAND } from '@/constants'

const base = BRAND.url

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,               lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/collections`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/art`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/custom-framing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/gifting`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`,          lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/inspiration`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${base}/products`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
  ]

  // ── Frame collection pages ─────────────────────────────────────────────────
  const collectionRoutes: MetadataRoute.Sitemap = COLLECTIONS.map((col) => ({
    url: `${base}/collections/${col.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // ── Art category pages ─────────────────────────────────────────────────────
  const artCategoryRoutes: MetadataRoute.Sitemap = ART_CATEGORIES.map((cat) => ({
    url: `${base}/art/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // ── Individual art product pages ───────────────────────────────────────────
  const artProductRoutes: MetadataRoute.Sitemap = MOCK_ART.map((art) => ({
    url: `${base}/art/${art.categorySlug}/${art.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...collectionRoutes,
    ...artCategoryRoutes,
    ...artProductRoutes,
  ]
}
