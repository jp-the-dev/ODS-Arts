# ODSArts — Working Stack & Development Status

> **Document Purpose:** The definitive record of the active technology stack for ODSArts and a chronological log of development completed to date — **frontend and backend**. Both stacks now live in one repository and are owned by the same team; see the root `CLAUDE.md` for the working flow.
>
> **Status at a glance (Aug 2026):** the platform is feature-complete end to end — browse, product pages, cart, guest or account checkout, Razorpay payment, confirmation email, fulfilment and tracking, with a full Filament admin. All 15 page routes are built and 43 API routes are registered. 5 of 6 data verticals run on Laravel; only custom-framing quotes still use fixtures. Covered by **242 Pest feature tests** and **32 Vitest frontend tests**. What remains before launch is configuration, not code — see §3.2b for accepted limitations.

---

## 1. The Working Tech Stack

We are strictly following a cutting-edge, highly optimized frontend stack. All architectural decisions prioritize performance (LCP/CLS), cinematic animations, and developer experience.

### Backend (repo root)
*   **Laravel 13** on **PHP 8.5** — storefront REST API under `/api/v1`, all routes public (no auth on the storefront).
*   **Filament v4** — admin panel at `/admin`, backed by Livewire 3.
*   **MySQL** — database `laravel_api`; money stored as integer paise (`*_in_paise`, but `base_price_paise` / `price_delta_paise` on variants and finishes — see §3.6).
*   **Pest v4** + **Pint** — test runner and formatter. 242 feature tests cover the live API (`php artisan test --compact`); run `vendor/bin/pint --dirty --format agent` after PHP changes.
*   **Laravel Boost v2 / MCP** — agent tooling; its rules live in the root `AGENTS.md`.

### Core Frameworks (frontend)
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
│   │   ├── auth.tsx            ← AuthProvider (Sanctum token, user hydration)
│   │   ├── cart.tsx            ← CartProvider (localStorage, merged with the server on sign-in)
│   │   └── wishlist.tsx        ← WishlistProvider (localStorage + server sync, frames and art)
│   ├── types/
│   │   ├── product.ts          ← Rich e-commerce types: Product, Variant, Finish, CartItem
│   │   └── filters.ts          ← ProductFilterParams, SortKey, serializeFilters, deserializeFilters
│   └── utils.ts                ← cn(), formatPrice(), truncate()
│
├── providers/
│   └── QuickViewProvider.tsx   ← Context + lazy-loaded QuickViewModal (openQuickView/closeQuickView)
│
├── services/                   ← Transactional services (catalogue reads live in lib/services)
│   ├── customFraming.service.ts← quote requests [mock until the endpoint ships]
│   ├── orders.service.ts       ← placeOrder(), buildOrderRequest()
│   └── payment.service.ts      ← Razorpay: startPayment(), verifyPayment(), payForOrder()
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

> **Wishlist pattern:** Stores slugs plus the catalogue each came from, in localStorage, merged with `GET /auth/wishlist` on sign-in. A slug can exist in both catalogues, so the type is what decides how it resolves.

---

## 2. Frontend Development Progress

**Route status — 15 `page.tsx` files, all 15 built**, plus `/login`, `/register`,
`/account` and `/orders/[reference]`. Production build is green: 57 static pages,
TypeScript clean, and **0 ESLint errors or warnings**. Frontend tests:
`npm test` (Vitest, 32 tests over the cart, auth and wishlist stores).

| Built | Stub (returns empty `<main />`) |
|---|---|
| `/`, `/about`, `/inspiration`, `/collections`, `/collections/[slug]`, `/art`, `/art/[categorySlug]`, `/art/[categorySlug]/[artSlug]`, `/products`, `/products/[slug]`, `/gifting`, `/custom-framing`, `/cart`, `/checkout`, `/wishlist` | — |

Known lint debt (pre-existing, not build-breaking): 9 ESLint errors — React
Compiler memoization bailouts in `ArtGrid`/`ArtConfigurator`, `setState`-in-effect
in `SearchDrawer`/`PriceRangeSlider`, and 3 `any` types in `SearchDrawer`.

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

## 3. Backend Development Progress

Laravel 13 + Filament v4 at the repo root. ~2,270 lines of PHP across 7 models,
7 API controllers, 5 API resources, 5 Filament resources and 12 migrations.

**Completeness: 10 routes live, 3 of the 13 endpoints the frontend contract asks
for (§3.3) are served; 2 of 6 data verticals are wired end to end.** The
foundation — schema, resource layer, admin, seeders — is solid and idiomatic.
What is missing is whole verticals and a test suite, not polish.

### 3.1 What is built [COMPLETED]

**Domain & schema** — 12 migrations, all run.

| Model | Table | Notes |
|---|---|---|
| `Collection` | `collections` | Editorial fields (`display_number`, `eyebrow`, `long_description`, `materials[]`, `features[]`, image positioning), `active()` scope, `hasMany(Product)` |
| `Product` | `products` | Belongs to collection; `price_in_paise`, `care_instructions[]`, `materials[]`, `dimensions`; `active()` + `featured()` scopes |
| `ProductImage` | `product_images` | Ordered by `sort_order` |
| `FrameOption` | `frame_options` | wood / mat / glass with `price_modifier_in_paise` |
| `Testimonial` | `testimonials` | Optional product relation |
| `Enquiry` | `enquiries` | Types: contact, custom_framing, gifting; status workflow |
| `User` | `users` | Filament admin auth |

