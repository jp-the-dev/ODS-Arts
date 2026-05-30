# ODSArts — Frontend Implementation Roadmap

> **Stack:** Next.js 16.2.6 · React 19.2.4 · TypeScript 5 · Tailwind CSS v4 · Framer Motion
> **Router:** App Router (default — all layouts and pages are Server Components)
> **Cross-reference:** All brand decisions from `agents/` knowledge files apply here.

---

## ⚠️ Critical Stack Notes (Read Before Building)

> [!IMPORTANT]
> **This is Next.js 16 with React 19 and Tailwind v4 — not the versions your training data covers.**

1. **Tailwind v4** — There is **no `tailwind.config.ts`**. Design tokens are defined in `globals.css` using `@theme {}` blocks. The Tailwind v3 `tailwind.config.ts` in `08-tailwind-tokens.md` must be **converted** to v4 CSS `@theme` syntax.
2. **No `tailwind.config.ts`** — The file does not exist in v4. All customisation lives in CSS.
3. **Server Components by default** — All `layout.tsx` and `page.tsx` files are Server Components. Only add `'use client'` where you need interactivity (Framer Motion, event handlers, state).
4. **Framer Motion** — All Framer Motion components require `'use client'`. Wrap them in dedicated client component files, then import into Server Components via the children/slot pattern.
5. **`next/font/google`** — Fonts are self-hosted automatically at build time. No Google CDN requests at runtime. Use CSS variables via the `variable` option to connect to Tailwind.
6. **`params` is a Promise in Next.js 16** — Dynamic route `params` must be awaited: `const { slug } = await params`.

---

## 1. Recommended Folder Structure

