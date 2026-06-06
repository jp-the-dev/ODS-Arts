# ODSArts — Working Stack & UI Development Status

> **Document Purpose:** This document acts as the definitive record of the active technology stack being used for ODSArts, as well as a chronological log of all frontend UI development completed to date.

---

## 1. The Working Tech Stack

We are strictly following a cutting-edge, highly optimized frontend stack. All architectural decisions prioritize performance (LCP/CLS), cinematic animations, and developer experience.

### Core Frameworks
*   **Next.js (App Router):** v16.2.6 Turbopack — SSR, streaming, and App Router with route groups `(marketing)` and `(shop)`.
*   **React 19+:** Server Components by default. `'use client'` only where strictly required (Framer Motion, refs, event listeners, state).
*   **TypeScript:** Strict typing across the entire codebase. Zero TS errors enforced.

### Styling & UI
*   **Tailwind CSS v4:** All design tokens (colors, typography, spacing, animations) defined in `@theme {}` inside `src/app/globals.css`. **No `tailwind.config.ts`** — v4 handles this natively in CSS.
*   **Framer Motion 12:** For parallax (`useScroll` + `useTransform`), hover effects (`whileHover`), and drawer/modal transitions (`AnimatePresence`).
*   **Native CSS Animations:** For above-the-fold entry animations (`animate-fade-up`) to bypass Next.js back-navigation hydration bugs.
*   **`useScrollReveal` hook:** Direct DOM style mutation via `IntersectionObserver` — the only safe scroll-reveal pattern for Next.js App Router (see `agents/issues-and-resolutions.md`).

### Architecture Structure

```
src/
├── app/                        ← Next.js App Router
│   ├── (marketing)/            ← Public pages: /, /collections, /about, /inspiration, /wishlist, /gifting
│   ├── (shop)/                 ← Transactional pages: /cart, /checkout
│   ├── api/                    ← Route handlers: /api/contact, /api/newsletter
│   └── globals.css             ← Tailwind v4 @theme tokens (single source of truth)
│
├── components/                 ← UI — grouped by feature
│   ├── cart/                   ← CartPageItems, CartOrderSummary
│   ├── checkout/               ← CheckoutForm, CheckoutOrderSummary
│   ├── collections/            ← CollectionStoryBlock
│   ├── hero/                   ← HeroSection, HeroContent, HeroVideo, HeroReveal, etc.
│   ├── layout/                 ← Navigation, Footer, CartDrawer, FloatingNavigation, Container, SearchDrawer
│   ├── lifestyle/              ← HomeStoryBlock
│   ├── motion/                 ← All Framer Motion client wrappers (FadeUp, ParallaxImage, etc.)
│   ├── product/                ← ProductConfigurator, FrameCard, FrameGrid, FilterPanel,
│   │                               PriceRangeSlider, QuickViewModal, QuickViewTrigger,
│   │                               WishlistButton, CollectionProductZone
│   ├── sections/               ← All homepage sections (FeaturedCollections, Craftsmanship, etc.)
│   └── ui/                     ← Atoms: Button, GoldRule, EyebrowLabel, SectionHeader, etc.
│
├── lib/                        ← Shared utilities — primarily the e-commerce data layer
│   ├── api/client.ts           ← apiFetch() — typed fetch wrapper used by all services
│   ├── config/                 ← animations.ts, theme.ts, breakpoints.ts, seo.ts
│   ├── data/collections.ts     ← Static editorial collection data (used by marketing pages)
│   ├── fonts.ts                ← next/font/google instances (Cormorant + Jost)
│   ├── mock/products.ts        ← 9 mock products (3 collections × 3 frame profiles)
│   ├── services/
│   │   ├── products.ts         ← Mock-aware product service (getProductsByCollection, getFilteredProducts, etc.)
│   │   └── search.ts           ← searchProducts() — mock JS filter | real: GET /search?q=
│   ├── store/
│   │   ├── cart.tsx            ← CartProvider (Context + useReducer + localStorage)
│   │   └── wishlist.tsx        ← WishlistProvider (Context + useReducer + localStorage, account-ready)
│   ├── types/
│   │   ├── product.ts          ← Rich e-commerce types: Product, Variant, Finish, CartItem
│   │   └── filters.ts          ← ProductFilterParams, SortKey, serializeFilters, deserializeFilters
│   └── utils.ts                ← cn(), formatPrice(), truncate()
│
├── providers/
│   └── QuickViewProvider.tsx   ← Context + lazy-loaded QuickViewModal (openQuickView/closeQuickView)
│
├── services/                   ← API service layer (real API calls via apiFetch)
│   ├── collections.service.ts  ← getCollections(), getCollectionBySlug() [scaffolded, ready]
│   ├── orders.service.ts       ← placeOrder(), buildOrderRequest() [mock-aware]
│   ├── products.service.ts     ← getProducts(), getProductBySlug() [scaffolded, ready]
│   └── testimonials.service.ts ← getTestimonials() [scaffolded, ready]
│
├── types/
│   └── index.ts                ← Editorial types: Product, Collection, Testimonial, PlaceOrderRequest
│
├── constants/index.ts          ← BRAND, COLORS, NAV_LINKS, PROCESS_STEPS
└── hooks/useScrollReveal.ts    ← IO-based direct DOM scroll reveal (back-nav safe)
```