**API — 10 routes live under `/api/v1`** (all verified returning 200):

| Endpoint | Status |
|---|---|
| `GET /collections`, `GET /collections/{slug}` | ✅ active scope, ordered, embeds products + images |
| `GET /products`, `/products/featured`, `/products/{slug}` | ✅ eager-loads images + collection; 404 JSON on miss |
| `GET /frame-options` | ✅ grouped `{wood, mat, glass}`, 13 options seeded |
| `POST /framing/calculate-price` | ✅ validates slugs against `frame_options`, returns breakdown |
| `GET /testimonials` | ✅ |
| `POST /enquiries` | ✅ validated, persists, 201 + message |
| `POST /newsletter/subscribe` | ✅ persists to `subscribers`, idempotent on repeat signup |

**Admin (Filament v4)** — panel at `/admin` with full CRUD for Collections,
Products, Enquiries, plus simple managers for Frame Options, Testimonials and
Subscribers. Forms/tables/infolists are split into `Schemas/` + `Tables/` per
Filament v4 convention.

**Seed data** — `CollectionSeeder` (3 collections → 9 products → 27 images),
`FrameOptionSeeder` (13 wood/mat/glass), `TestimonialSeeder` (6). Factories exist
for Collection, Product, ProductImage, FrameOption, Enquiry, Testimonial,
Subscriber and User.

**Test suite** — 91 Pest feature tests / 273 assertions covering all 10 live
endpoints, in `tests/Feature/Api/`. SQLite in-memory with `RefreshDatabase`
(enabled in `tests/Pest.php`). Run with `php artisan test --compact`.

### 3.2 Known backend gaps & defects

Ordered by impact. These are ours to fix.
**All nine are now closed.** Items 1, 2, 5 and 8 in the B1+B2 pass (§3.4);
3 and 7 in B3 (§3.5); 4 in B4 (§3.6); 9 in the routes pass; and 6 and 7b in the
final cleanup — `price_in_paise` is now published alongside the rupee float, and
`/collections` and `/testimonials` gained the same opt-in pagination as
`/products`. Schema drift (§3.7) was resolved by the port in §3.8.

### 3.2b Known limitations (accepted, not defects)

- **Soft 404 on unknown collection and art slugs.** They render the not-found
  page but answer HTTP 200, because Next caches the `notFound()` result as a
  prerendered page under ISR. `dynamicParams = false` fixes the status but makes
  any item added in the admin after the last build unreachable while the
  hourly-revalidated listings still link to it — a worse failure. Revisit if
  publishing ever triggers a deploy. `/products/[slug]` does return a true 404.
- **`getFilteredProducts()` has no callers.** `FrameGrid` filters an in-memory
  array, which is instant at this catalogue size. The server-side filter it would
  call is implemented and tested; wire it up when the catalogue outgrows one fetch.
- **The Razorpay widget has never run against live keys.** The payment path is
  proven end to end against a stubbed Razorpay, but the hosted checkout itself
  needs real test credentials.

### 3.4 B1 + B2 — Test Suite & Data Integrity [COMPLETED — Aug 2026]

**B2 — seeded frame options + newsletter persistence**
- Ran `FrameOptionSeeder` → 13 rows. `GET /frame-options` now returns populated
  wood/mat/glass groups, and `calculate-price` can finally match a slug
  (verified: base ₹1499 + Walnut Dark ₹20 + Museum UV ₹80 = ₹1599).
- Added `Subscriber` model + `subscribers` migration (unique email, status enum,
  `subscribed_at` / `unsubscribed_at`) and a `subscribed()` scope.
- `NewsletterController` now persists via `updateOrCreate` instead of `Log::info`.
  Idempotent by design: a repeat signup re-activates rather than hitting the unique
  constraint, so the form never 500s for a returning visitor.
- Added `SubscriberResource` + `ManageSubscribers` Filament page at
  `/admin/subscribers`, with a status badge and filter.

**B1 — Pest feature suite**
- Enabled `RefreshDatabase` in `tests/Pest.php` (it was commented out).
- Added the missing factories: `EnquiryFactory` (with `customFraming()`,
  `gifting()`, `read()` states), `FrameOptionFactory` (`mat()`, `glass()`,
  `withModifier()`, `inactive()`), plus `ProductImageFactory` and `SubscriberFactory`.
- **52 tests / 168 assertions** across 7 files in `tests/Feature/Api/`, covering
  every live endpoint: active/inactive scoping, sort order, resource shape, 404
  paths, validation failures, price maths (including negative modifiers and the
  clamp at zero), and newsletter idempotency.
- Suite verified to have teeth by mutation: removing `Testimonial::active()`
  correctly fails `it excludes inactive testimonials`.

### 3.5 B3 — Product Filtering, Sorting & Pagination [COMPLETED — Aug 2026]