```
odsarts/
├── app/                              ← App Router root
│   ├── (marketing)/                  ← Route group: public-facing pages
│   │   ├── layout.tsx                ← Marketing layout (nav + footer)
│   │   ├── page.tsx                  ← Homepage → /
│   │   ├── collections/
│   │   │   ├── page.tsx              ← Collections index → /collections
│   │   │   └── [slug]/
│   │   │       └── page.tsx          ← Single collection → /collections/oslo-frame
│   │   ├── products/
│   │   │   ├── page.tsx              ← Products listing → /products
│   │   │   └── [slug]/
│   │   │       ├── page.tsx          ← Product detail → /products/oslo-frame
│   │   │       └── loading.tsx       ← Skeleton for product detail
│   │   ├── custom-framing/
│   │   │   └── page.tsx              ← Custom framing → /custom-framing
│   │   ├── gifting/
│   │   │   └── page.tsx              ← Gifting → /gifting
│   │   ├── about/
│   │   │   └── page.tsx              ← About / The Studio → /about
│   │   └── inspiration/
│   │       └── page.tsx              ← Wall inspiration gallery → /inspiration
│   │
│   ├── (shop)/                       ← Route group: transactional pages
│   │   ├── layout.tsx                ← Shop layout (light mode, checkout nav)
│   │   ├── cart/
│   │   │   └── page.tsx              ← Cart → /cart
│   │   └── checkout/
│   │       └── page.tsx              ← Checkout → /checkout
│   │
│   ├── _components/                  ← Private: not routable
│   │   ├── layout/                   ← Layout components (RSC)
│   │   │   ├── Navigation.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   ├── sections/                 ← Homepage section components (RSC shells)
│   │   │   ├── HeroSection.tsx
│   │   │   ├── BrandStatementSection.tsx
│   │   │   ├── FeaturedCollectionsSection.tsx
│   │   │   ├── CraftsmanshipSection.tsx
│   │   │   ├── CustomerStoriesSection.tsx
│   │   │   ├── BestSellersSection.tsx
│   │   │   ├── WallInspirationSection.tsx
│   │   │   ├── CustomFramingProcessSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   └── GiftingBannerSection.tsx
│   │   ├── ui/                       ← Shared atomic UI (RSC unless interactive)
│   │   │   ├── Button.tsx
│   │   │   ├── GoldRule.tsx
│   │   │   ├── EyebrowLabel.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CollectionCard.tsx
│   │   │   ├── SectionHeader.tsx
│   │   │   ├── MaterialPill.tsx
│   │   │   ├── StepCard.tsx
│   │   │   └── QuoteBlock.tsx
│   │   └── motion/                   ← Client components: Framer Motion wrappers
│   │       ├── FadeUp.tsx            ← 'use client' — scroll reveal wrapper
│   │       ├── ParallaxImage.tsx     ← 'use client' — parallax on scroll
│   │       ├── StaggerChildren.tsx   ← 'use client' — staggered children reveal
│   │       ├── HeroReveal.tsx        ← 'use client' — hero entry animation
│   │       ├── BorderDraw.tsx        ← 'use client' — animated border on hover
│   │       ├── GoldShimmer.tsx       ← 'use client' — shimmer on gold elements
│   │       └── TestimonialCarousel.tsx ← 'use client' — auto-advancing carousel
│   │
│   ├── api/                          ← Route handlers
│   │   ├── newsletter/
│   │   │   └── route.ts              ← POST /api/newsletter
│   │   └── contact/
│   │       └── route.ts              ← POST /api/contact
│   │
│   ├── globals.css                   ← Tailwind v4 @import + @theme tokens
│   ├── layout.tsx                    ← Root layout (fonts, metadata, providers)
│   ├── not-found.tsx                 ← 404 — "An unexpected gallery wall"
│   ├── error.tsx                     ← Global error boundary ('use client')
│   ├── loading.tsx                   ← Root loading skeleton
│   ├── opengraph-image.tsx           ← Generated OG image
│   ├── sitemap.ts                    ← Generated sitemap
│   └── robots.ts                     ← robots.txt
│
├── lib/                              ← Shared utilities and data functions
│   ├── types.ts                      ← TypeScript types (Product, Collection, etc.)
│   ├── fonts.ts                      ← next/font/google instances (exported)
│   ├── constants.ts                  ← Brand constants (colors, breakpoints)
│   ├── utils.ts                      ← Utility functions (cn, clamp, etc.)
│   └── data/                         ← Data fetching (server-only)
│       ├── products.ts
│       ├── collections.ts
│       └── testimonials.ts
│
├── public/                           ← Static assets
│   ├── images/
│   │   ├── hero/                     ← Hero photography
│   │   ├── products/                 ← Product images
│   │   ├── collections/              ← Collection images
│   │   ├── craft/                    ← Craftsmanship macro photos
│   │   ├── inspiration/              ← Room inspiration gallery
│   │   └── stories/                  ← Customer story images
│   └── fonts/                        ← (only if using local fonts — not needed for Google Fonts)
│
├── agents/                           ← Brand knowledge files (non-routable)
│   └── *.md
│
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## 2. Component Hierarchy

```
RootLayout (app/layout.tsx) [SERVER]
│   Loads fonts via next/font/google
│   Applies font CSS variables to <html>
│   Imports globals.css
│
├── (marketing)/layout.tsx [SERVER]
│   ├── Navigation [SERVER]
│   │   └── MobileMenuButton [CLIENT — 'use client', useState]
│   │       └── MobileMenuOverlay [CLIENT]
│   │
│   ├── {children} — page.tsx [SERVER]
│   │
│   └── Footer [SERVER]
│       └── NewsletterForm [CLIENT — 'use client', form state]
│
└── (shop)/layout.tsx [SERVER]
    ├── ShopNavigation [SERVER]
    └── {children}


