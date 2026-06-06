/**
 * ODSArts — Art Category Editorial Data
 *
 * Static editorial data for each art category.
 * Analogous to `lib/data/collections.ts` for frames.
 * Add new categories here — no code changes needed elsewhere.
 */

import type { ArtStyle } from '@/lib/types/art'

export interface ArtCategoryData {
  slug: ArtStyle
  number: string
  eyebrow: string
  title: string
  tagline: string
  description: string
  coverImage: string       // path under /images/art/
  coverImageAlt: string
  accentColor: string      // used for category-specific highlights
}

export const ART_CATEGORIES: ArtCategoryData[] = [
  {
    slug: 'cultural',
    number: '01',
    eyebrow: 'Heritage & Tradition',
    title: 'Cultural Art',
    tagline: 'Stories etched in colour, craft, and memory.',
    description: 'Vibrant artworks celebrating the richness of Indian and global cultural heritage — folk dance, ancient architecture, mythology, and timeless ritual.',
    coverImage: '/images/art/cultural.png',
    coverImageAlt: 'Rajasthani folk dancers in vibrant traditional attire',
    accentColor: '#C9502E',
  },
  {
    slug: 'modern',
    number: '02',
    eyebrow: 'Contemporary Expression',
    title: 'Modern Art',
    tagline: 'Geometry, tension, and the beauty of abstraction.',
    description: 'Bold geometric compositions, fluid abstractions, and colour field works that bring a gallery-contemporary sensibility to any interior.',
    coverImage: '/images/art/modern.png',
    coverImageAlt: 'Bold geometric abstract artwork in navy and gold',
    accentColor: '#1C2F5E',
  },
  {
    slug: 'business',
    number: '03',
    eyebrow: 'Ambition & Vision',
    title: 'Business Art',
    tagline: 'Commanding art for spaces that mean business.',
    description: 'Sophisticated cityscapes, architectural studies, and abstract works curated for boardrooms, executive offices, and professional environments.',
    coverImage: '/images/art/business.png',
    coverImageAlt: 'Dramatic cityscape at dusk with glass skyscrapers',
    accentColor: '#2C3E50',
  },
  {
    slug: 'nature',
    number: '04',
    eyebrow: 'The Living World',
    title: 'Nature Art',
    tagline: 'The silence of mountains. The poetry of light.',
    description: 'Sweeping landscapes, intimate botanicals, and elemental studies of the natural world — from Himalayan peaks to desert blooms.',
    coverImage: '/images/art/nature.png',
    coverImageAlt: 'Himalayan mountain peaks at golden hour watercolour',
    accentColor: '#4A6741',
  },
  {
    slug: 'entertainment',
    number: '05',
    eyebrow: 'Stage & Screen',
    title: 'Entertainment Art',
    tagline: 'The moment before the final note.',
    description: 'Theatrical, cinematic, and musical artworks that capture the electricity of performance — jazz stages, film noir, and the drama of live art.',
    coverImage: '/images/art/entertainment.png',
    coverImageAlt: 'Jazz musician on a glowing stage with spotlight',
    accentColor: '#4A1A6E',
  },
  {
    slug: 'automotive',
    number: '06',
    eyebrow: 'Speed & Craft',
    title: 'Automotive Art',
    tagline: 'Where engineering becomes sculpture.',
    description: 'Expressive paintings and illustrations of iconic machines — vintage rally cars, modern hypercars, and the raw beauty of mechanical form.',
    coverImage: '/images/art/automotive.png',
    coverImageAlt: 'Sleek vintage sports car in dramatic chiaroscuro',
    accentColor: '#1A1A1A',
  },
]

export function getArtCategory(slug: ArtStyle): ArtCategoryData | undefined {
  return ART_CATEGORIES.find((c) => c.slug === slug)
}