### Known Architecture Patterns (Critical Rules)

> **Scroll Reveal:** NEVER use `whileInView` or `initial+animate` for section reveals — both break on Next.js back-navigation. Use `useScrollReveal` hook only.

> **Internal Links:** NEVER use `<a>` tags. Always use `<Link>` from `next/link`. Plain anchors break React hydration on back-navigation (Bfcache issue).

> **Framer Motion is SAFE for:** `useScroll + useTransform` (parallax), `whileHover`, `AnimatePresence` (drawers/modals).

> **Mock vs Real API:** Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env.local` to switch the entire data layer from mock to Laravel API. No UI code changes required.

> **URL as state:** All filter/sort/search state lives in URL searchParams via `useSearchParams` + `useRouter`. Never useState alone for filters — it makes pages unshare-able and breaks back navigation.

> **Wishlist pattern:** Stores product slugs only in localStorage. When accounts go live, add `useEffect` to hydrate from `GET /wishlist` — hook API stays identical.

---

## 2. Frontend Development Progress

### Phase 1: Theme & Foundation [COMPLETED]
*   Transitioned from dark moody to **Luxury Ivory / White Jet** editorial aesthetic.
*   Full design token system in `globals.css` (`@theme {}`) — colors, typography, spacing, animations.
*   Google Fonts (Cormorant + Jost) via `next/font`. Fluid clamp-based type scale.
*   `suppressHydrationWarning` on root layout.

### Phase 2: Core Layout [COMPLETED]
*   Responsive fixed Navigation bar — transparent over hero → frosted-glass ivory on scroll.
*   Footer with newsletter form.

### Phase 3: Screen 1 — Hero [COMPLETED]
*   Full-bleed luxury marble image as LCP.
*   CSS radial-gradient scrim behind text.
*   Ivory Bloom parallax — ivory overlay swallows the image on scroll.
*   Staggered CSS `animate-fade-up` entry animations (back-nav safe).

### Phase 4: Screen 2 — Brand Statement [COMPLETED]
*   Large editorial manifesto quote with walnut italic accents.
*   3-column pillars grid (Handcrafted, Premium Materials, Made to Last).
*   Material tag strip (Walnut, Oak, Brass, Museum Glass).
*   Editorial pull quote blockquote.

### Phase 5: Screen 3 — Featured Collections [COMPLETED]
*   Anti-ecommerce magazine-spread layout.
*   `CollectionStoryBlock.tsx` — alternating image left/right layout.
*   3 AI-generated museum-quality images (Walnut, Gallery, Heritage).
*   `useScrollReveal` scroll-triggered reveals + parallax image drift.

### Phase 6: Screen 4 — Craftsmanship [COMPLETED]
*   Workshop editorial layout with cinematic parallax header image.
*   4-step staggered masonry grid (Material Selection → Final Inspection).

### Phase 7: Screen 5 — Customer Homes [COMPLETED]
*   Full-bleed editorial lifestyle blocks (Ahmedabad, Surat, Mumbai).
*   Story-driven captions with Space Name, Location, Client lockup.

### Phase 8: Screen 6 — Final Editorial CTA [COMPLETED]
*   `FinalCTASection.tsx` — "Preserve What Matters" + single CTA.
*   Floating Navigation Orb (bottom-right, appears after scroll > 800px).
*   Luxury bottom-up drawer with staggered menu items + backdrop blur.

### Phase 10: Story Pages (`/about` & `/inspiration`) [COMPLETED]
*   `AboutHero.tsx` + reused `CraftsmanshipSection.tsx`.
*   `InspirationGallery.tsx` — filterable masonry layout with Framer Motion `layoutId`.
*   4 AI-generated interior renders (minimal, warm, gallery, workspace).

### Phase 11: E-Commerce Product Pages [COMPLETED]
*   Mock-first service architecture: `lib/types/product.ts` → `lib/mock/products.ts` → `lib/services/products.ts`.
*   `CartProvider` — React Context + useReducer + localStorage persistence.
*   `CollectionProductZone.tsx` — horizontal scrollable frame selector rail.
*   9 mock products: Walnut (Classic/Slim/Box Float), Gallery (Classic/Float/Ledge), Heritage (Grand/Slim/Noir).
*   `CartDrawer.tsx` — slide-in animated drawer with qty stepper, remove, subtotal.
*   `ProductConfigurator.tsx` — size grid, finish swatches, qty, add-to-cart, accordion details.

### Phase 12: Collections Index [COMPLETED]
*   `/collections/page.tsx` — hybrid server (editorial header) + client (`FrameGrid.tsx`).
*   `FrameGrid.tsx` — URL-synced multi-axis filtering + sort with Framer Motion layout animations.
*   `FrameCard.tsx` — 3:4 aspect ratio, hover scale, animated underlines, stock badges, pricing.
*   Deep-linking: `/collections/[slug]?frame=[frame_slug]` pre-selects frame on collection detail.

### Phase 13: Cart & Checkout Pages [COMPLETED]
*   **CartProvider moved to root `layout.tsx`** — now accessible to both `(marketing)` and `(shop)` route groups.
*   **`(shop)/layout.tsx`** — minimal checkout-style nav (logo, back link, secure badge). Ivory background, clean checkout experience.
*   **`/cart` page** — full-page 2-column layout (items left, sticky order summary right). Animated item removal, qty stepper, editorial empty state.
*   **`/checkout` page** — 3-section luxury form (Contact / Delivery Address / Order Confirmation) + client-side validation + success screen with animated gold checkmark + order reference number.
*   **`services/orders.service.ts`** — mock-aware order service (`placeOrder()`, `buildOrderRequest()`). Flip `NEXT_PUBLIC_USE_MOCK_DATA=false` to go live with Laravel `POST /orders`.
*   **`types/index.ts`** — added `PlaceOrderRequest`, `PlaceOrderResponse`, `OrderStatus` types matching Laravel API contract.

### Phase 14: Custom Framing Configurator (`/custom-framing`) [COMPLETED]
*   Full-screen dark studio mode — warm charcoal split layout. Left panel live preview, right panel animated wizard.
*   `FramePreview.tsx` — Live CSS-only frame mockup. Updates real-time with every step selection.
*   `StepProgressBar.tsx` — Gold gradient fill bar + clickable completed steps to go back.
*   5 steps: Artwork upload → Size → Mat → Frame Material → Review & Request Quote.
*   `services/customFraming.service.ts` — mock-aware `placeQuoteRequest()`. Flip flag → POSTs to Laravel.
*   Responsive fix: Left panel no longer overlaps nav on 14" screens. Sticky scroll handled correctly.

### Phase 15: E-Commerce UX Layer [COMPLETED — June 2026]

#### 15A — URL-Synced Advanced Filters
*   **`lib/types/filters.ts`** — `ProductFilterParams` type + `serializeFilters`/`deserializeFilters` URL helpers.
*   **`lib/services/products.ts`** — Added `getFilteredProducts()`: mock JS filter | real: `GET /products?c=walnut&sort=price_asc&min=...`
*   **`FilterPanel.tsx`** — Luxury sticky sidebar (desktop) + slide-in drawer (mobile). Sections: Sort (5 options), Collection (multi-select pills), Size (chip grid), Price Range (dual slider), In-Stock toggle. Active filter count badge. "Clear all" button.
*   **`PriceRangeSlider.tsx`** — Custom dual-handle slider with gold fill track. 300ms debounced URL update.
*   **`FrameGrid.tsx`** — Fully rebuilt. Filters now live in URL (`useSearchParams` + `useRouter`). Active filter chips strip with per-chip × clear. Animated result count. New 2-col layout: FilterPanel sidebar + product grid.
*   Filters are **shareable, bookmarkable, SEO-crawlable** — URL reflects exact state.

#### 15B — Global Search
*   **`lib/services/search.ts`** — `searchProducts()`: mock JS filter (name + tagline + materials) | real: `GET /search?q=`.
*   **`SearchDrawer.tsx`** — Full-screen dark overlay search. 200ms debounced live results. Thumbnail cards with name/series/price. Keyboard navigation (↑↓ Enter Esc). "View all N results" → pushes `?q=` to `/collections`. Empty state with CTA.
*   **`Navigation.tsx`** — Search icon (🔍) added to nav bar. Cart bag icon (🛍) added with live gold count badge. Both always visible on mobile + desktop.

#### 15C — Quick View Modal
*   **`QuickViewProvider.tsx`** — Context + lazy-loaded modal (`dynamic()` import). `openQuickView(product)` / `closeQuickView()` hooks.
*   **`QuickViewModal.tsx`** — 2-column dark blurred modal: left = product images (hero + lifestyle thumbnail), right = full `ProductConfigurator` with add-to-cart. Escape / backdrop to close. Body scroll locked.
*   **`QuickViewTrigger.tsx`** — Thin `'use client'` wrapper button that calls context. Slides up from bottom of card image on hover.
*   **`FrameCard.tsx`** — Updated with Quick View slide-up button + Wishlist icon overlay.

#### 15D — Wishlist (localStorage, account-ready)
*   **`lib/store/wishlist.tsx`** — `WishlistProvider`: Context + useReducer + localStorage. Stores product slugs only. Account-ready: when user accounts go live, add `useEffect` to sync from `GET /wishlist` — hook API stays identical.
*   **`WishlistButton.tsx`** — Two variants: `icon` (card image overlay) + `full` (text+heart row in ProductConfigurator). Animated Framer Motion heart fill on toggle.
*   **`/wishlist/page.tsx`** — Editorial wishlist page with animated grid. Empty state with gold heart icon + "Start Exploring" CTA.
*   WishlistProvider + QuickViewProvider added to root `layout.tsx` alongside CartProvider.

#### 15E — Bug Fixes
*   Cart drawer quantity number was invisible (inherited `text-ivory` from root body). Fixed by adding `text-obsidian` to the qty `<span>`.

### Phase 16: Art Collection [COMPLETED — June 2026]

#### 16A — Architecture & Types
*   **`lib/types/art.ts`** — `ArtProduct`, `ArtMaterialVariant`, `ArtCategory`, `PrintMaterial`, `ArtStyle`.
*   **`lib/types/product.ts`** — `CartItem` converted to a discriminated union with `itemType: 'frame' | 'art'` to support a mixed cart.
*   **`lib/types/filters.ts`** — Extended with `ArtFilterParams` (materials, art styles).
*   **`types/index.ts`** — Modified `PlaceOrderRequest` to allow `finishId` to be nullable, aligning with art products lacking finish options.

#### 16B — UI Components & Pages
*   **`src/components/art/`** — Created `MaterialSelector`, `ArtCard`, `ArtGrid`, `ArtCategoryCard`, `ArtConfigurator`.
*   **`/art` hub** — Editorial hub showcasing 6 art categories with placeholder AI images.
*   **`/art/[categorySlug]`** — Category detail page displaying a grid of art within that category.
*   **`/art/[categorySlug]/[artSlug]`** — Individual art product configurator (material + size selector).
*   **`/collections` update** — Replaced static grid with `CollectionsTabs` component allowing users to toggle between Frames and Art collections.
*   **Global Search Update** — Modified `searchGlobal` and `SearchDrawer` to return unified results, enabling keyboard navigation across mixed frames/art.

#### 16C — Services & Mock Data
*   **`lib/mock/art.ts` & `lib/data/artCategories.ts`** — Seeded 18 mock art items across 6 categories.
*   **`lib/services/art.ts`** — Mock-aware art service (`getArtByCategory`, `getFilteredArt`, `getAllArt`, `getArtBySlug`).

### Phase 17: Homepage Art Teaser + FloatingNavigation [COMPLETED — June 2026]

#### 17A — ArtCollectionTeaser Section (`src/components/sections/ArtCollectionTeaser.tsx`)
*   New full-width section placed between `FeaturedCollectionsSection` and `CraftsmanshipSection` on the homepage.
*   Uses a **warm linen background** (`#EDE8DF`) with soft gradient edges blending into the surrounding ivory — avoids the jarring dark-to-light cut that the first version had.
*   Shows all 6 art categories as a **horizontally draggable card strip** (Framer Motion `drag="x"`).
*   Section header and each card use `useScrollReveal` (IO-based, back-nav safe) with staggered delays.
*   Card images use Framer Motion `whileHover={{ scale: 1.06 }}` only (safe pattern — not an entry animation).
*   Bottom row: category quick-links + obsidian "View All Art Prints" CTA button.