app/(marketing)/page.tsx [SERVER] — Homepage
│
├── HeroSection [SERVER shell]
│   └── HeroReveal [CLIENT — Framer Motion]
│       └── ParallaxImage [CLIENT — Framer Motion]
│
├── BrandStatementSection [SERVER shell]
│   └── StaggerChildren [CLIENT — Framer Motion]
│
├── FeaturedCollectionsSection [SERVER shell]
│   ├── SectionHeader [SERVER]
│   └── CollectionCard × 3 [SERVER]
│       └── CardHoverEffect [CLIENT — Framer Motion]
│
├── CraftsmanshipSection [SERVER shell]
│   └── FadeUp × n [CLIENT — Framer Motion]
│
├── CustomerStoriesSection [SERVER shell]
│   └── MasonryGrid [CLIENT — 'use client', IntersectionObserver]
│
├── BestSellersSection [SERVER shell]
│   └── ProductCard × 4 [SERVER]
│       └── CardHoverEffect [CLIENT]
│
├── WallInspirationSection [SERVER shell]
│   └── InspirationGrid [CLIENT — Framer Motion, filter state]
│
├── CustomFramingProcessSection [SERVER shell]
│   └── StepReveal [CLIENT — Framer Motion]
│
├── TestimonialsSection [SERVER shell]
│   └── TestimonialCarousel [CLIENT — 'use client', auto-advance]
│
└── GiftingBannerSection [SERVER shell]
    └── ParallaxImage [CLIENT — Framer Motion]
```

### Server vs Client Decision Matrix

| Component | Type | Reason |
|-----------|------|--------|
| `RootLayout` | Server | Font loading, metadata, no interactivity |
| `Navigation` | Server | Static links, passes children to client menu |
| `MobileMenuButton` | Client | `useState` for open/close |
| `MobileMenuOverlay` | Client | Framer Motion `AnimatePresence` |
| `Footer` | Server | Static content |
| `NewsletterForm` | Client | `onChange`, `onSubmit`, form state |
| `HeroSection` | Server shell | Passes static data down |
| `HeroReveal` | Client | Framer Motion on load animation |
| `ParallaxImage` | Client | `useScroll`, `useTransform` |
| `FadeUp` | Client | `useInView`, `motion.div` |
| `StaggerChildren` | Client | Framer Motion stagger |
| `CollectionCard` | Server | Static image + text, no interaction |
| `CardHoverEffect` | Client | `whileHover` Framer Motion |
| `MasonryGrid` | Client | `IntersectionObserver`, layout calc |
| `InspirationGrid` | Client | Filter state, `useState` |
| `TestimonialCarousel` | Client | Auto-advance timer, swipe, `useState` |
| `ProductCard` | Server | Static data, no interactivity |
| `Button` | Server | Static — pass `onClick` from parent if needed |

---

## 3. Shared UI Components (`app/_components/ui/`)

These are atomic, brand-consistent primitives used throughout the site:

### `Button.tsx` [SERVER]
**Props:** `variant: 'primary' | 'ghost' | 'text'`, `size: 'sm' | 'md' | 'lg'`, `href?: string`, `children`, `className?`
**Variants:**
- `primary` — Gold fill, Obsidian text
- `ghost` — Gold 1px border, Gold text, transparent bg
- `text` — Gold text link, underline on hover
**Note:** If `href` is passed, renders as `<Link>`. Otherwise `<button>`.

### `EyebrowLabel.tsx` [SERVER]
**Props:** `children`, `color?: 'gold' | 'pewter'`
**Output:** Jost, ALL CAPS, tracking-widest, 11px — the branded label treatment

### `GoldRule.tsx` [SERVER]
**Props:** `width?: 'sm' | 'full'`, `className?`
**Output:** 1px horizontal gold line — the brand's visual pause element

### `SectionHeader.tsx` [SERVER]
**Props:** `eyebrow?: string`, `headline`, `subline?: string`, `align?: 'left' | 'center'`
**Output:** Eyebrow + Cormorant headline + Jost subline in the brand stack

### `ProductCard.tsx` [SERVER]
**Props:** `product: Product`, `priority?: boolean` (for LCP images)
**Output:** Image (3:4) + category label + name + dimensions + price

### `CollectionCard.tsx` [SERVER]
**Props:** `collection: Collection`
**Output:** Portrait image + collection name + "Explore →" link

### `QuoteBlock.tsx` [SERVER]
**Props:** `quote: string`, `attribution: string`, `productName?: string`
**Output:** Oversized gold `"` glyph + Cormorant Italic quote + attribution

