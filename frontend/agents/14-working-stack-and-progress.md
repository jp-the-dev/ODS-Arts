# ODSArts — Working Stack & UI Development Status

> **Document Purpose:** This document acts as the definitive record of the active technology stack being used for ODSArts, as well as a chronological log of all frontend UI development completed to date.

---

## 1. The Working Tech Stack

We are strictly following a cutting-edge, highly optimized frontend stack. All architectural decisions prioritize performance (LCP/CLS), cinematic animations, and developer experience.

### Core Frameworks
*   **Next.js (App Router):** v16.2.6 Turbopack — SSR, streaming, and App Router with route groups `(marketing)` and `(shop)`.
*   **React 19+:** Server Components by default. `'use client'` only where strictly required (Framer Motion, refs, event listeners, state).
*   **TypeScript:** Strict typing across the entire codebase.

### Styling & UI
*   **Tailwind CSS v4:** All design tokens (colors, typography, spacing, animations) defined in `@theme {}` inside `src/app/globals.css`. **No `tailwind.config.ts`** — v4 handles this natively in CSS.
*   **Framer Motion 12:** For parallax (`useScroll` + `useTransform`), hover effects (`whileHover`), and drawer/modal transitions (`AnimatePresence`).
*   **Native CSS Animations:** For above-the-fold entry animations (`animate-fade-up`) to bypass Next.js back-navigation hydration bugs.
*   **`useScrollReveal` hook:** Direct DOM style mutation via `IntersectionObserver` — the only safe scroll-reveal pattern for Next.js App Router (see `agents/issues-and-resolutions.md`).

### Architecture Structure

