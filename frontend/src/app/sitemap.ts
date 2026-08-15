/**
 * sitemap.ts — ODSArts full sitemap
 *
 * Covers all static marketing routes plus every dynamic collection, frame and
 * art slug. Dynamic slugs come from the service layer, so they follow whichever
 * source that vertical is currently reading from (live API or fixtures).
 */

import type { MetadataRoute } from 'next'
import { COLLECTIONS } from '@/lib/data/collections'
import { ART_CATEGORIES } from '@/lib/data/artCategories'
import { getAllArt } from '@/lib/services/art'
import { getAllProducts } from '@/lib/services/products'
import { BRAND } from '@/constants'

const base = BRAND.url

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const [products, art] = await Promise.all([getAllProducts(), getAllArt()])

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
  const artProductRoutes: MetadataRoute.Sitemap = art.map((piece) => ({
    url: `${base}/art/${piece.categorySlug}/${piece.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // ── Individual frame product pages ─────────────────────────────────────────
  const frameProductRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...collectionRoutes,
    ...artCategoryRoutes,
    ...artProductRoutes,
    ...frameProductRoutes,
  ]
}
