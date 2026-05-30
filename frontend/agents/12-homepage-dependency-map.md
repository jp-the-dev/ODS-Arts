# ODSArts — Homepage Component Dependency Map

> **Architectural Review:** The project structure correctly separates concerns by placing routing in `src/app/`, atomic UI in `src/components/ui/`, layout wrappers in `src/components/layout/`, server shells in `src/components/sections/`, and client-side interactivity in `src/components/motion/`. This adheres to Next.js App Router best practices, isolating Server Components from Client Components.

---

## Component Dependency Map

### 1. Navigation (`Navigation.tsx`)
- **Required UI:** `Button` (for standard links)
- **Required Motion:** `NavigationScrollObserver` (scroll state), `MobileMenuButton`, `MobileMenuOverlay`
- **Shared Dependencies:** `next/link`, `src/constants` (`NAV_LINKS`, `BRAND`)
- **Data Requirements:** Static branding & routing
- **Recommendation:** **Server Component shell**. Passes static data to `MobileMenuButton` and `MobileMenuOverlay` which are Client Components.

### 2. Hero Section (`HeroSection.tsx`)
- **Required UI:** `Button`, `EyebrowLabel`
- **Required Motion:** `HeroReveal` (entry animation), `ParallaxImage` (scroll effect)
- **Shared Dependencies:** `next/image`, `Container`
- **Data Requirements:** Static hero copy and LCP image.
- **Recommendation:** **Server Component**. Imports `HeroReveal` and `ParallaxImage` to wrap static DOM elements.

### 3. Brand Statement (`BrandStatementSection.tsx`)
- **Required UI:** `GoldRule`
- **Required Motion:** `StaggerChildren`, `FadeUp`
- **Shared Dependencies:** `Container`
- **Data Requirements:** Static brand copy.
- **Recommendation:** **Server Component**. Wraps text elements in `StaggerChildren` for scroll-triggered reveal.

### 4. Featured Collections (`FeaturedCollectionsSection.tsx`)
- **Required UI:** `SectionHeader`, `CollectionCard`, `Button`
- **Required Motion:** `CardHoverEffect`
- **Shared Dependencies:** `Container`
- **Data Requirements:** `getFeaturedCollections()` from `src/lib/data/collections.ts`
- **Recommendation:** **Server Component**. Fetches data on the server, maps over data to render `CollectionCard`s wrapped in `CardHoverEffect`.

### 5. Craftsmanship (`CraftsmanshipSection.tsx`)
- **Required UI:** `MaterialPill`
- **Required Motion:** `FadeUp`
- **Shared Dependencies:** `Container`, `next/image`
- **Data Requirements:** Static copy detailing materials.
- **Recommendation:** **Server Component**. Alternating layout blocks, purely static, wrapped in `FadeUp` intersections.

### 6. Customer Stories (`CustomerStoriesSection.tsx`)
- **Required UI:** `SectionHeader`
- **Required Motion:** `MasonryGrid` (handles calculation and dynamic positioning)
- **Shared Dependencies:** `Container`
- **Data Requirements:** `getCustomerStories()` from `src/lib/data/testimonials.ts`
- **Recommendation:** **Server Component shell**. Fetches data, then passes the array to `<MasonryGrid />` (Client Component) to handle intersection observers and layout logic.

### 7. Best Sellers (`BestSellersSection.tsx`)
- **Required UI:** `SectionHeader`, `ProductCard`, `Button`
- **Required Motion:** `CardHoverEffect`
- **Shared Dependencies:** `Container`
- **Data Requirements:** `getBestSellers()` from `src/lib/data/products.ts`
- **Recommendation:** **Server Component**. Maps fetched product data to purely static `ProductCard` components.

### 8. Wall Inspiration (`WallInspirationSection.tsx`)
- **Required UI:** `SectionHeader`, `Button` (for filter pills)
- **Required Motion:** `InspirationGrid` (handles filter state and layout transition)
- **Shared Dependencies:** `Container`
- **Data Requirements:** `getInspirationImages()` from `src/lib/data/testimonials.ts`
- **Recommendation:** **Server Component shell**. Passes fetched data down to `<InspirationGrid />` which operates as a Client Component to manage `useState` for style filtering.

### 9. Custom Framing Process (`CustomFramingProcessSection.tsx`)
- **Required UI:** `SectionHeader`, `StepCard`, `GoldRule`, `Button`
- **Required Motion:** `StaggerChildren`, `FadeUp`
- **Shared Dependencies:** `Container`, `src/constants` (`PROCESS_STEPS`)
- **Data Requirements:** Static constants array.
- **Recommendation:** **Server Component**. No client state needed besides scroll reveal.

### 10. Testimonials (`TestimonialsSection.tsx`)
- **Required UI:** `QuoteBlock`
- **Required Motion:** `TestimonialCarousel`
- **Shared Dependencies:** `Container`
- **Data Requirements:** `getTestimonials()` from `src/lib/data/testimonials.ts`
- **Recommendation:** **Server Component shell**. Passes fetched quotes to `<TestimonialCarousel />` (Client Component) which handles auto-advance timers and swipe gestures.

### 11. Gifting Banner (`GiftingBannerSection.tsx`)
- **Required UI:** `Button`
- **Required Motion:** `ParallaxImage`
- **Shared Dependencies:** `next/image`
- **Data Requirements:** Static promotional copy.
- **Recommendation:** **Server Component**. The background image uses `<ParallaxImage />`.

### 12. Footer (`Footer.tsx`)
- **Required UI:** `Button`
- **Required Motion:** Accordion mobile toggles (can use basic `useState` in a micro client wrapper if needed)
- **Shared Dependencies:** `next/link`, `Container`, `src/constants`
- **Data Requirements:** Static constants.
- **Recommendation:** **Server Component**. Contains a nested `<NewsletterForm />` Client Component.

---

## Recommended Implementation Order

To maintain isolated testing and prevent circular dependency blocks, follow this bottom-up build order:

**Phase A: Pure Primitives (No Dependencies)**
1. `GoldRule`, `EyebrowLabel`, `Button`, `MaterialPill`, `SkeletonBlock`
2. `Container`

**Phase B: Complex Atoms (Dependent on Primitives)**
3. `SectionHeader`, `QuoteBlock`, `StepCard`
4. `ProductCard`, `CollectionCard`

**Phase C: Motion Wrappers (Client Interactivity)**
5. `FadeUp`, `StaggerChildren`, `CardHoverEffect`
6. `ParallaxImage`, `HeroReveal`
7. `MasonryGrid`, `InspirationGrid`, `TestimonialCarousel`

**Phase D: Section Assembly (Server Shells)**
8. Build all `*Section.tsx` files by composing Phase B (UI) wrapped in Phase C (Motion).

**Phase E: Page Composition**
9. Import all sections into `src/app/(marketing)/page.tsx`
10. Integrate `Navigation` and `Footer` into `src/app/(marketing)/layout.tsx`
