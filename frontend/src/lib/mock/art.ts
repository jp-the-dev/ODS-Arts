/**
 * ODSArts — Mock Art Data
 *
 * 6 categories × 3 artworks = 18 art products.
 * Each artwork has variants for 5 materials × 4 sizes = 20 SKUs per artwork.
 * Pricing: material tier × size multiplier.
 *
 * Material pricing tiers (base for 8×10):
 *   Canvas:     ₹2,999
 *   Fine Art:   ₹2,499
 *   Metallic:   ₹1,999
 *   Photo Paper:₹1,299
 *   Foam Board: ₹ 799
 *
 * Size multipliers: 8×10=1×, 11×14=1.5×, 16×20=2.2×, 20×24=3×
 */

import type { ArtProduct, PrintMaterial } from '@/lib/types/art'

// ── Pricing helpers ──────────────────────────────────────────────────────────

const BASE_PRICES: Record<PrintMaterial, number> = {
  'canvas':     299900,  // ₹2,999
  'fine-art':   249900,  // ₹2,499
  'metallic':   199900,  // ₹1,999
  'photo-paper':129900,  // ₹1,299
  'foam-board':  79900,  // ₹  799
}

const SIZES = [
  { label: '8" × 10"',   cm: '20 × 25 cm',   mult: 1.0,  wg: 180 },
  { label: '11" × 14"',  cm: '28 × 36 cm',   mult: 1.5,  wg: 320 },
  { label: '16" × 20"',  cm: '41 × 51 cm',   mult: 2.2,  wg: 550 },
  { label: '20" × 24"',  cm: '51 × 61 cm',   mult: 3.0,  wg: 820 },
]

const MATERIALS: PrintMaterial[] = ['canvas', 'fine-art', 'metallic', 'photo-paper', 'foam-board']

let _skuCounter = 1000

function buildVariants(artSlug: string): ArtProduct['materialVariants'] {
  const variants: ArtProduct['materialVariants'] = []
  for (const mat of MATERIALS) {
    for (const sz of SIZES) {
      _skuCounter++
      variants.push({
        id:           `${artSlug}__${mat}__${sz.label.replace(/[^\w]/g, '')}`,
        sku:          `ART-${_skuCounter}`,
        material:     mat,
        sizeLabel:    sz.label,
        dimensionsCm: sz.cm,
        pricePaise:   Math.round(BASE_PRICES[mat] * sz.mult / 100) * 100,
        stockQty:     mat === 'foam-board' ? 0 : Math.floor(Math.random() * 20) + 5,
        weightGrams:  sz.wg,
      })
    }
  }
  return variants
}

// ── Mock Art Products ────────────────────────────────────────────────────────

