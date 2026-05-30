# ODSArts — Responsive Design System

> **Document type:** Responsive Breakpoint System + Layout Rules
> **Scope:** All screen sizes from 320px to 2560px+
> **Cross-reference:** `06-design-principles.md` (grid), `08-tailwind-tokens.md` (tokens), `09-homepage-wireframe.md` (section layouts)

---

## Breakpoint Philosophy

ODSArts is designed **mobile-first** — base styles target the smallest screen, and larger screens progressively enhance the experience.

**Design principle:** Every breakpoint is a design opportunity, not just a scaling exercise. The mobile experience is not a degraded desktop — it is a curated, intentional version of the brand for that context.

---

## Breakpoint System

### Breakpoint Definitions

| Token | Name | Min Width | Device Category |
|-------|------|-----------|-----------------|
| `xs` | Extra Small | 320px | Small phones (iPhone SE, older Android) |
| `sm` | Small | 375px | Standard phones (iPhone 14, Pixel 7) |
| `md` | Medium | 640px | Large phones, small tablets (iPad Mini landscape) |
| `lg` | Large | 768px | Tablets portrait (iPad, Galaxy Tab) |
| `xl` | Extra Large | 1024px | Tablets landscape, small laptops |
| `2xl` | Desktop | 1280px | Standard laptops (13"–15") |
| `3xl` | Large Desktop | 1440px | HD monitors, 15"+ laptops |
| `4xl` | Wide | 1920px | Full HD monitors, wide screens |
| `5xl` | Ultra Wide | 2560px | 4K and ultrawide monitors |

### Tailwind Config (Breakpoints)
```ts
screens: {
  'xs':  '320px',
  'sm':  '375px',
  'md':  '640px',
  'lg':  '768px',
  'xl':  '1024px',
  '2xl': '1280px',
  '3xl': '1440px',
  '4xl': '1920px',
  '5xl': '2560px',
},
```

> **Note:** Tailwind uses `min-width` by default (mobile-first). `md:` means "at 640px and above".

---

## Grid System by Breakpoint

### Column Grid

| Breakpoint | Columns | Outer Gutter | Column Gap | Max Content Width |
|------------|---------|-------------|------------|-------------------|
| xs (320px) | 4 | 16px | 12px | 100% |
| sm (375px) | 4 | 20px | 16px | 100% |
| md (640px) | 6 | 32px | 20px | 100% |
| lg (768px) | 8 | 40px | 20px | 100% |
| xl (1024px) | 12 | 48px | 24px | 100% |
| 2xl (1280px) | 12 | 64px | 24px | 1200px |
| 3xl (1440px) | 12 | 80px | 24px | 1280px |
| 4xl (1920px) | 12 | 120px | 32px | 1440px |
| 5xl (2560px) | 12 | 160px | 32px | 1600px |

> **Rule:** Content never stretches beyond its max-content-width. At 4xl and 5xl, the design gains more breathing room (larger gutters), not more columns. Luxury breathes wider at larger screens.

### CSS Implementation
```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;  /* 16px — xs default */
}

@media (min-width: 375px)  { .container { padding-left: 1.25rem; } }
@media (min-width: 640px)  { .container { padding-left: 2rem; } }
@media (min-width: 768px)  { .container { padding-left: 2.5rem; } }
@media (min-width: 1024px) { .container { padding-left: 3rem; max-width: 100%; } }
@media (min-width: 1280px) { .container { padding-left: 4rem; max-width: 1200px; } }
@media (min-width: 1440px) { .container { padding-left: 5rem; max-width: 1280px; } }
@media (min-width: 1920px) { .container { padding-left: 7.5rem; max-width: 1440px; } }
@media (min-width: 2560px) { .container { padding-left: 10rem; max-width: 1600px; } }
```

---

## Typography by Breakpoint

### Fluid Type Scale (using `clamp()`)

```css
/* All fluid — no breakpoint overrides needed */
--text-display: clamp(2.25rem, 5.5vw, 5.5rem);    /* 36–88px */
--text-hero:    clamp(2rem, 4.5vw, 4.5rem);        /* 32–72px */
--text-h1:      clamp(1.75rem, 3.5vw, 3.5rem);     /* 28–56px */
--text-h2:      clamp(1.5rem, 2.8vw, 2.5rem);      /* 24–40px */
--text-h3:      clamp(1.25rem, 2vw, 1.875rem);     /* 20–30px */
--text-h4:      clamp(1.125rem, 1.6vw, 1.5rem);    /* 18–24px */
--text-lead:    clamp(1rem, 1.5vw, 1.375rem);      /* 16–22px */
--text-body:    clamp(0.9375rem, 1.1vw, 1.0625rem);/* 15–17px */
--text-sm:      clamp(0.8125rem, 1vw, 0.9375rem);  /* 13–15px */
--text-xs:      0.75rem;                            /* 12px — fixed */
```