### `MaterialPill.tsx` [SERVER]
**Props:** `label: string`
**Output:** Jost 11px ALL CAPS, 1px gold border, transparent bg pill

### `StepCard.tsx` [SERVER]
**Props:** `number: string`, `title: string`, `description: string`, `icon: React.ReactNode`
**Output:** Numbered step card for the Custom Framing Process section

### `Container.tsx` [SERVER]
**Props:** `children`, `size?: 'text' | 'content' | 'wide' | 'full'`, `className?`
**Output:** Max-width wrapper with responsive outer gutters — wraps all section content

---

## 4. Section Components (`app/_components/sections/`)

Each section component is a **Server Component shell** that:
1. Accepts static data as props (or fetches its own data)
2. Renders the static structure
3. Wraps interactive sub-parts in Client Component motion wrappers

### `HeroSection.tsx`
- Full viewport (100svh)
- Single hero image via `next/image` with `priority={true}` (LCP element)
- Eyebrow, headline, subline, CTA ghost button
- Wraps content in `<HeroReveal>` (client) for entry animation
- Wraps image in `<ParallaxImage>` (client) for scroll parallax

### `BrandStatementSection.tsx`
- ~50vh pause section
- Centered gold rule + Cormorant Italic multi-line quote
- Lines wrapped in `<StaggerChildren>` (client) for staggered reveal

### `FeaturedCollectionsSection.tsx`
- 3-column grid (desktop), horizontal snap scroll (mobile)
- Receives `collections: Collection[]` prop
- Renders `<CollectionCard>` for each, each wrapped in `<CardHoverEffect>`

### `CraftsmanshipSection.tsx`
- 50/50 split, two sub-sections alternating dark/light
- Sub-section A: image left, text right (dark bg)
- Sub-section B: text left, image right (ivory bg)
- Material pills row
- Content wrapped in `<FadeUp>` blocks

### `CustomerStoriesSection.tsx`
- Section header (Server)
- `<MasonryGrid>` (Client) — receives images array as prop, handles layout

### `BestSellersSection.tsx`
- Receives `products: Product[]`
- 4-column grid (desktop)
- Each `<ProductCard>` wrapped in `<CardHoverEffect>`
- "View All" ghost button CTA

### `WallInspirationSection.tsx`
- Section header (Server)
- Style filter pills + mosaic grid
- `<InspirationGrid>` (Client) — handles filter state and layout

### `CustomFramingProcessSection.tsx`
- 4-step horizontal timeline (desktop) / vertical (mobile)
- Renders `<StepCard>` × 4
- `<StepReveal>` (Client) — staggered left-to-right reveal

### `TestimonialsSection.tsx`
- Full-width dark section
- `<TestimonialCarousel>` (Client) — receives `testimonials: Testimonial[]`

### `GiftingBannerSection.tsx`
- Full-bleed image with gradient overlay
- Headline, trust line, two CTAs
- `<ParallaxImage>` (Client) for scroll effect

---

## 5. Layout Architecture

### Root Layout (`app/layout.tsx`)
**Responsibility:** Foundation only — fonts, metadata, global CSS, providers

```
RootLayout
├── Font variables applied to <html> classNames
├── globals.css imported here (Tailwind v4 @import 'tailwindcss' + @theme)
├── <html lang="en"> with font variable classes
└── <body>
    └── {children}
```

**Key notes:**
- Root layout has NO nav or footer — those live in route group layouts
- Metadata exported as `metadata` object (static) or `generateMetadata` (dynamic)

### Marketing Layout (`app/(marketing)/layout.tsx`)
**Responsibility:** Navigation + Footer for all public pages

```
MarketingLayout
├── <Navigation /> [SERVER]
│   └── <MobileMenuButton /> [CLIENT inside]
├── <main>{children}</main>
└── <Footer /> [SERVER]
    └── <NewsletterForm /> [CLIENT inside]
```