#### 17B — FloatingNavigation Update (`src/components/layout/FloatingNavigation.tsx`)
*   Added `{ label: 'Art', href: '/art' }` to `MENU_ITEMS` between `Collections` and `Custom Framing`.
*   The orb drawer now gives users a direct path to the Art vertical from anywhere on the page after scrolling 800px.

---

## 3. Backend API Contract (For Laravel Developer)

When `NEXT_PUBLIC_USE_MOCK_DATA=false`, the frontend calls:

| Endpoint | Method | Purpose |
|---|---|---|
| `GET /products` | GET | All products (no filter) |
| `GET /products?c=walnut,gallery&s=8x10&sort=price_asc&min_price=50000&max_price=200000&stock=1&page=1` | GET | Filtered + paginated frames |
| `GET /search?q={query}&limit=6` | GET | Full-text search across frames and art |
| `GET /products/:slug` | GET | Single product by slug |
| `GET /collections/:slug/products` | GET | Products in a collection |
| `GET /art` | GET | All art |
| `GET /art/categories` | GET | All art categories |
| `GET /art/categories/:slug/products` | GET | All art in a category |
| `GET /art/:slug` | GET | Single art product |
| `GET /art?style=cultural&material=canvas&sort=price_asc` | GET | Filtered + paginated art |
| `POST /orders` | POST | Place an order (supports mixed cart) |
| `POST /custom-framing/quotes` | POST | Place a custom framing quote request |

