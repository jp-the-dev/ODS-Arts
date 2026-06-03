# ODSArts — Working Stack & UI Development Status

> **Document Purpose:** This document acts as the definitive record of the active technology stack being used for ODSArts, as well as a chronological log of all frontend UI development completed to date.

---

## 1. The Working Tech Stack

We are strictly following a cutting-edge, highly optimized frontend stack. All architectural decisions prioritize performance (LCP/CLS), cinematic animations, and developer experience.

### Core Frameworks
*   **Next.js (App Router):** Using the latest Next.js architecture (v16.2.6 Turbopack) for server-side rendering, streaming, and advanced routing.
*   **React 19+:** Leveraging Server Components by default. We only use `'use client'` boundaries where interactivity (framer-motion, refs, event listeners) is strictly required.
*   **TypeScript:** Strict typing across the codebase to ensure robust prop passing and data structures.

### Styling & UI
*   **Tailwind CSS v4:** We are using the newest Tailwind v4 architecture. All design tokens (colors, typography, spacing) are mathematically defined in the `@theme` block within `src/app/globals.css`. We do *not* use a `tailwind.config.ts` file, as v4 handles this natively in CSS.
*   **Framer Motion:** The dedicated engine for all complex scroll parallax, spring physics, and interactive transitions.
*   **Native CSS Animations:** For initial page load (Above-The-Fold) animations, we strictly use pure Tailwind CSS keyframes (`animate-fade-up`) to bypass React/Framer caching bugs during route navigation.

### Architecture Structure
*   **`src/` Directory Setup:** We enforce a clean separation of concerns:
    *   `src/app/`: Next.js routing, layouts, and page shells.
    *   `src/components/`: Modular UI pieces separated by feature (`hero/`, `layout/`, `collections/`, `sections/`, `ui/`).
    *   `src/lib/`: Configuration files (`theme.ts`, `animations.ts`, `fonts.ts`).
    *   `src/constants/`: Static copy and global data.

---

## 2. Frontend Development Progress

### Phase 1: Theme & Foundation [COMPLETED]
*   **Visual Direction Shift:** Transitioned the brand from a dark, moody aesthetic to a **Luxury Ivory / White Jet** editorial look.
*   **Design Token Implementation:** Mapped the entire color palette (Ivory surfaces, Obsidian text, Walnut accents, Gold rules) into `globals.css` and documented the logic in `agents/08-tailwind-tokens.md`.
*   **Typography System:** Implemented Google Fonts (Cormorant & Jost) seamlessly via `next/font`. Established a fluid, clamp-based type scale for perfect responsiveness across all devices.
*   **Hydration Fixes:** Added `suppressHydrationWarning` to the root layout to protect against third-party browser extensions (like dark mode enforcers).

### Phase 2: Core Layout [COMPLETED]
*   **Global Navigation:** Built a responsive, fixed navigation bar.
    *   Starts completely transparent over the hero image.
    *   Transitions to an elegant frosted-glass ivory (`bg-ivory/90` with `backdrop-blur`) when scrolled down.

### Phase 3: Screen 1 — The Hero [COMPLETED]
*   **Cinematic LCP:** Implemented a full-bleed luxury marble image as the Largest Contentful Paint.
*   **Centre Scrim Overlay:** Engineered a CSS radial-gradient that places a warm, dark shadow *only* behind the text, allowing the ivory typography to pop while keeping the image edges pristine.
*   **Ivory Bloom Parallax:** Instead of fading the image out, we built an elegant scroll-driven effect where a solid ivory overlay slowly swallows the image as you scroll down, creating a seamless transition into Section 2.
*   **Bulletproof Entry Animations:** Removed `framer-motion` from the initial text load, replacing it with staggered CSS `animate-fade-up` delays to permanently fix Next.js back-navigation bugs.

### Phase 4: Screen 2 — Brand Statement [COMPLETED]
*   **Editorial Manifesto:** Implemented a large, oversized typographic statement ("*Every frame tells a story worth keeping*") with walnut italic accents.
*   **Three Pillars Grid:** Designed a clean, 3-column layout outlining the core brand values (Handcrafted, Premium Materials, Made to Last).
*   **Material Tag Strip:** Built a minimal showcase of physical materials (Walnut, Oak, Brass, Museum Glass) separated by delicate gold dots.
*   **Pull Quote:** Added a massive, editorial-style blockquote to close the section.

### Phase 5: Screen 3 — Featured Collections [COMPLETED]
*   **Anti-Ecommerce Layout:** Built the collections section to feel like a high-end magazine spread rather than a traditional product grid (no prices, no standard cards).
*   **CollectionStoryBlock Component:** Engineered an alternating layout (`Image Left` → `Image Right` → `Image Left`) that gracefully stacks on mobile devices.
*   **Generated Assets:** Automatically generated and integrated 3 hyper-realistic museum-quality images (Walnut, Gallery, Heritage) to populate the section.
*   **Scroll-Triggered Motion:** Implemented `whileInView` framer-motion reveals with staggered text entry and a subtle, luxurious vertical parallax drift on the images themselves.