### Shop Layout (`app/(shop)/layout.tsx`)
**Responsibility:** Minimal checkout-style nav, light mode wrapper

```
ShopLayout
├── <ShopNavigation /> [SERVER — logo + back link only]
└── <main>{children}</main>
```

### Navigation Architecture
```
Navigation.tsx [SERVER]
├── Logo link (Cormorant Garamond)
├── Desktop nav links (static — Jost ALL CAPS)
├── "SHOP" CTA button (Server — ghost gold)
└── <MobileMenuButton /> [CLIENT boundary]
    ├── useState: isOpen
    └── <AnimatePresence> [Framer Motion]
        └── MobileMenuOverlay (full-screen obsidian)
            └── Nav links + social + CTA
```

**Scroll behaviour:** Implemented in a `<NavigationScrollObserver>` client component that observes scroll position and applies class to the nav via a CSS class toggle.

---

## 6. Design Token Structure

> [!IMPORTANT]
> **Tailwind v4 uses CSS-first configuration.** There is no `tailwind.config.ts`.
> All tokens from `08-tailwind-tokens.md` must be converted to `@theme {}` blocks in `globals.css`.

### `app/globals.css` Structure

```
app/globals.css
│
├── @import 'tailwindcss';                     ← Required: Tailwind v4 base
│
├── @import url('Google Fonts — Cormorant family + Jost');
│
├── @theme {                                   ← All design tokens (replaces tailwind.config)
│   │
│   ├── Colors
│   │   ├── --color-obsidian: #0E0D0B;
│   │   ├── --color-gold: #C9A96E;
│   │   ├── --color-ivory: #F5F0E8;
│   │   ├── --color-walnut: #3D2B1F;
│   │   ├── --color-pewter: #8B8680;
│   │   └── (all semantic aliases)
│   │
│   ├── Font families (CSS variable bridge from next/font)
│   │   ├── --font-display: var(--font-cormorant);
│   │   ├── --font-display-heading: var(--font-cormorant-garamond);
│   │   ├── --font-display-body: var(--font-cormorant-infant);
│   │   ├── --font-display-sc: var(--font-cormorant-sc);
│   │   └── --font-body: var(--font-jost);
│   │
│   ├── Font sizes (fluid clamp values)
│   │   ├── --text-display: clamp(2.25rem, 5.5vw, 5.5rem);
│   │   ├── --text-hero: clamp(2rem, 4.5vw, 4.5rem);
│   │   └── (full scale from 10-responsive-screen-sizes.md)
│   │
│   ├── Letter spacing
│   │   ├── --tracking-tightest: -0.025em;
│   │   └── --tracking-label-2xl: 0.3em;
│   │
│   ├── Spacing (8px base scale)
│   │
│   ├── Border radius
│   │
│   ├── Box shadows (warm-tinted)
│   │
│   ├── Background images (gradients)
│   │   ├── --gradient-hero: linear-gradient(...);
│   │   ├── --gradient-gold: linear-gradient(...);
│   │   └── (all from 08-tailwind-tokens.md)
│   │
│   ├── Screens (breakpoints)
│   │   ├── --breakpoint-xs: 320px;
│   │   └── --breakpoint-5xl: 2560px;
│   │
│   └── Transitions / animations
│       ├── --ease-luxury: cubic-bezier(0.25, 0, 0, 1);
│       └── (keyframes, animation durations)
│
├── @layer base {                              ← Base/reset styles
│   html { ... }
│   ::selection { ... }
│   ::-webkit-scrollbar { ... }
│   @media (prefers-reduced-motion: reduce) { ... }
│ }
│
└── @layer utilities {                         ← Custom utility classes
    .text-balance { text-wrap: balance; }
    .grain-overlay { ... }
    .container-content { ... }
}
```

### `lib/fonts.ts` — Font Instances

All `next/font/google` instances are defined once in a single file and exported. They are imported **only** in `app/layout.tsx` to apply CSS variable names to `<html>`.