### Key Typography Breakpoint Milestones

| Element | xs/sm (320–374px) | sm/md (375–639px) | md/lg (640–767px) | lg/xl (768–1023px) | xl+ (1024px+) |
|---------|------------------|------------------|------------------|-------------------|---------------|
| Hero headline | 36px, 2 lines | 40px | 52px | 64px | 80–88px |
| H1 | 28px | 32px | 38px | 44px | 48–56px |
| H2 | 22px | 24px | 28px | 32px | 36–40px |
| Body | 15px | 15px | 16px | 16px | 16–17px |
| Nav labels | 11px | 11px | 12px | 12px | 12px |
| CTA button text | 11px | 12px | 12px | 13px | 13px |

---

## Section-by-Section Responsive Behaviour

---

### Navigation

```
xs / sm (320–639px) — MOBILE NAV:
┌─────────────────────────────────────────┐  Height: 60px
│  ODSArts                          ☰    │  Logo: Cormorant, 20px
│  [logo, left]              [hamburger] │  Hamburger: 24px, 2-line icon
└─────────────────────────────────────────┘

Mobile overlay (full-screen):
┌─────────────────────────────────────────┐
│  ✕ [close]                             │
│                                        │
│       COLLECTIONS                      │
│       ABOUT                            │
│       CRAFTSMANSHIP                    │
│       CUSTOM FRAMING                   │
│       GIFTING                          │
│  [Cormorant Italic, 32px, ivory,       │
│   each link 64px apart vertically]     │
│                                        │
│       [  SHOP NOW  ]                   │
│  [gold filled button, full width]      │
│                                        │
│  instagram   pinterest                 │
│  [Jost 11px, pewter, bottom]           │
└─────────────────────────────────────────┘

md / lg (640–1023px) — TABLET NAV:
┌───────────────────────────────────────────────────────┐  Height: 64px
│  ODSArts     COLLECTIONS    CRAFTSMANSHIP    [SHOP]   │
│  [logo]      [Jost 11px, ALL CAPS]           [btn]    │
└───────────────────────────────────────────────────────┘

xl+ (1024px+) — DESKTOP NAV:
┌────────────────────────────────────────────────────────────────────┐  72px
│  ODSArts       COLLECTIONS  CRAFTSMANSHIP  ABOUT  GIFTING  [SHOP]  │
└────────────────────────────────────────────────────────────────────┘
```

**Scroll behaviour (all sizes):**
- Transparent over hero section
- `rgba(14,13,11,0.92)` + `backdrop-blur(20px)` after hero scroll

---

### Hero Section