**Filter query params Laravel should support (Frames):**
- `c` — comma-separated collection slugs: `walnut,gallery,heritage`
- `s` — pipe-separated size labels: `8" × 10"|11" × 14"`
- `min_price` / `max_price` — integers in paise
- `stock` — `1` = in-stock only
- `sort` — `recommended | price_asc | price_desc | newest | delivery_asc`
- `page` / `per_page` — pagination
- `q` — full-text search string

**Filter query params Laravel should support (Art):**
- `style` — comma-separated: `cultural,modern,automotive`
- `material` — comma-separated: `canvas,photo-paper,fine-art`
- `size` — pipe-separated size labels
- `min_price` / `max_price` — paise (cheapest combo)
- `stock` — `1`
- `sort` — `recommended | price_asc | price_desc | newest`
- `q` — full-text search

---

## 4. Pending Roadmap

### Phase 18: Gifting Page (`/gifting`) [PLANNING]
**Goal:** Editorial landing page — gifting hero, 3 curated gift sets, corporate gifting section with lead form, gift process timeline.

### Phase 19: Products Listing Page (`/products`) [NEXT]
**Goal:** Flat all-products listing (not grouped by collection). Uses the same FrameGrid + FilterPanel.

### Phase 20: Responsiveness Audit [COMPLETED — June 2026]
- Added `overflow-x: hidden` globally to prevent mobile horizontal scroll
- Added `touch-pan-x` to Art Teaser drag container for smooth native scrolling
- Fixed FilterPanel z-index layering to correctly sit above navigation
- Refined Custom Framing wizard layout on mobile (hide live preview panel, show only steps)
- Fixed ArtConfigurator layout (qty stack, size grid)