```
lib/fonts.ts
├── export const cormorant         → variable: '--font-cormorant'
├── export const cormorantGaramond → variable: '--font-cormorant-garamond'
├── export const cormorantInfant   → variable: '--font-cormorant-infant'
├── export const cormorantSC       → variable: '--font-cormorant-sc'
└── export const jost              → variable: '--font-jost'
```

### `lib/types.ts` — Core Types

```typescript
Product {
  id, slug, name, collection, price, dimensions,
  material, description, images: Image[], featured: boolean
}

Collection {
  id, slug, name, tagline, description, coverImage, products: Product[]
}

Testimonial {
  id, quote, author, city, productName, productSlug
}

CustomerStory {
  id, image, customerName, city, frameName, location
}

InspirationImage {
  id, image, style: 'minimal' | 'warm' | 'gallery', frameSlug?
}

ProcessStep {
  number, title, description, icon
}
```

### `lib/constants.ts` — Brand Constants

```
BRAND_COLORS — hex values for use in non-CSS contexts (OG images, canvas)
BRAND_NAME, BRAND_TAGLINE, BRAND_EMAIL
BREAKPOINTS — numeric values mirroring CSS breakpoints
NAV_LINKS — typed navigation link objects
COLLECTIONS — static collection data
PROCESS_STEPS — the 4 custom framing steps
SITE_URL — absolute URL for metadata
```

---

## 7. Development Order

Build in this exact sequence. Each phase depends on the previous being complete.

---

### Phase 0 — Foundation (Day 1)
**Goal:** Project runs with correct design system applied

```
[ ] 1. Install dependencies
        npm install framer-motion
        npm install clsx (for cn() utility)

[ ] 2. Create lib/fonts.ts
        All 5 Cormorant variants + Jost with CSS variable options

[ ] 3. Build app/globals.css
        @import 'tailwindcss'
        Google Fonts @import (Cormorant family + Jost)
        @theme {} block with ALL tokens from 03-color-palette.md
        @layer base {} with html defaults, selection, scrollbar
        @media (prefers-reduced-motion: reduce) {}

[ ] 4. Update app/layout.tsx
        Import fonts from lib/fonts.ts
        Apply all font variable classNames to <html>
        Import globals.css
        Set root metadata (title template, description, OG)

[ ] 5. Create lib/utils.ts
        cn() function (combines clsx)
        Breakpoint helpers

[ ] 6. Create lib/types.ts
        All TypeScript interfaces

[ ] 7. Verify: npm run dev shows obsidian background, correct fonts loading
```

---

### Phase 1 — Layout Architecture (Day 1–2)
**Goal:** Navigation and Footer exist and are responsive

```
[ ] 8.  Create app/_components/layout/Container.tsx (SERVER)
[ ] 9.  Create app/_components/layout/Navigation.tsx (SERVER)
[ ] 10. Create app/_components/motion/MobileMenuButton.tsx (CLIENT)
[ ] 11. Create app/_components/layout/Footer.tsx (SERVER)
[ ] 12. Create app/(marketing)/layout.tsx
        Import Navigation + Footer
        Wrap {children} in <main>
[ ] 13. Create app/(shop)/layout.tsx (minimal)
[ ] 14. Verify: Homepage renders with nav + footer across all breakpoints
```

---

### Phase 2 — Motion Primitives (Day 2)
**Goal:** All Framer Motion wrappers built and tested in isolation

```
[ ] 15. Create app/_components/motion/FadeUp.tsx
        useInView + motion.div, configurable delay/duration
[ ] 16. Create app/_components/motion/StaggerChildren.tsx
        variants with stagger, triggered by useInView
[ ] 17. Create app/_components/motion/ParallaxImage.tsx
        useScroll + useTransform — disabled on mobile via useMediaQuery
[ ] 18. Create app/_components/motion/HeroReveal.tsx
        Entry animation: image fade, headline letter-spacing collapse
[ ] 19. Create app/_components/motion/BorderDraw.tsx
        clipPath animation on hover for card borders
[ ] 20. Create app/_components/motion/TestimonialCarousel.tsx
        AnimatePresence crossfade, auto-advance, dot nav, swipe
[ ] 21. Rule: ALL motion components have 'use client' directive
[ ] 22. Rule: ALL motion components respect prefers-reduced-motion
```