```
xs (320px) — SMALL PHONE:
┌──────────────────┐  100svh (use svh not vh on mobile)
│ [IMAGE — 16:9,   │  Image: top 45% of screen, full-width
│  cropped to fit  │
│  320px width]    │
│                  │
│ HANDCRAFTED      │  Eyebrow: Jost, 10px, gold, tracking 0.2em
│ IN INDIA         │
│                  │
│ Art worth        │  Headline: Cormorant Light Italic, 36px
│ living with.     │  Line height: 1.1
│                  │
│ Premium frames   │  Subline: HIDDEN on xs (too small)
│ for spaces       │
│ that matter.     │  (Brief version only, 1 line)
│                  │
│ [EXPLORE → ]     │  CTA: Full-width ghost button, 52px height
│ [full width]     │  Jost 11px, ALL CAPS, tracking 0.2em
└──────────────────┘

sm (375px) — STANDARD PHONE:
┌────────────────────┐  100svh
│ [IMAGE — top 48%] │
│                   │
│ HANDCRAFTED IN    │  Eyebrow: 10px
│ INDIA             │
│ Art worth         │  Headline: 40px
│ living with.      │
│                   │  Subline: visible but 1 line
│ Premium frames    │  "Made for the spaces that matter most."
│ for spaces.       │
│                   │
│ [EXPLORE →]       │  CTA: Full-width, 52px
└────────────────────┘

md (640px) — LARGE PHONE / SMALL TABLET:
┌──────────────────────────────────┐  100svh
│  [IMAGE — top 50%, full bleed]   │
│                                  │
│     HANDCRAFTED IN INDIA         │  Eyebrow: centered
│                                  │
│        Art worth                 │  Headline: 52px, centered
│        living with.              │
│                                  │
│   Premium frames and wall art,   │  Subline: 2 lines, centered
│   made for spaces that matter.   │  Jost, 16px, pewter
│                                  │
│     [ EXPLORE THE COLLECTION → ] │  CTA: auto-width ghost, centered
└──────────────────────────────────┘

lg (768px) — TABLET PORTRAIT:
┌────────────────────────────────────────┐  100svh
│  [IMAGE — 55% height, full bleed]      │
│  [Frame photo: editorial, warm lit]    │
│                                        │
│          HANDCRAFTED IN INDIA          │  11px
│                                        │
│           Art worth                    │  64px
│           living with.                 │
│                                        │
│   Premium frames and wall art,         │  17px, 2 lines
│   made for the spaces that matter.     │
│                                        │
│       [ EXPLORE THE COLLECTION → ]     │  auto width
│                                        │
│          ↓  [scroll indicator]         │  gold animated line
└────────────────────────────────────────┘

xl (1024px) — TABLET LANDSCAPE / SMALL LAPTOP:
┌────────────────────────────────────────────────────┐  100vh
│                 HANDCRAFTED IN INDIA               │
│                                                   │
│   [IMAGE left,        Art worth                   │
│    50% width,         living with.                │
│    editorial          [72px, Cormorant]            │
│    frame photo]                                   │
│                       Premium frames and wall     │
│                       art, made for the spaces    │
│                       that matter most.           │
│                       [18px, Jost, pewter]        │
│                                                   │
│                  [ EXPLORE THE COLLECTION → ]     │
└────────────────────────────────────────────────────┘

2xl / 3xl (1280–1440px) — LAPTOP / DESKTOP:
Full cinematic layout — image center-staged, headline below
Headline: 80–88px
Subline: 18px
CTA centered
Full parallax effect

4xl (1920px) — FULL HD:
Content max-width capped at 1440px, padded
Image: constrained and centered, more surrounding dark space
Headline: 88px (capped — does not grow beyond)

5xl (2560px) — ULTRAWIDE / 4K:
Content max-width: 1600px
Surrounding dark space increases dramatically
Image is gallery-spotlit and surrounded by obsidian — cinematic
Type sizes capped — do NOT fluid-scale above 2xl
```

---

### Featured Collections

```
xs / sm (320–639px):
→ Horizontal snap-scroll, 1 card at a time
→ Each card: full-width (calc(100% - 32px margin)), 3:4 ratio image
→ Card text below image: label + name + "Explore →"
→ Scroll hint: partial 2nd card visible at 90%

md (640–767px):
→ 2 cards in grid, each 48% width
→ 3rd collection hidden or accessible via "View All"

lg / xl (768–1023px):
→ 2 cards grid, slightly wider, 3rd visible as horizontal peek

xl+ (1024px+):
→ 3-column equal grid, full-width cards
→ Hover effects active

4xl / 5xl (1920px+):
→ Cards have more inner padding
→ Max total grid width: 1440px, centred
```

---

### Craftsmanship (Story Section)

```
xs / sm:
→ Image full-width, 4:3 ratio
→ Text block below with padding 20px
→ Both sub-sections stack vertically (A then B)
→ Material pills: horizontal scroll, show 2.5 pills at once

md:
→ Same stacked layout, wider text block

lg (768px+):
→ 50/50 split begins
→ Image 45% width, text 55%
→ Sub-section B: reversed (text left, image right)

xl+:
→ Full 50/50 split, image and text equal height
→ Text: max 480px wide, vertically centered
→ Alternating dark / light backgrounds for A / B
```

---

### Customer Stories (Art Wall)

```
xs / sm:
→ Single column, uniform 4:3 images
→ Show 4 images, load more button
→ No hover effects — tap shows name overlay

md:
→ 2-column masonry, mixed ratios begin

lg+:
→ 3-column masonry, full mixed-ratio organic grid

xl+:
→ 4-column masonry, auto-height rows
→ Hover overlays with customer name
```

---

### Best Sellers

```
xs:
→ 2-column tight grid (each card ~47% width)
→ Product image, name, price, no "Add to Cart" button
→ Tap whole card to go to product

sm / md:
→ 2-column grid, slightly more padding

lg:
→ 3-column grid

xl+:
→ 4-column grid, hover states with "Add to Cart" ghost button appearing

4xl+:
→ 4-column stays, cards get more internal padding
```

---

### Wall Inspiration Gallery

```
xs / sm:
→ Single row, horizontal snap scroll
→ Each image: 85vw wide, 65vh tall
→ Style filter pills: horizontal scroll, no wrapping
→ No CTA hover — tap navigates to product

md:
→ 2-row horizontal scroll masonry
→ Pills wrap or scroll

lg+:
→ 2-row auto mosaic, fixed height rows

xl+:
→ Full mosaic grid, 2 rows, mixed portrait/landscape
→ Auto-scroll marquee begins at xl
```