```
src/
├── app/                        ← Next.js App Router
│   ├── (marketing)/            ← Public pages: /, /collections, /about, /inspiration, etc.
│   ├── (shop)/                 ← Transactional pages: /cart, /checkout
│   ├── api/                    ← Route handlers: /api/contact, /api/newsletter
│   └── globals.css             ← Tailwind v4 @theme tokens (single source of truth)
│
├── components/                 ← UI — grouped by feature
│   ├── cart/                   ← CartPageItems, CartOrderSummary
│   ├── checkout/               ← CheckoutForm, CheckoutOrderSummary
│   ├── collections/            ← CollectionStoryBlock
│   ├── hero/                   ← HeroSection, HeroContent, HeroVideo, HeroReveal, etc.
│   ├── layout/                 ← Navigation, Footer, CartDrawer, FloatingNavigation, Container
│   ├── lifestyle/              ← HomeStoryBlock
│   ├── motion/                 ← All Framer Motion client wrappers (FadeUp, ParallaxImage, etc.)
│   ├── product/                ← ProductConfigurator, FrameCard, FrameGrid, CollectionProductZone, etc.
│   ├── sections/               ← All homepage sections (FeaturedCollections, Craftsmanship, etc.)
│   └── ui/                     ← Atoms: Button, GoldRule, EyebrowLabel, SectionHeader, etc.
│
├── lib/                        ← Shared utilities — primarily the e-commerce data layer
│   ├── api/client.ts           ← apiFetch() — typed fetch wrapper used by all services
│   ├── config/                 ← animations.ts, theme.ts, breakpoints.ts, seo.ts
│   ├── data/collections.ts     ← Static editorial collection data (used by marketing pages)
│   ├── fonts.ts                ← next/font/google instances (Cormorant + Jost)
│   ├── mock/products.ts        ← 9 mock products (3 collections × 3 frame profiles)
│   ├── services/products.ts    ← Mock-aware product service (getProductsByCollection, etc.)
│   ├── store/cart.tsx          ← CartProvider (Context + useReducer + localStorage)
│   ├── types/product.ts        ← Rich e-commerce types: Product, Variant, Finish, CartItem
│   └── utils.ts                ← cn(), formatPrice(), truncate()
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
*   `FrameGrid.tsx` — in-memory filtering (All/Walnut/Gallery/Heritage) + sorting with Framer Motion layout animations.
*   `FrameCard.tsx` — 3:4 aspect ratio, hover scale, animated underlines, stock badges, pricing.
*   Deep-linking: `/collections/[slug]?frame=[frame_slug]` pre-selects frame on collection detail.

### Phase 13: Cart & Checkout Pages [COMPLETED]
*   **CartProvider moved to root `layout.tsx`** — now accessible to both `(marketing)` and `(shop)` route groups.
*   **`(shop)/layout.tsx`** — minimal checkout-style nav (logo, back link, secure badge). Ivory background, clean checkout experience.
*   **`/cart` page** — full-page 2-column layout (items left, sticky order summary right). Animated item removal, qty stepper, editorial empty state.
*   **`/checkout` page** — 3-section luxury form (Contact / Delivery Address / Order Confirmation) + client-side validation + success screen with animated gold checkmark + order reference number.
*   **`services/orders.service.ts`** — mock-aware order service (`placeOrder()`, `buildOrderRequest()`). Flip `NEXT_PUBLIC_USE_MOCK_DATA=false` to go live with Laravel `POST /orders`.
*   **`types/index.ts`** — added `PlaceOrderRequest`, `PlaceOrderResponse`, `OrderStatus` types matching Laravel API contract.
*   **Hydration fix:** `FloatingNavigation.tsx` — removed conflicting inline `style` props that caused SSR/client mismatch. Added `useLayoutEffect` for synchronous initial hidden state.

---

## 3. Completed Phases (cont.)

### Phase 14: Custom Framing Configurator (`/custom-framing`) [COMPLETED]
*   **Full-screen dark studio mode** — warm charcoal `#1C1916` / `#231F1B` split layout. Left panel sticky live preview, right panel animated wizard steps.
*   **Split layout:** 45% left = live CSS frame preview. 55% right = step-by-step form. On mobile, preview collapses above steps.
*   **`types.ts`** — `FramingConfig` extracted into a dedicated types file to prevent circular imports between the wizard orchestrator and step components.
*   **`FramePreview.tsx`** — Live CSS-only frame mockup. Frame material = CSS gradient border. Mat = padding + background-color. Aspect ratio = CSS `aspect-ratio` property. Updates in real time as user picks each option. No images needed.
*   **`StepProgressBar.tsx`** — Gold gradient fill bar (`scaleX` animation) + clickable step labels. Completed steps clickable to go back.
*   **`StepOptionChip.tsx`** — Fully interactive chip: gold gradient background + glowing border on selected, hover lift (`y: -1, scale: 1.015`), animated gold left-bar, shimmer on hover.
*   **Step 1 — Artwork:** Drag-drop upload zone with FileReader preview. Gold border on hover. Artwork shown live inside the frame preview. "Skip" option.
*   **Step 2 — Size:** 7 standard presets + custom W×H inputs + cm/inch unit toggle. Live aspect ratio update in preview.
*   **Step 3 — Mat:** 4 style chips (None/Single/Double/Museum) + 8 colour swatches (animated gold ring on selected) + 3 width chips. Sub-options animate in.
*   **Step 4 — Frame:** 4 material cards with CSS gradient swatch strips + hover lift + gold glow on selected. Finish colour circles (3 per material) + 4 profile chips appear after material selection. Price estimate from hardcoded lookup table.
*   **Step 5 — Review & Request:** Full config summary card + contact form (name, email, phone, notes) + animated gold checkmark success screen with `CFR-XXXXXX` quote reference.
*   **`services/customFraming.service.ts`** — mock-aware `placeQuoteRequest()`. Flip `NEXT_PUBLIC_USE_MOCK_DATA=false` → POSTs to `POST /custom-framing/quotes`. Zero UI changes.
*   **`types/index.ts`** — added `CustomFramingQuoteRequest` and `CustomFramingQuoteResponse` types matching Laravel API contract.
*   **Step transitions:** Framer Motion `AnimatePresence` with directional x-axis slide (forward = right→left, back = left→right). Each step's content stagger-reveals after slide completes.
*   **Bug fix:** `opengraph-image.tsx` was returning HTTP 400 — fixed by providing a proper sized root div with explicit `width`/`height` to `ImageResponse`.

---

## 4. Pending Roadmap

### Phase 15: Gifting Page (`/gifting`) [NEXT]
**Goal:** Editorial landing page — gifting hero, 3 curated gift sets, corporate gifting section with lead form, gift process timeline.

### Phase 16: Performance & SEO Polish
**Goal:** Lighthouse audit, OG images, sitemap, robots, reduced-motion support, accessibility pass, font loading optimisation.

## 4. Backend Integration Checklist (When Laravel is Ready)

| What | How |
|---|---|
| Product data (real) | Set `NEXT_PUBLIC_USE_MOCK_DATA=false` — `lib/services/products.ts` auto-switches |
| Order submission | Same flag — `services/orders.service.ts` routes to `POST /orders` |
| Cart server sync | Add `useEffect` in `CartProvider` calling `GET /cart` on mount + `POST /cart/sync` on mutation |
| Newsletter | Wire `src/app/api/newsletter/route.ts` to Laravel endpoint |
| Contact form | Wire `src/app/api/contact/route.ts` to Laravel endpoint |
| Collections/Testimonials | `src/services/collections.service.ts` + `testimonials.service.ts` are scaffolded and ready |