`ProductController@index` now implements the full frame filter contract (§3.3)
instead of ignoring every query param. Verified live against the 9 seeded products:
`?c=walnut` → 3, `?sort=price_asc` → ascending, `?min=700000&max=1000000` → 4,
`?q=heritage` → 3, `?per_page=4` → `meta.total 9, last_page 3`, `?sort=bogus` → 422.

Two deliberate design decisions worth knowing:

- **Pagination is opt-in.** Adding `->paginate()` unconditionally would have
  silently truncated `getAllProducts()` to the first 15 rows and changed the
  response envelope for every existing caller. Without `page`/`per_page` the full
  collection is returned exactly as before.
- **Unknown params are rejected, not ignored.** `sort`, `min`, `max`, `per_page`
  and `stock` are validated, so a typo returns 422 rather than silently
  unfiltered results — the failure mode this endpoint had before.

`stock=1` is accepted but does not filter: there is no stock column until B4.
Documented in the controller docblock rather than left as a silent no-op.

**Frontend:** fixed the `getFilteredProducts()` landmine flagged in §6 — its
real-API branch returned the raw snake_case payload typed as `Product[]` without
running `toFrontendProduct()`. It now maps like every other path, so the function
is safe to wire into the `/products` page (Phase 23).

**Tests:** +28 (80 total, 233 assertions) in `tests/Feature/Api/ProductFilterApiTest.php`
— each filter alone and combined, all five sorts, opt-in pagination, filters
surviving pagination, and every validation rejection.

### 3.6 B4 — Variant Model [COMPLETED — Aug 2026]

⚠️ **Read §3.7 first — this work uncovered significant schema drift.**

`product_variants` and `finish_options` turned out to **already exist in the
database** (created 2026-06-06) with no migrations in this repo. The canonical
migrations were ported in from `temp_repo`; because their filenames already
appear in the `migrations` ledger, they register as *Ran* with nothing to apply.

- **Models:** `ProductVariant` (`inStock()` scope), `FinishOption`. `Product`
  gains `variants()` and a `finishOptions()` has-many-through, since finishes are
  defined per collection and shared by its products.
- **Canonical columns** are `base_price_paise` and `price_delta_paise` — not the
  `*_in_paise` convention used elsewhere. Neither table has `is_active`.
- **Resources:** `ProductVariantResource` + `FinishOptionResource`; `ProductResource`
  now emits `variants[]` and `finish_options[]`. Variant prices are **integer
  paise**, so the storefront no longer round-trips through a rupee float.
- **Filtering now uses variants:** `s` matches `variants.size_label`, `stock=1`
  keeps products with an in-stock variant, and price filter/sort use the
  *cheapest* variant via a correlated subquery that falls back to
  `products.price_in_paise` for variant-less rows.
- **`ProductVariantSeeder`** backfills a 4-size ladder + collection finishes, but
  only for products/collections that have none — it will not disturb the
  hand-authored catalogue already in the database.
- **Frontend:** `toFrontendProduct()` maps real variants and finishes.
  The fabricated single variant with hardcoded `stockQty: 10` /
  `weightGrams: 1000` is gone; the fallback for variant-less products now
  reports `stockQty: 0` rather than inventing availability.

**Bug caught by the tests, not by live checks:** query-string numbers bind as
strings, and SQLite compares an integer column against a text binding by type
affinity (integers sort before text), so every price filter silently matched
nothing or everything. MySQL coerces, so the live `curl` checks had passed. The
numeric params are now cast with `(int)` before binding.

**Tests:** +11 (91 total, 273 assertions) in `ProductVariantApiTest.php`, plus
`ProductFilterApiTest` reworked onto variants.

### 3.7 Schema drift: this repo vs. `temp_repo` vs. the database [RESOLVED — see §3.8]

Discovered during B4. **Resolved by the B5 port in §3.8** — kept here as the record
of what was wrong and why, since it explains several oddities in the codebase.

The MySQL database `laravel_api` has **30 migrations applied**. This repo contains
only 12 of them. The other 18 live in `/Users/samirchavda/Desktop/SAM/ODSARTS/temp_repo`
and were never brought across, which is why `php artisan migrate:status` here
looked clean while tables it has never heard of were already in use.

`temp_repo` additionally contains, and this repo does not:

| Area | In `temp_repo` |
|---|---|
| Art vertical (F1) | `art_categories`, `art_products`, `art_images`, `art_material_variants` + `ArtController`, `ArtCategoryController` |
| Orders / payments (F2) | `orders`, `order_items`, Razorpay fields |
| Search (F3) | `/search` route |
| Cart & wishlist | `carts`, `wishlist_items` + `CartController`, `WishlistController` |
| Accounts | `users.phone`, `addresses`, `oauth_providers` |
| Shipping | Shiprocket fields, `/shipping/rates`, webhooks |

Its `routes/api.php` declares **43 routes**. But it is *not* simply ahead:
it references 18 controllers and **11 of them are missing** (`ProductController`,
`CollectionController`, `EnquiryController`, `FramingController`, `AuthController`,
`OrderController`, `PaymentController`, `SearchController`, `ShippingController`,
`TrackingController`, `AddressController`) — four of which exist *here*. Its API
would not boot as-is.