---

### Custom Framing Process

```
xs / sm:
→ Vertical timeline layout
→ Gold vertical line on left side (2px)
→ Step number circles (24px) on the line
→ Text to the right of each circle
→ Step content: label + description, left-aligned
→ CTA button: full-width, below last step

md:
→ Same vertical timeline, more padding

lg (768px+):
→ Horizontal 4-step layout begins
→ Gold connecting line between steps
→ Steps above line on desktop

xl+:
→ Full horizontal treatment
→ Steps as cards with subtle border
→ Gold horizontal connector rule between cards
→ CTA: centered, below the step row

4xl+:
→ Steps capped at 1440px width, centered
→ More vertical padding above/below section
```

---

### Testimonials

```
xs / sm:
→ Single quote, centered
→ Headline: 22px
→ Swipe gesture to advance
→ Dot navigation: 8px circles, centered below
→ Gold quotation mark: 60px (reduced from desktop 120px)

md:
→ Same layout, 26px headline
→ Dots stay

lg:
→ Headline 30px, max-width 600px

xl+:
→ Full desktop layout, 32px, max-width 700px
→ Auto-advance re-enabled
```

---

### Gifting Banner

```
xs / sm:
→ Image: full width, 60svh, cover crop to portrait
→ Gradient overlay: heavy (top to bottom)
→ Text: bottom-centered, headline 30px
→ Buttons: stacked vertically, both full-width
→ Trust line: "Free gift wrapping · Express delivery"

md:
→ Headline 36px
→ Buttons side by side, auto-width

lg+:
→ Image: 70vh, wide landscape crop
→ Text: bottom-left aligned
→ Headline: 48px

xl+:
→ Headline: 56px
→ Full background parallax on scroll
```

---

### Footer

```
xs / sm:
→ ACCORDION footer
→ Brand block at top: ODSArts logo + tagline (always visible)
→ Below: 4 accordion sections (SHOP / ABOUT / HELP / FOLLOW)
→ Each section: tap to expand, gold chevron rotates
→ Bottom bar: © + Privacy + Terms stacked or 2-col at sm
→ Newsletter: field + button stacked, above bottom bar

md:
→ Partial accordion — 2 columns + 2 accordions

lg:
→ 2×2 grid: Brand+Shop left, About+Help right
→ Social links in Follow column

xl+:
→ 4-column equal grid (full desktop footer layout)
→ Newsletter inline (field + button side by side)

4xl+:
→ Content max-width: 1440px, centred
→ More vertical padding (generous closure)
```

---

## Component Responsive Rules

### Buttons

| Size | xs/sm | md/lg | xl+ |
|------|-------|-------|-----|
| Height | 48px | 50px | 52px |
| Padding H | 20px | 24px | 32px |
| Font size | 11px | 12px | 13px |
| Full-width | Yes (primary CTA) | No | No |

### Product Cards

| Property | xs/sm | md | lg | xl+ |
|----------|-------|----|----|-----|
| Per row | 2 | 2 | 3 | 4 |
| Image ratio | 3:4 | 3:4 | 3:4 | 3:4 |
| Show "Add to Cart" | No | No | Hover | Hover |
| Card padding | 12px | 16px | 20px | 24px |

### Collection Cards

| Property | xs/sm | md | lg | xl+ |
|----------|-------|----|----|-----|
| Layout | Snap scroll | 2-col | 2-col | 3-col |
| Image ratio | 3:4 | 3:4 | 3:4 | 3:4 |
| Card width | 85vw | 48% | 48% | 33.3% |

### Process Steps

| Property | xs/sm | md/lg | xl+ |
|----------|-------|-------|-----|
| Layout | Vertical timeline | Vertical | Horizontal |
| Connector | Vertical gold line | Vertical | Horizontal gold rule |
| Icon size | 32px | 36px | 40px |

---

## Touch & Interaction Rules

### Touch Targets
All interactive elements must meet **minimum 44×44px touch target** on mobile, regardless of visual size.

### Gesture Support

| Gesture | Component | Behaviour |
|---------|-----------|-----------|
| Swipe left/right | Collection cards | Snap scroll to next |
| Swipe left/right | Testimonials | Advance quote |
| Swipe left/right | Wall Gallery | Advance images |
| Tap + hold | Product card | Quick preview (future) |
| Pinch zoom | Product images | Zoom in on detail |

### Hover → Tap Translation