export const MOCK_ART: ArtProduct[] = [

  // ══════════════ CULTURAL ART (3 pieces) ══════════════

  {
    id: 'art_cultural_01', slug: 'rajasthani-folk-dance', categorySlug: 'cultural',
    name: 'Rajasthani Folk Dance',
    tagline: 'The spin of tradition, frozen in colour.',
    description: 'An expressive painterly celebration of Rajasthan\'s Ghoomar dance — vibrant lehengas in crimson and cobalt, peacock feathers catching the golden afternoon light. Each brushstroke honours the rhythm of a living cultural legacy.',
    artist: 'ODSArts Studio', medium: 'Digital illustration',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/cultural.png', alt: 'Rajasthani folk dancers in traditional attire', role: 'hero' },
      { url: '/images/art/cultural.png', alt: 'Detail of the folk dance artwork', role: 'detail' },
    ],
    materialVariants: buildVariants('rajasthani-folk-dance'),
    tags: ['rajasthan', 'folk', 'dance', 'india', 'cultural', 'vibrant'],
  },

  {
    id: 'art_cultural_02', slug: 'ancient-stepwell', categorySlug: 'cultural',
    name: 'The Ancient Stepwell',
    tagline: 'Architecture as meditation.',
    description: 'The geometric grandeur of a Gujarati vav rendered in warm stone tones and deep shadow — each descending level a study in symmetry, devotion, and time. A piece that brings quiet magnificence to any wall.',
    artist: 'ODSArts Studio', medium: 'Digital illustration',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/cultural.png', alt: 'Ancient Indian stepwell architectural study', role: 'hero' },
    ],
    materialVariants: buildVariants('ancient-stepwell'),
    tags: ['stepwell', 'architecture', 'india', 'gujarat', 'geometric', 'heritage'],
  },

  {
    id: 'art_cultural_03', slug: 'diya-festival-night', categorySlug: 'cultural',
    name: 'Diya Festival Night',
    tagline: 'A thousand flames. One memory.',
    description: 'Hundreds of oil lamps reflected in dark water — the warmth of Diwali captured in deep amber, terracotta, and gold. A composition that glows from the wall even in daylight.',
    artist: 'ODSArts Studio', medium: 'Digital painting',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/cultural.png', alt: 'Diya festival lamps on dark water', role: 'hero' },
    ],
    materialVariants: buildVariants('diya-festival-night'),
    tags: ['diwali', 'diya', 'festival', 'india', 'gold', 'light'],
  },

  // ══════════════ MODERN ART (3 pieces) ══════════════

  {
    id: 'art_modern_01', slug: 'chromatic-drift', categorySlug: 'modern',
    name: 'Chromatic Drift',
    tagline: 'Where form loses itself in colour.',
    description: 'Bold navy planes bisected by gold arcs — a dynamic composition that draws the eye inward, then releases it outward. The interplay of tension and balance makes it equally at home in a minimalist living room or a statement boardroom.',
    artist: 'ODSArts Studio', medium: 'Digital geometric illustration',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/modern.png', alt: 'Bold geometric abstract in navy and gold', role: 'hero' },
      { url: '/images/art/modern.png', alt: 'Chromatic Drift close up detail', role: 'detail' },
    ],
    materialVariants: buildVariants('chromatic-drift'),
    tags: ['abstract', 'geometric', 'navy', 'gold', 'modern', 'minimal'],
  },

  {
    id: 'art_modern_02', slug: 'abstract-silence', categorySlug: 'modern',
    name: 'Abstract Silence',
    tagline: 'The art of saying nothing. And meaning everything.',
    description: 'Vast fields of warm ivory interrupted by a single vertical charcoal brushstroke — the quiet power of restraint. A meditation in negative space for the discerning collector.',
    artist: 'ODSArts Studio', medium: 'Digital oil study',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/modern.png', alt: 'Minimalist ivory canvas with single brushstroke', role: 'hero' },
    ],
    materialVariants: buildVariants('abstract-silence'),
    tags: ['minimal', 'abstract', 'ivory', 'black', 'silence', 'meditative'],
  },

  {
    id: 'art_modern_03', slug: 'urban-geometry', categorySlug: 'modern',
    name: 'Urban Geometry',
    tagline: 'The city, deconstructed.',
    description: 'Architectural forms stripped to their essential angles — a cubist meditation on the built environment. Tones of slate, burnt sienna, and ash form a landscape both familiar and entirely abstract.',
    artist: 'ODSArts Studio', medium: 'Digital illustration',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/modern.png', alt: 'Cubist urban geometry in slate and sienna', role: 'hero' },
    ],
    materialVariants: buildVariants('urban-geometry'),
    tags: ['urban', 'geometric', 'architecture', 'cubist', 'slate', 'modern'],
  },

  // ══════════════ BUSINESS ART (3 pieces) ══════════════

  {
    id: 'art_business_01', slug: 'city-at-dusk', categorySlug: 'business',
    name: 'City at Dusk',
    tagline: 'Where ambition meets the horizon.',
    description: 'Glass towers catching the final amber light of the day — a powerful editorial photograph elevated to fine art. Exudes authority and forward momentum. Perfect for executive suites and boardrooms.',
    artist: 'ODSArts Studio', medium: 'Fine art photography',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/business.png', alt: 'Glass skyscrapers at dusk with golden light', role: 'hero' },
      { url: '/images/art/business.png', alt: 'City at Dusk detail', role: 'detail' },
    ],
    materialVariants: buildVariants('city-at-dusk'),
    tags: ['city', 'skyline', 'business', 'corporate', 'dusk', 'architecture'],
  },

  {
    id: 'art_business_02', slug: 'blueprint-mind', categorySlug: 'business',
    name: 'Blueprint Mind',
    tagline: 'Every great thing begins as a line.',
    description: 'Technical blueprints layered over a warm charcoal wash — the poetry of planning. The white lines on deep blue evoke precision, intent, and the quiet confidence of someone who has already seen the finished building.',
    artist: 'ODSArts Studio', medium: 'Mixed media illustration',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/business.png', alt: 'Blueprint technical drawing overlay on charcoal', role: 'hero' },
    ],
    materialVariants: buildVariants('blueprint-mind'),
    tags: ['blueprint', 'planning', 'technical', 'navy', 'corporate', 'precision'],
  },

  {
    id: 'art_business_03', slug: 'market-pulse', categorySlug: 'business',
    name: 'Market Pulse',
    tagline: 'The rhythm of capital.',
    description: 'Abstract data visualisation elevated to art — glowing lines charting ascent across a dark field. At once data-driven and deeply human, it reminds every viewer that behind every chart is a story of conviction.',
    artist: 'ODSArts Studio', medium: 'Digital data art',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/business.png', alt: 'Abstract data visualization glowing lines on dark field', role: 'hero' },
    ],
    materialVariants: buildVariants('market-pulse'),
    tags: ['data', 'chart', 'finance', 'abstract', 'gold', 'business'],
  },

  // ══════════════ NATURE ART (3 pieces) ══════════════

  {
    id: 'art_nature_01', slug: 'himalayan-light', categorySlug: 'nature',
    name: 'Himalayan Light',
    tagline: 'The mountain does not need to speak.',
    description: 'Misty Himalayan peaks catching the first gold of dawn — rendered in layered watercolour washes that echo the very atmosphere of altitude. Pine forests fade into mist below. A work of profound, earned calm.',
    artist: 'ODSArts Studio', medium: 'Watercolour illustration',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/nature.png', alt: 'Himalayan mountain peaks at golden hour watercolour', role: 'hero' },
      { url: '/images/art/nature.png', alt: 'Himalayan Light detail of mist', role: 'detail' },
    ],
    materialVariants: buildVariants('himalayan-light'),
    tags: ['himalaya', 'mountain', 'watercolour', 'nature', 'india', 'calm'],
  },

  {
    id: 'art_nature_02', slug: 'monsoon-forest', categorySlug: 'nature',
    name: 'Monsoon Forest',
    tagline: 'Green and alive and wet and endless.',
    description: 'The primordial green of a monsoon forest — every leaf catching and releasing light, the air itself rendered visible. An intensely alive painting that brings the outdoors inside without compromise.',
    artist: 'ODSArts Studio', medium: 'Digital oil painting',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/nature.png', alt: 'Dense monsoon forest in vibrant emerald green', role: 'hero' },
    ],
    materialVariants: buildVariants('monsoon-forest'),
    tags: ['forest', 'monsoon', 'green', 'india', 'nature', 'rain'],
  },

  {
    id: 'art_nature_03', slug: 'desert-bloom', categorySlug: 'nature',
    name: 'Desert Bloom',
    tagline: 'Life insists on the impossible.',
    description: 'A single desert rose against cracked ochre earth and an impossibly blue sky. The defiance of fragile beauty in an unforgiving landscape — a reminder that growth is always an act of will.',
    artist: 'ODSArts Studio', medium: 'Digital watercolour',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/nature.png', alt: 'Desert rose blooming against ochre earth', role: 'hero' },
    ],
    materialVariants: buildVariants('desert-bloom'),
    tags: ['desert', 'flower', 'bloom', 'ochre', 'nature', 'minimalist'],
  },

  // ══════════════ ENTERTAINMENT ART (3 pieces) ══════════════

  {
    id: 'art_entertainment_01', slug: 'stage-at-midnight', categorySlug: 'entertainment',
    name: 'Stage at Midnight',
    tagline: 'The song does not end. It just stops being audible.',
    description: 'A saxophonist bathed in a single golden spotlight, the audience rendered in impressionist shadow behind. The warmth of brass against the cool dark of the hall — music made visible.',
    artist: 'ODSArts Studio', medium: 'Impressionist digital painting',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/entertainment.png', alt: 'Jazz saxophonist on stage with golden spotlight', role: 'hero' },
      { url: '/images/art/entertainment.png', alt: 'Stage at Midnight close up', role: 'detail' },
    ],
    materialVariants: buildVariants('stage-at-midnight'),
    tags: ['jazz', 'music', 'stage', 'saxophone', 'performance', 'gold'],
  },

  {
    id: 'art_entertainment_02', slug: 'film-reel-dreams', categorySlug: 'entertainment',
    name: 'Film Reel Dreams',
    tagline: 'Every frame, a world.',
    description: 'Cinematic frames within frames — a meditation on storytelling and the magic of cinema. Film noir shadows and art deco geometry merge in a piece that pays tribute to the golden age of film.',
    artist: 'ODSArts Studio', medium: 'Digital illustration',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/entertainment.png', alt: 'Film reel and cinema frames in noir style', role: 'hero' },
    ],
    materialVariants: buildVariants('film-reel-dreams'),
    tags: ['cinema', 'film', 'noir', 'art deco', 'movies', 'gold'],
  },

  {
    id: 'art_entertainment_03', slug: 'the-encore', categorySlug: 'entertainment',
    name: 'The Encore',
    tagline: 'When the crowd refuses to let go.',
    description: 'A concert stage overwhelmed by light — beams of white and gold cutting through darkness, the implied sound almost physical. The energy of thousands captured in a single frozen moment of ecstasy.',
    artist: 'ODSArts Studio', medium: 'Digital photography art',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/entertainment.png', alt: 'Concert stage with dramatic light beams', role: 'hero' },
    ],
    materialVariants: buildVariants('the-encore'),
    tags: ['concert', 'music', 'light', 'energy', 'performance', 'gold'],
  },

  // ══════════════ AUTOMOTIVE ART (3 pieces) ══════════════

  {
    id: 'art_automotive_01', slug: 'vintage-rally', categorySlug: 'automotive',
    name: 'Vintage Rally',
    tagline: 'Built to last. Driven to legend.',
    description: 'A classic British sports car rendered in expressive oil — deep navy bodywork, chrome catching warm studio light, each curve an argument for engineering as art. A piece for those who understand that a car can have a soul.',
    artist: 'ODSArts Studio', medium: 'Digital oil painting',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/automotive.png', alt: 'Classic British vintage sports car in navy and gold', role: 'hero' },
      { url: '/images/art/automotive.png', alt: 'Vintage Rally chrome detail', role: 'detail' },
    ],
    materialVariants: buildVariants('vintage-rally'),
    tags: ['vintage', 'car', 'british', 'classic', 'chrome', 'navy'],
  },

  {
    id: 'art_automotive_02', slug: 'velocity-lines', categorySlug: 'automotive',
    name: 'Velocity Lines',
    tagline: 'Speed is the most honest form of ambition.',
    description: 'Pure motion captured in line — a supercar reduced to its essential aerodynamic form, trailing light through darkness. Minimalist and electrifying. The perfect piece for a space that demands forward momentum.',
    artist: 'ODSArts Studio', medium: 'Digital illustration',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/automotive.png', alt: 'Supercar trailing light in dark minimalist illustration', role: 'hero' },
    ],
    materialVariants: buildVariants('velocity-lines'),
    tags: ['speed', 'supercar', 'motion', 'minimal', 'dark', 'lines'],
  },

  {
    id: 'art_automotive_03', slug: 'engine-heart', categorySlug: 'automotive',
    name: 'Engine Heart',
    tagline: 'The machine, alive.',
    description: 'A V12 engine cross-section rendered with the obsessive detail of a Renaissance anatomical study. Gears, pistons, and chambers cast in dramatic chiaroscuro — mechanical complexity elevated to fine art.',
    artist: 'ODSArts Studio', medium: 'Technical illustration',
    deliveryDays: 7, currency: 'INR',
    images: [
      { url: '/images/art/automotive.png', alt: 'V12 engine cross-section in dramatic chiaroscuro', role: 'hero' },
    ],
    materialVariants: buildVariants('engine-heart'),
    tags: ['engine', 'mechanical', 'technical', 'car', 'detail', 'chiaroscuro'],
  },
]