So the two copies are **complementary and both incomplete**, over a shared database
that matches `temp_repo`'s schema. Also note `rename_collection_slugs_to_box_gallery_glass`
applied there — which is why seeded names say "The Box Frame Collection" while
`CollectionSeeder` in this repo still says "The Walnut Series".

**Resolved in §3.8.** The lesson worth keeping: the database ledger — not
`migrate:status` in one checkout — is the authority on what schema exists.

### 3.8 B5 — `temp_repo` Reconciliation [COMPLETED — Aug 2026]

Resolved the §3.7 drift by porting the missing work into this repo. Nothing was
rebuilt from scratch; existing improvements here were kept where they were ahead.

**Ported in**
- **16 migrations** → 31 total, `migrate:status` clean with **nothing pending**.
  Because the filenames already existed in the DB ledger they registered as *Ran*
  without re-executing, so live data was untouched.
- **10 models:** `ArtCategory`, `ArtProduct`, `ArtImage`, `ArtMaterialVariant`,
  `Order`, `OrderItem`, `Address`, `Cart`, `WishlistItem`, `OAuthProvider`.
- **4 controllers:** `ArtController`, `ArtCategoryController`, `CartController`,
  `WishlistController`.
- **9 API resources**, **7 form requests**, `CreateShiprocketOrderJob`,
  `OrderConfirmation` mail, and **7 factories**.