### Phase 21: Performance & SEO Polish [COMPLETED — June 2026]
- Added root-level `sitemap.ts` mapping all static routes, collections, and dynamic art PDPs
- Added complete `robots.ts` disallowing `/cart` and `/checkout`
- Exported rich metadata from Homepage (`/`), Collection PDPs, and Art PDPs
- Added `noindex` metadata to `/wishlist` via new layout wrapper
- Added JSON-LD Organization schema (root layout) and Product schema (Art PDPs)
- Generated brand-styled dynamic OG images for `/collections` and `/art` routes
- Optimized LCP images (Collection hero) from `<img>` to `<Image priority sizes="100vw">`

---

## 4. Pending Roadmap

### Phase 22: Gifting Page (`/gifting`) [PLANNING]
**Goal:** Editorial landing page — gifting hero, 3 curated gift sets, corporate gifting section with lead form, gift process timeline.

### Phase 23: Products Listing Page (`/products`) [NEXT]
**Goal:** Flat all-products listing (not grouped by collection). Uses the same FrameGrid + FilterPanel.

---

## 5. Backend Integration Checklist (When Laravel is Ready)

| What | How |
|---|---|
| Product data (real) | Set `NEXT_PUBLIC_USE_MOCK_DATA=false` — `lib/services/products.ts` auto-switches |
| Filtered products | Same flag — `lib/services/products.ts::getFilteredProducts()` passes URL query params |
| Search | Same flag — `lib/services/search.ts::searchProducts()` hits `GET /search?q=` |
| Order submission | Same flag — `services/orders.service.ts` routes to `POST /orders` |
| Custom framing quote | Same flag — `services/customFraming.service.ts` routes to `POST /custom-framing/quotes` |
| Wishlist server sync | Add `useEffect` in `WishlistProvider` calling `GET /wishlist` on mount (authenticated users) |
| Cart server sync | Add `useEffect` in `CartProvider` calling `GET /cart` on mount + `POST /cart/sync` on mutation |
| Newsletter | Wire `src/app/api/newsletter/route.ts` to Laravel endpoint |
| Contact form | Wire `src/app/api/contact/route.ts` to Laravel endpoint |
| Collections/Testimonials | `src/services/collections.service.ts` + `testimonials.service.ts` are scaffolded and ready |