---

### Phase 3 — Shared UI Atoms (Day 2–3)
**Goal:** Design system primitives available

```
[ ] 23. Button.tsx — primary, ghost, text variants
[ ] 24. EyebrowLabel.tsx — gold/pewter, ALL CAPS, tracked
[ ] 25. GoldRule.tsx — sm (40px) and full-width variants
[ ] 26. SectionHeader.tsx — eyebrow + headline + subline
[ ] 27. MaterialPill.tsx — gold border pill
[ ] 28. QuoteBlock.tsx — oversized gold quote mark + Cormorant italic
[ ] 29. StepCard.tsx — numbered step for framing process
[ ] 30. ProductCard.tsx — image 3:4 + label + name + price
[ ] 31. CollectionCard.tsx — portrait image + name + explore link
[ ] 32. Verify: Render all atoms on a dev test page, check brand alignment
```

---

### Phase 4 — Homepage Sections (Day 3–5)
**Goal:** Full homepage assembled in order from wireframe

Build in this order — each section can be worked on independently:

```
[ ] 33. HeroSection — First, highest visual priority (LCP)
        next/image with priority={true}
        HeroReveal wrapper (client)
        ParallaxImage wrapper (client, desktop only)

[ ] 34. BrandStatementSection — Simple, no data needed
        StaggerChildren wrapper

[ ] 35. FeaturedCollectionsSection
        lib/data/collections.ts — static data for now
        3 CollectionCard components
        Mobile: CSS snap scroll

[ ] 36. CraftsmanshipSection
        Two alternating sub-sections
        FadeUp wrappers for text blocks
        MaterialPills row

[ ] 37. CustomerStoriesSection
        MasonryGrid (CLIENT — layout logic)
        Static story images from public/images/stories/

[ ] 38. BestSellersSection
        lib/data/products.ts — static data for now
        4 ProductCard components
        Mobile: 2-col grid

[ ] 39. WallInspirationSection
        InspirationGrid (CLIENT — filter + layout)
        Style filter pills

[ ] 40. CustomFramingProcessSection
        4 StepCards
        Desktop: horizontal timeline
        Mobile: vertical timeline with CSS only
        StepReveal animation (CLIENT)

[ ] 41. TestimonialsSection
        TestimonialCarousel (CLIENT)
        Minimum 4 testimonial entries in static data

[ ] 42. GiftingBannerSection
        ParallaxImage (CLIENT)
        Two CTAs (primary + ghost)

[ ] 43. Assemble app/(marketing)/page.tsx
        Import all section components in order
        Verify scroll pacing and section rhythm
```

---

### Phase 5 — SEO & Metadata (Day 5)
**Goal:** Every page has correct metadata, OG images, structured data

```
[ ] 44. app/layout.tsx — Root metadata template
        title: { template: '%s | ODSArts', default: 'ODSArts — Where memory becomes art.' }
        description, keywords, openGraph, twitter

[ ] 45. app/(marketing)/page.tsx — Homepage metadata
        Unique title, description, OG image

[ ] 46. app/opengraph-image.tsx — Generated OG image
        Brand-styled: dark bg + gold logo + tagline

[ ] 47. app/sitemap.ts — Auto-generated sitemap
[ ] 48. app/robots.ts — robots.txt
[ ] 49. app/not-found.tsx — 404 page ("An unexpected gallery wall")
[ ] 50. app/error.tsx — Error boundary ('use client', graceful fallback)
```

---

### Phase 6 — Product & Collection Pages (Day 6–8)
**Goal:** Product and collection detail pages