**Kept from this repo** (ours were ahead — deliberately *not* overwritten):
`NewsletterController` (persists to `subscribers`; theirs only logged),
`ProductController` (all of B3's filtering), `ProductVariant`/`FinishOption`
(ours add an `inStock()` scope), `Product` (ours adds the `finishOptions`
has-many-through), plus `CollectionController`, `EnquiryController`,
`FramingController` and every B1–B4 test.

**Merged by hand:** `User` gained `phone` + 5 relations; `Enquiry` gained
`metadata`; `CollectionResource` gained `finish_options`;
`CollectionController@products` was written to serve the long-missing
`/collections/{slug}/products`.

**Routes: 10 → 21.** All art routes, `/collections/{slug}/products`, and
auth-guarded cart/wishlist (verified 401 unauthenticated).

**The art vertical is now live.** The database already held **6 categories,
18 art products, 24 images and 360 material variants** — matching the fixtures
exactly. Added `toFrontendArt()` to map snake_case → camelCase, refactored
`getFilteredArt()` onto a shared `applyArtFilters()` helper (the old real-API
branch had the same untransformed-return landmine as `getFilteredProducts`), and
set `NEXT_PUBLIC_ART_API_READY=true`.

Verified by dependency, not just by a green build: with Laravel stopped
`npm run build` **fails**; with it running it generates all 45 pages. Art is
genuinely served by the API.

**Still to write — 7 controllers** referenced by the full route contract:
`AuthController`, `AddressController`, `OrderController`, `PaymentController`,
`SearchController`, `ShippingController`, `TrackingController`. Their models,
migrations, resources and form requests are all now present, and the routes are
listed as a commented block at the top of `routes/api.php`.

### 3.9 Orders & Guest Checkout [COMPLETED — Aug 2026]

**Before this, checkout was a simulation.** `placeOrder()` returned a fabricated
reference after a 1.2s delay and the success screen rendered — nothing was saved,
no stock moved, no payment taken. Any "order" was lost.

- **`allow_guest_orders` migration:** `orders.user_id` was NOT NULL, so buying
  required registering. Now nullable, with `email`/`phone` on the order for guest
  contact and lookup.
- **`OrderController@store`** — guest or authenticated (attaches to the user when
  a Sanctum token is present). Registered at `POST /api/v1/orders`.
- **Prices are recomputed server-side.** The client's `unitPricePaise` is never
  trusted; lines are priced from `product_variants` / `art_material_variants`.
  A tampered payload claiming ₹1 is charged the real price, and the response
  returns `subtotalMatchedClient: false` so the UI can flag drift.
- **Stock is checked and decremented** inside a transaction; an over-quantity
  order 422s and writes nothing.
- **Mixed frame + art carts** work. Art has no `products` row, so those lines
  store `product_id = null` with denormalised name/sku/options.
- **`OrderController@index/show`** — order history behind `auth:sanctum`,
  scoped to the owner (someone else's order number 404s).

**Serious bug caught by the tests:** `product_variants` and
`art_material_variants` auto-increment independently, so id 1 exists in both.
The first implementation resolved a line by id alone and matched the frame
table first — an art order would have been priced and shipped as a frame. The
payload now carries a required `itemType` (`frame|art`) that selects the table,
with a regression test asserting two same-id variants stay distinct.

**Verified live:** placed a real order against the seeded catalogue —
`ODS-TBIZRHIX`, ₹8,999, line stored with the right SKU, stock 10 → 9.

**Tests:** +16 (107 total, 326 assertions). `NEXT_PUBLIC_ORDERS_API_READY=true`.

### 3.10 P0 Production Blockers [COMPLETED — Aug 2026]

**1. Payments — `PaymentController` (Razorpay)**
- `POST /orders/{ref}/pay` creates a Razorpay order; `POST /orders/{ref}/verify`
  confirms the browser signature; `POST /webhooks/razorpay` is the authoritative
  server-to-server signal (the browser may close before /verify runs).
- Implemented over Laravel's HTTP client with `hash_hmac`, **no vendor SDK** —
  the project rules forbid adding dependencies without approval.
- **The amount always comes from the order row**, never the request, so a client
  cannot pay less than it owes. Signatures are compared with `hash_equals`.
- Idempotent: calling `/pay` twice reuses the existing `razorpay_order_id`.
- Guest orders are payable by reference (they have no account to authenticate
  against); an order owned by another signed-in user 404s.
- Returns a clear **503** when `RAZORPAY_KEY`/`SECRET` are unset rather than
  failing obscurely. **16 tests**, including forged-signature and wrong-secret
  rejection for both /verify and the webhook.

**2. Order confirmation email**
The ported `OrderConfirmation` mailable referenced `emails.order-confirmation`,
**a view that did not exist** — it would have thrown on first send. Created the
markdown view (line items, total, delivery address) and queued it from
`OrderController@store` inside a try/catch, so a mail failure can never break a
committed order. Verified by rendering it against a real order (15KB, correct
number and total) — `Mail::fake()` alone would not have caught a Blade error.

**3. Rate limiting** — there was none on any route.
Limiters in `AppServiceProvider`, keyed by user id when signed in, else IP:
`api` 120/min (catalogue), `orders` 10/min, `payments` 20/min, `forms` 5/min,
`webhooks` 120/min (must not throttle provider retries). Verified live: the 6th
contact submission returns 429 with `Retry-After`, catalogue reads unaffected.

**4. Production configuration**
Added `config('app.frontend_url')` and a documented `.env.example` covering
`FRONTEND_URL`, all Razorpay/Shiprocket keys, and a production checklist —
`APP_DEBUG=false`, a real `MAIL_MAILER` (`log` silently discards confirmations),
and the **queue worker requirement** (`php artisan queue:work`), since order
mail and the Shiprocket job are both queued. The local `.env` was left on its
dev values deliberately.

**Checkout widget wired (§3.11)** — the money path is complete end to end.

**Tests: 128 total, 418 assertions.**

### 3.11 Razorpay Checkout Integration [COMPLETED — Aug 2026]

`src/services/payment.service.ts` + `CheckoutForm` now complete the money path:
place order → `POST /orders/:ref/pay` → Razorpay widget → `POST /orders/:ref/verify`.

- **The order is created before payment**, so an abandoned or failed attempt
  leaves a recoverable `pending` order instead of losing the sale.
- `payForOrder()` never throws for a dismissed or declined payment — those
  resolve as `pending`. Only genuine errors surface as errors.
- A **503** (Razorpay keys unset) resolves as `unavailable`, not a crash, so the
  storefront keeps working before payments are configured.
- The success screen no longer claims payment was taken when it wasn't: it reads
  "Payment Received / Your order is confirmed" only on a verified payment, and
  otherwise explains what happens next.
- Script is injected on demand and de-duplicated; failure to load degrades to
  `pending` rather than a blank modal.

**Second security bug, caught by live end-to-end testing rather than unit tests:**
`/verify` set `payment_status = 'failed'` on any signature mismatch — *including
on an order that had already been paid*. Anyone could POST a forged signature to
a paid order and flip it to failed, corrupting a real payment. `/verify` now
returns the settled state untouched once an order is paid, which also makes a
legitimate retry idempotent. Two regression tests added.

**Verified end to end** against a stubbed Razorpay: order placed → `/pay`
returned the Razorpay order for the exact paise amount → valid signature →
`paid`/`confirmed` in the database → forged replay left it `paid`.

**Tests: 130 total, 426 assertions.**

### 3.12 Frame PDP & Products Listing [COMPLETED — Aug 2026]

The two remaining commerce stubs are now real pages — a frame shop finally has a
frame product page.

**`/products`** — full catalogue listing reusing `FrameGrid` (URL-driven filters,
sorting, price range) behind a Suspense boundary, with page metadata and hourly ISR.

**`/products/[slug]`** — standalone PDP modelled on the art PDP: breadcrumb,
hero + detail imagery, sticky `ProductConfigurator` (real variants, finishes,
stock from B4), related frames from the same series, canonical + OpenGraph
metadata, and JSON-LD `Product`/`AggregateOffer`. `generateStaticParams` prerenders
all 9 — the build went 45 → 54 pages.

**Link routing kept backwards-compatible.** `FrameCard` linked to
`/collections/{slug}?frame=` to drive the collection page's inline configurator.
Rather than repoint it globally and break that, it gained an opt-in
`linkTo="pdp"` prop that only `/products` passes. The collection deep-link still
works — verified.

**Latent bug found by building the page:** `getProductBySlug()` did
`apiFetch<{data: ApiProduct}>(...)` then read `.data` again, but `apiFetch`
already unwraps Laravel's envelope — so it passed `undefined` to the transformer
and threw `Cannot read properties of undefined`. It had never fired because the
PDP was a stub. Fixed.

**Sitemap corrected too:** it had no frame PDP entries and still derived art URLs
from `MOCK_ART` even though art is served by the API. Now async and sourced from
the service layer — 10 product URLs and 25 art URLs.

### 3.13 Search & Gifting [COMPLETED — Aug 2026]

**`SearchController`** — `GET /search?q=&limit=&type=` searches frames and art in
one call, which is what the search drawer renders.
- `total` counts every match while the lists are capped at `limit`, so the UI can
  honestly say "6 of 24". Frames fill the limit first, art takes the remainder —
  matching the ordering the drawer already used against fixtures.
- `type=frames|art` narrows to one catalogue. Inactive rows are excluded.
- Frontend: `toFrontendProduct`/`toFrontendArt` are now **exported and reused** by
  `search.ts` rather than duplicated — its real-API branch (and `searchArt`'s) had
  the same untransformed-return flaw seen twice before. `NEXT_PUBLIC_SEARCH_API_READY=true`.
- Verified live: `walnut` → 3 frames, `heritage` → 3 frames + 1 art, `folk` → 1 art.
- **16 tests.** Two initially failed on test data, not the controller:
  `ProductFactory` cycles a fixed list whose material is "Solid Walnut" (so a
  second product legitimately matched), and `CollectionFactory` cycles ~3 slugs so
  creating 5 collided on unique. Worth knowing before writing bulk-data tests.

**`/gifting`** — the last stub is now a real editorial page: hero, three curated
sets anchored to real collections, a four-step process, and a corporate gifting
section with a working lead form.
- The form posts to `/api/contact` with `type: 'gifting'`, so leads land in the
  same Filament inbox filterable by type. Verified end to end — a submission
  persisted as `type=gifting`.
- `/api/contact` previously hardcoded `type: 'contact'`, overriding any caller.
  It now honours `body.type` and falls back to `'contact'`; Laravel validates the
  value, so an unknown type is rejected server-side rather than mislabelled.
  Regression-checked: a plain contact submission still records as `contact`.

**Every page route is now built — no stubs remain.**

### 3.14 Accounts, Addresses & Server Sync [COMPLETED — Aug 2026]

**`AuthController`** — Sanctum tokens. Register, login, logout, profile, password
change, forgot/reset. Accounts stay **optional**: guest checkout is unaffected.
- Login returns one generic error for both a wrong password and an unknown email,
  and forgot-password always reports success — neither can be used to enumerate
  which addresses are registered. A test asserts both failure bodies are identical.
- A password change revokes **every other token** but keeps the caller's, since a
  change is how someone responds to a suspected compromise. A reset drops all of them.
- New `throttle:auth` limiter at 6/min keyed by **IP + submitted email**, so an
  attacker cannot lock a real customer out of their own account. Verified live:
  6 attempts then 429, while a different email still gets through.

**`AddressController`** — saved addresses, all scoped through
`$request->user()->addresses()`, so another customer's id 404s rather than leaking.
The first address becomes the default automatically, adding a new default demotes
the old one, and deleting the default promotes another — a customer can never end
up with addresses but no default.

**Frontend `AuthProvider`** (`lib/store/auth.tsx`) — token in localStorage, user
hydrated on mount, stale/revoked tokens cleared on 401. Mounted above the cart and
wishlist providers.

**Cart & wishlist server sync** — both were localStorage-only.
- On sign-in the carts are **merged, not overwritten**: a guest who fills a cart and
  then logs in keeps it, and so does their previous session's cart.
- Cart pushes are debounced 600ms so quantity spinners don't fire a request per click.
- Wishlist merges both ways and pushes anything saved while signed out, using
  `Promise.allSettled` so one rejected slug cannot fail the whole merge.
- Sync failures are always swallowed — the local store keeps working offline.
- **Known limit:** `wishlist_items.product_id` is a frames FK, so art cannot be
  wishlisted server-side; art slugs stay local-only until that schema changes.

**Two frontend bugs fixed on the way:**
1. `apiFetch` spread `...options` *after* `headers`, so any caller passing its own
   header (like `Authorization`) wiped `Accept`/`Content-Type` — and without
   `Accept`, Laravel answers a failed auth check with an HTML redirect instead of
   401 JSON. Every authenticated call would have misbehaved.
2. Both stores mirrored state into a ref during render, which React 19 forbids
   under concurrent rendering. Moved into effects; lint clean.

**Tests: 173 total, 560 assertions** (+27). Verified live end to end: register →
token → profile → save address → logout → token rejected.

### 3.15 Account UI, Shipping/Tracking & Gap Closure [COMPLETED — Aug 2026]

**Auth made reachable.** `/login`, `/register` and `/account` (order history,
saved addresses, sign out), plus an account icon in the nav. `?next=` is honoured
after sign-in but read from `window.location` rather than `useSearchParams()`,
which would have forced the form under Suspense and left the page blank until
hydration — and only same-site paths are accepted, so the redirect cannot be
pointed at another host.

**`ShippingController` + `TrackingController` + `ShiprocketService`** — the last
two controllers. The service is HTTP-only (no SDK) and **defaults to dry run**, so
fulfilment can be exercised before a Shiprocket account exists and a
misconfigured deploy cannot book real shipments. A rate lookup failure degrades
to flat standard delivery rather than blocking checkout; tracking falls back to
the last stored status. `CreateShiprocketOrderJob` is dispatched on payment
confirmation — and **only on the unpaid→paid transition**, so a retried webhook
cannot book a second shipment.

**Gaps closed**

1. **Filament could not show orders at all.** Ported the Orders resource and wrote
   the `OrdersTable`, `OrderForm`, `OrderInfolist` and `ViewOrder` classes it
   referenced but temp_repo never contained. Also wrote the missing
   `ArtCategoryResource` and `ArtProductResource`. Admin now covers every model.
2. **🔴 Admin access was broken *and* unsafe.** `User` never implemented
   `FilamentUser`, so Filament fell back to "any authenticated user, but only
   outside production" — meaning **nobody could reach /admin in production**, and
   now that the storefront has public registration, **any customer could reach it
   locally**. Added `users.is_admin` (existing rows promoted, since they predate
   customer sign-up) and gated the panel on it. Tests assert a customer gets 403
   and that neither registration nor a profile update can self-promote.
3. **Art can now be wishlisted.** `wishlist_items.product_id` was a frames-only
   FK. Added a nullable `art_product_id` with per-catalogue unique constraints.
   MySQL refused to drop the composite unique because it was doubling as the
   index behind the `user_id` foreign key — a standalone index is added first to
   take over that role. The API takes an explicit `type` (frame|art), the same
   discriminator lesson as orders, since a slug can exist in both catalogues.
4. **`ArtController` now filters** — style, material, size, price on the cheapest
   variant, in-stock, sort and search, matching the frame contract.
5. **`routes/web.php`** no longer serves Laravel's welcome page; the API-only root
   redirects to the storefront.
6. Removed a stray `auth 2.tsx` — a macOS duplicate artifact that was being
   linted and compiled. Worth watching for: the same artifact appeared under
   `.next/types/` earlier.

**Tests: 237 total, 695 assertions.** Frontend builds at 57 pages, new code lint-clean.

### 3.3 Target API contract (frontend expectations)

The frontend calls these when its vertical flag is live. Rows already served are
marked ✅; the rest is outstanding backend work.

| Endpoint | Method | Purpose | State |
|---|---|---|---|
| `GET /products` | GET | All products | ✅ |
| `GET /products/:slug` | GET | Single product | ✅ |
| `GET /collections`, `/collections/:slug` | GET | Collections (embeds products) | ✅ |
| `GET /products?c=walnut&s=8"×10"&min=&max=&sort=price_asc&q=&page=1&per_page=15` | GET | Filtered + paginated frames | ✅ (`stock` inert until variants) |
| `GET /collections/:slug/products` | GET | Products in a collection | ❌ (frontend filters `/products` client-side instead) |
| `GET /search?q={query}&limit=6` | GET | Full-text search across frames and art | ❌ |
| `GET /art` | GET | All art | ❌ no `Art` model |
| `GET /art/categories` | GET | All art categories | ❌ |
| `GET /art/categories/:slug/products` | GET | All art in a category | ❌ |
| `GET /art/:slug` | GET | Single art product | ❌ |
| `GET /art?style=cultural&material=canvas&sort=price_asc` | GET | Filtered art | ❌ |
| `POST /orders` | POST | Place an order (supports mixed cart) | ❌ no `Order` model |
| `POST /custom-framing/quotes` | POST | Custom framing quote request | ❌ |

**Frame filter params — implemented, and matching what `serializeFilters()` emits:**
- `c` — comma-separated collection slugs: `walnut,gallery,heritage`
- `s` — pipe-separated size labels matched against `products.dimensions`: `8" × 10"|11" × 14"`
- `min` / `max` — integers in paise, inclusive
- `stock` — `1` = in-stock only. **Accepted and validated but inert** — there is no
  stock column until B4, and the storefront already treats every active product as
  available (`toFrontendProduct()` hardcodes `stockQty: 10`)
- `sort` — `recommended | price_asc | price_desc | newest | delivery_asc`
  (`recommended` = `sort_order`; every sort gets an `id` tie-break so pages cannot
  repeat or skip rows)
- `page` / `per_page` — **pagination is opt-in.** Without either param the full
  collection is returned unwrapped, preserving the response shape `getAllProducts()`
  and `getProductsByCollection()` depend on. With either, the standard Laravel
  paginator envelope (`meta`, `links`) is added. `per_page` is capped at 100
- `q` — substring search over name, tagline, material, materials, description

> **Doc correction (Aug 2026):** this list previously said `min_price` / `max_price`.
> The frontend has always emitted `min` / `max` — see `serializeFilters()` in
> `src/lib/types/filters.ts`. The backend implements the real contract.
> Note `perPage` exists on `ProductFilterParams` but `serializeFilters()` never
> serializes it, so the storefront cannot request pagination yet.

**Filter query params Laravel should support (Art):**
- `style` — comma-separated: `cultural,modern,automotive`
- `material` — comma-separated: `canvas,photo-paper,fine-art`
- `size` — pipe-separated size labels
- `min_price` / `max_price` — paise (cheapest combo)
- `stock` — `1`
- `sort` — `recommended | price_asc | price_desc | newest`
- `q` — full-text search

---

## 4. Frontend Progress, continued — Phases 20–22 [COMPLETED]

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

### Phase 22: Live API Integration [COMPLETED — Aug 2026]
- Wired products + collections to the live Laravel API via `toFrontendProduct()`
- Added `frontend/.env.local` (gitignored — the old `sync.sh` excluded it, which is
  why it was missing and every API call resolved to `"undefined/..."`)
- Exported `API_BASE_URL` from `lib/api/client.ts`; `app/api/contact` and
  `app/api/newsletter` route handlers now use it instead of reading the raw env var
- Replaced the single global mock switch with per-vertical `*_API_READY` flags so
  unbuilt verticals cannot break `npm run build`

---

## 5. Pending Roadmap

Frontend and backend are now one team — most remaining items are vertical slices
that span both. Order below is roughly by dependency and value.

### Backend-first

**B1: Feature test suite** — ✅ **DONE (Aug 2026)**, see §3.4.

**B2: Seed frame options + persist newsletter** — ✅ **DONE (Aug 2026)**, see §3.4.

**B3: Product filtering, sorting & pagination** — ✅ **DONE (Aug 2026)**, see §3.5.

**B4: Variant model** — ✅ **DONE (Aug 2026)**, see §3.6.

**B5: Reconcile with `temp_repo`** — ✅ **DONE (Aug 2026)**, see §3.8.

**B6: Write the remaining controllers** — `OrderController` ✅ done (§3.9).
`PaymentController` ✅ done (§3.10).
`SearchController` ✅ done (§3.13).
`AuthController` + `AddressController` ✅ done (§3.14).
**All 18 controllers now exist** — `Shipping` + `Tracking` done (§3.15).
`Auth`, `Address`, `Order`, `Payment`, `Search`, `Shipping`, `Tracking`. Models,
migrations, resources and form requests are already in place; the routes are
stubbed as a comment block in `routes/api.php`. `SearchController` also unblocks
`NEXT_PUBLIC_SEARCH_API_READY`, and `OrderController` unblocks
`NEXT_PUBLIC_ORDERS_API_READY`.

### Full-stack slices

**F1: Art vertical** — ✅ **DONE (Aug 2026)**, see §3.8. Live on the API.
Remaining polish: `ArtController@index` ignores query params, so the storefront
still filters client-side; and Filament has no complete art resource yet.

**F2: Orders** — `orders` + `order_items` supporting a mixed frames/art cart,
`POST /orders`, Filament order management, then `NEXT_PUBLIC_ORDERS_API_READY`.

**F3: Search** — `GET /search?q=` across frames + art, then
`NEXT_PUBLIC_SEARCH_API_READY`.

**F4: Custom framing quotes** — `POST /custom-framing/quotes`; the wizard currently
uses hardcoded local options and never calls `/frame-options`, so wire that too.

### Frontend-only

**Phase 23: Products Listing Page (`/products`)** — currently a 5-line stub
returning `<main />`. Flat all-products listing reusing FrameGrid + FilterPanel.
Best done after B3.

**Phase 24: Product PDP (`/products/[slug]`)** — also a stub; renders an empty
`<main />`, which is why any slug returns 200 instead of 404.

**Phase 25: Gifting Page (`/gifting`)** — stub. Editorial landing page: hero,
3 curated gift sets, corporate gifting lead form, process timeline.

---

## 6. Data Layer Status — Where Each Vertical Reads From

| Vertical | Flag | State |
|---|---|---|
| Products & collections | `NEXT_PUBLIC_USE_MOCK_DATA=false` | ✅ **Live.** `toFrontendProduct()` maps the API shape to the `Product` type |
| Contact form | — | ✅ **Live.** `app/api/contact` → `POST /enquiries`, persisted + shown in Filament |
| Newsletter | — | ✅ **Live.** `app/api/newsletter` → `POST /newsletter/subscribe` → `subscribers` table, visible at `/admin/subscribers` |
| Testimonials, frame options | — | ⚠️ **Endpoints exist and are populated, but unused by the frontend.** Nothing imports `/frame-options`; the framing wizard still uses hardcoded local options (F4) |
| Filtered products | `NEXT_PUBLIC_USE_MOCK_DATA` | ✅ **Server-side ready** (§3.5). `getFilteredProducts()` maps correctly now, but still has no callers — `FrameGrid` continues to filter an in-memory array. Wire it up in Phase 23 |
| Art | `NEXT_PUBLIC_ART_API_READY` | ✅ **Live** (§3.8) — 18 products, 6 categories, 360 material variants from Laravel |
| Search | `NEXT_PUBLIC_SEARCH_API_READY` | ✅ **Live** (§3.13) — frames + art in one call |
| Orders | `NEXT_PUBLIC_ORDERS_API_READY` | ✅ **Live** (§3.9) — guest checkout, server-side pricing, stock decrement. **No payment yet.** |
| Custom framing quote | `NEXT_PUBLIC_FRAMING_API_READY` | ❌ Mock (F4) |
| Cart & wishlist | — | ✅ **Synced** (§3.14–3.15) — localStorage first, merged on sign-in. Art wishlisting now supported |

**Resolved (Aug 2026, §3.5):** `getFilteredProducts()` used to return the raw
snake_case payload typed as `Product[]` without running `toFrontendProduct()`, so
anything reading `.variants` would have got `undefined`. It now maps like every
other path. It still has no callers — wiring it to the `/products` page is Phase 23.
