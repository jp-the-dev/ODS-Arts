/**
 * robots.ts — ODSArts robots.txt
 *
 * Allows all crawlers across all marketing pages.
 * Disallows cart/checkout (user-specific, no SEO value).
 * References the sitemap for faster discovery.
 */

import type { MetadataRoute } from 'next'
import { BRAND } from '@/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/cart', '/checkout', '/api/'],
      },
    ],
    sitemap: `${BRAND.url}/sitemap.xml`,
  }
}