| Desktop hover | Mobile tap |
|---------------|------------|
| Card border brightens | None (card just links) |
| Customer name overlay appears | Overlay shown permanently as small tag |
| "Add to Cart" appears on product | Always visible on mobile |
| Image scales 1.02 | Subtle press scale 0.98 |

---

## Performance Considerations by Breakpoint

### Image Strategy

| Breakpoint | Hero Image | Product Images | Gallery Images |
|------------|-----------|----------------|---------------|
| xs/sm | 640w WEBP | 400w WEBP | 400w WEBP |
| md | 1024w WEBP | 600w WEBP | 600w WEBP |
| lg | 1440w WEBP | 800w WEBP | 800w WEBP |
| xl+ | 1920w WEBP | 1200w WEBP | 1200w WEBP |
| 4xl+ | 2560w WEBP | 1600w WEBP | 1600w WEBP |

Use `srcset` and `sizes` on all `<img>` elements:
```html
<img
  src="/images/hero-1920.webp"
  srcset="
    /images/hero-640.webp   640w,
    /images/hero-1024.webp  1024w,
    /images/hero-1440.webp  1440w,
    /images/hero-1920.webp  1920w,
    /images/hero-2560.webp  2560w
  "
  sizes="100vw"
  alt="Handcrafted walnut frame by ODSArts"
  loading="lazy"
/>
```

### Animation Disabling (Respect Reduced Motion)
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Feature Gating by Screen Size
```
xs / sm:
→ No parallax (performance + touch conflict)
→ No auto-scroll marquees
→ No hover effects
→ Skeleton loaders instead of complex spinners

md / lg:
→ Light parallax (image only, not text)
→ Swipe gestures active

xl+:
→ Full parallax
→ Auto-scroll marquees
→ Hover micro-animations
→ Gold shimmer animations
```

---

## Orientation Handling

### Landscape on Mobile (e.g. iPhone landscape)
```
Hero:       height: 100svh — use small viewport height unit
            Image crops tighter — prioritize top portion
Nav:        stays 60px, condensed
Content:    hero headline reduces by ~20% in landscape
            CTA button stays full-width
```

### iPad Pro in Landscape (1366px)
Treats as `xl` breakpoint — desktop layout applies:
- Nav: full desktop
- Hero: full cinematic
- Collections: 3-column
- Footer: 4-column

---

## Dark Mode / System Preference

ODSArts is **dark-first** — the dark mode IS the primary experience.

```css
/* Default: dark mode (no class needed) */
html {
  background-color: #0E0D0B;
  color: #F5F0E8;
}

/* Light mode: product detail pages only */
html.light-mode {
  background-color: #F5F0E8;
  color: #0E0D0B;
}

/* System preference — only affects system-preference-aware users */
/* ODSArts overrides system preference with explicit class on <html> */
```

> **Design decision:** ODSArts does NOT automatically follow system dark/light preference. The brand is dark-first — this is the artistic intent. Light mode is only used on product detail and checkout pages for clarity.

---

## Spacing Scale by Breakpoint

| Token | xs/sm | md | lg | xl | 2xl+ |
|-------|-------|----|----|----|----|
| Section padding (vertical) | 64px | 80px | 96px | 120px | 160px |
| Card padding | 12px | 16px | 20px | 24px | 32px |
| Component gap | 16px | 20px | 24px | 32px | 48px |
| Outer gutter | 16px | 24px | 32px | 48px | 80px |

---

## Device-Specific Notes

### iPhone SE (375×667px, xs/sm)
- Smallest supported device
- Hero headline max 2 lines at 40px
- All buttons full-width
- No horizontal scrolling except intentional snap-scroll collections
- Footer: full accordion

### iPad Mini (768×1024px portrait, lg)
- 8-column grid begins
- Hero: 50/50 layout begins
- Collections: 2-col grid
- Footer: 2-col

### iPad Pro 11" (834×1194px landscape, xl)
- Desktop nav activates
- Full 3-column collections
- Parallax enabled (light)

### MacBook Air 13" (1280×800px, 2xl)
- Full desktop layout
- All hover states active
- Content max-width 1200px begins

### MacBook Pro 15" / 16" (1440×900px, 3xl)
- 80px gutters
- All animations full fidelity
- Content max-width 1280px

### External Monitor 24" / 27" (1920×1080–1440px, 4xl)
- 120px gutters
- Content max-width 1440px
- Hero image: cinematic, vast surrounding dark space

### 4K Monitor / Ultrawide (2560px+, 5xl)
- 160px gutters
- Content max-width 1600px
- Typography capped — does not fluid-scale above 3xl breakpoint
- Hero: obsidian fills wide space, product image occupies centre third