### Phase 6: Screen 4 — Craftsmanship [COMPLETED]
*   **The Workshop Narrative:** Implemented an editorial layout to justify the premium price point by focusing entirely on the physical creation process.
*   **Cinematic Parallax Header:** Generated a hyper-realistic workshop image (`public/images/craft/workshop.png`) and mounted it in an oversized container with a slow, heavy parallax drift.
*   **Staggered Masonry Layout:** Built the 4-step process (Material Selection, Precision Cutting, Hand Finishing, Final Inspection) using a staggered editorial grid rather than a traditional timeline or card layout.

### Phase 7: Screen 5 — Living With ODSArts (Customer Homes) [COMPLETED]
*   **Anti-Social-Media Layout:** Rejected the generic masonry/Instagram grid in favor of a full-bleed editorial layout (stacked blocks).
*   **Lifestyle Selling:** Generated 3 luxury interior renders (Ahmedabad living room, Surat gallery wall, Mumbai creative studio) and mounted them in massive parallax containers.
*   **Story-Driven Captions:** Each block uses a delicate typography lockup (Space Name, Location, Client) alongside an italicized editorial caption to focus on the emotional value of the space.

### Phase 8: Screen 6 — The Final Editorial Ending [COMPLETED]
*   **The Paradigm Shift:** Explicitly abandoned the standard ecommerce "Testimonials -> Best Sellers -> Footer" flow to maintain the high-end luxury editorial aesthetic.
*   **Final CTA:** Built `FinalCTASection.tsx` ending the page on a powerful emotional note ("Preserve What Matters") with a massive solitary walnut frame and a single CTA to "Explore Collections".
*   **Floating Navigation Orb:** Replaced the sticky top navigation with a persistent, bottom-right circular orb (`◎ ODS`) that appears only after the user has absorbed the initial brand statement.
*   **Luxury Drawer System:** Clicking the orb triggers a background blur and an elegant bottom-up drawer reveal with sequentially staggered menu items.

### Phase 10: The Story Pages (`/about` & `/inspiration`) [COMPLETED]
*   **The About Page:** Built `AboutHero.tsx` for a cinematic introduction and reused the highly-polished `CraftsmanshipSection.tsx` to detail the 4-step artisanal process.
*   **The Inspiration Gallery:** Created a filterable masonry-style interior layout using Framer Motion's `layoutId` animations (`InspirationGallery.tsx`).
*   **AI Lifestyle Assets:** Generated and implemented 4 hyper-realistic interior architecture renders representing minimal, warm, gallery, and workspace styles.

### Phase 11: Explore Series — E-Commerce Product Page [COMPLETED]
*   **Mock-First Service Architecture:** Established a `src/lib/types/product.ts` contract, `src/lib/mock/products.ts` data layer, and `src/lib/services/products.ts` routing layer. Flipping `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env.local` is the only change needed to switch to the real Laravel API.
*   **Cart System:** Built a zero-dependency `CartProvider` (React Context + useReducer) with localStorage persistence. Structured so server-side cart sync can be added via a single `useEffect` when the backend is ready.
*   **Product Zone — Multi-Frame Support:** Introduced `CollectionProductZone.tsx` (Client) with a `ProductSelector.tsx` horizontal scrollable rail so users can browse all N frames in a collection. The server fetches all products in a single call; the client manages selected state locally.
*   **Mock Data:** 9 products total — 3 distinct frame profiles per collection (Walnut: Classic / Slim / Box Float. Gallery: Classic / Float / Ledge. Heritage: Grand / Slim / Noir).
*   **Cart Drawer:** Slide-in animated `CartDrawer.tsx` with thumbnail, qty stepper, remove, subtotal, and checkout CTA stub.

### Phase 12: Collections Index — Frame Grid with Price [COMPLETED]
*   **Split Architecture:** Rebuilt `/collections/page.tsx` as a hybrid page. The top half is server-rendered editorial content (cinematic header + 3 collection bands). The bottom half is a Client Component `FrameGrid.tsx` that receives all 9 products from the server.
*   **Instant Filtering & Sorting:** `FrameGrid` handles filtering (All/Walnut/Gallery/Heritage) and sorting (Price low/high) entirely in-memory using Framer Motion layout animations for seamless transitions. No extra API calls.
*   **Premium Frame Card:** Built `FrameCard.tsx` with a 3:4 aspect ratio, hover scales, animated underlines, stock badges, and pricing ("from ₹X,XXX").
*   **Deep-Linking:** Each frame card points to `/collections/[slug]?frame=[frame_slug]`. Updated `CollectionProductZone.tsx` to read the URL parameter and pre-select the specific frame profile when navigating to the collection detail page.

---

## 3. Pending Roadmap (What's Next)

### Phase 13: Cart & Checkout Pages
**Goal:** The CartDrawer is live but `/cart` and `/checkout` pages are empty stubs. The cart page should be a full-page version of the drawer. The checkout page needs a form (name, address, size confirmation) — no payment gateway yet, just a form that would POST to the Laravel API.

### Phase 14: Custom Framing Interactive Page (`/custom-framing`)
**Goal:** The most complex page on the site. A step-by-step frame configurator (upload artwork → choose size → pick mat → pick frame → place order). This is a Client-heavy page.

### Phase 15: Gifting Page (`/gifting`)
**Goal:** A landing page for corporate and personal gifting, featuring curated gift sets, a gift-wrapping section, and a lead form.

### Phase 16: Performance & SEO Polish
**Goal:** Lighthouse audit, OG images, sitemap.ts, robots.ts, reduced motion support, and font loading optimization.