```
[ ] 51. app/(marketing)/collections/page.tsx
[ ] 52. app/(marketing)/collections/[slug]/page.tsx
        generateMetadata (awaits params — Next.js 16 requirement)
        generateStaticParams for SSG

[ ] 53. app/(marketing)/products/page.tsx
[ ] 54. app/(marketing)/products/[slug]/page.tsx
        Light mode layout for product detail
        Image gallery (CLIENT component)
        Add to cart (CLIENT component)
        generateMetadata + generateStaticParams

[ ] 55. app/(marketing)/products/[slug]/loading.tsx
        Skeleton matching product page structure
```

---

### Phase 7 — Remaining Pages (Day 8–10)
**Goal:** All marketing pages complete

```
[ ] 56. app/(marketing)/custom-framing/page.tsx
[ ] 57. app/(marketing)/gifting/page.tsx
[ ] 58. app/(marketing)/about/page.tsx
[ ] 59. app/(marketing)/inspiration/page.tsx
[ ] 60. app/(shop)/cart/page.tsx (stub — no payment integration yet)
```

---

### Phase 8 — Performance & Polish (Day 10–12)
**Goal:** Lighthouse scores and visual polish

```
[ ] 61. Image optimisation audit
        All images use next/image
        Correct srcset sizes attributes on every image
        WebP format for all images in public/images/

[ ] 62. Animation audit
        All motion components check useReducedMotion()
        No animation on xs/sm (mobile) for performance-heavy effects
        Parallax disabled on touch devices

[ ] 63. Font loading audit
        Only needed weights/styles loaded per page
        font-display: swap on all fonts

[ ] 64. Run next build — fix any build errors
[ ] 65. Run Lighthouse on homepage
        Target: Performance 90+, Accessibility 95+, SEO 100

[ ] 66. Cross-browser test (Chrome, Safari, Firefox)
[ ] 67. Cross-device test (iPhone SE, iPhone 15, iPad, MacBook, 4K)

[ ] 68. Accessibility audit
        All images have meaningful alt text
        Focus states visible and branded (gold outline)
        Keyboard navigation works through all interactive elements
        ARIA labels on carousel controls, mobile menu button
```

---

## Component Render Mode Summary

| Component | Mode | Directive |
|-----------|------|-----------|
| `RootLayout` | Server | — |
| `MarketingLayout` | Server | — |
| `Navigation` | Server | — |
| `MobileMenuButton` | Client | `'use client'` |
| `MobileMenuOverlay` | Client | `'use client'` |
| `Footer` | Server | — |
| `NewsletterForm` | Client | `'use client'` |
| `Container` | Server | — |
| All `_components/ui/*` | Server | — |
| All `_components/sections/*` | Server | — |
| All `_components/motion/*` | Client | `'use client'` |
| `MasonryGrid` | Client | `'use client'` |
| `InspirationGrid` | Client | `'use client'` |
| `ImageGallery` (product) | Client | `'use client'` |
| `AddToCart` (product) | Client | `'use client'` |
| `app/error.tsx` | Client | `'use client'` (required by Next.js) |

---

## Dependencies to Install

```bash
# Already in project: next, react, react-dom, typescript, tailwindcss, @tailwindcss/postcss
npm install framer-motion      # Animation
npm install clsx               # Class merging utility for cn()
```

No other external UI libraries. All components are custom-built to match the ODSArts design system.

---

## Key Constraints to Enforce

1. **No third-party UI libraries** (no shadcn, no radix, no headless-ui) — brand requires custom components
2. **No `tailwind.config.ts`** — Tailwind v4 uses CSS `@theme` only
3. **Framer Motion always in `'use client'` files** — never directly in Server Components
4. **`params` must be awaited** in dynamic routes — Next.js 16 requirement
5. **`next/image` for all images** — `priority={true}` on LCP images (hero, above fold)
6. **Gold appears max 3× per viewport** — enforce during review (from Design Law 5)
7. **No `console.log` in Server Components** — use `server-only` package for sensitive data files
8. **Mobile-first CSS** — base Tailwind classes target mobile, `md:` and up enhance
