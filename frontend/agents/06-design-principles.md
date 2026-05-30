# ODSArts — Design Principles

> These are the laws of visual and experiential decision-making for ODSArts.
> Every design decision — from micro-animations to margin sizing — should be filtered through these principles.

---

## The Seven Design Laws of ODSArts

---

### Law 1 — Restraint Is Luxury

> *"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."* — Antoine de Saint-Exupéry

The most powerful visual tool in the ODSArts design system is **what is not there**.

**Principles:**
- Every element must justify its existence
- White/dark space is never "empty" — it is breathing room, gravitas, calm
- Remove any element that is not either functional or emotionally contributing
- Default margin/padding values should feel generous — almost uncomfortable

**Applied to:**
- Navigation: Maximum 5 links, no dropdowns on desktop hero
- Hero sections: One photograph, one headline, one CTA
- Color: Maximum 3 colors visible in any given section
- Typography: Maximum 2 font families site-wide

---

### Law 2 — Every Touchpoint Has Weight

Premium brands are experienced as a **complete sensory journey**, not a collection of web pages.

**Every touchpoint must be considered:**
- The loading state (should be elegant, not a spinner)
- The hover micro-interaction (should feel responsive and considered)
- The empty cart state (should feel welcoming, not empty)
- The confirmation email (should feel like a handwritten note, not a receipt)
- The 404 page (should feel like an unexpected gallery exhibit)
- The product packaging concept (should feel like unboxing a gift, always)

**Rule:** If it can be touched, seen, or experienced, it carries the brand.

---

### Law 3 — Warm, Not Cold

ODSArts lives in warmth. The entire visual system — colors, photography, lighting, even corner radii — should trend toward warmth.

**Applied:**
- Never use pure greys (they are cool, clinical, corporate) — always shift toward warm taupe/linen tones
- Photography art direction: Always warm light sources, never flat overcast or studio-white
- Interface shadows: Use warm-tinted shadows (`rgba(201, 169, 110, 0.08)`) never grey shadows
- Error states: Use warm rose tones, never harsh red
- Corner radius: Slightly rounded (4–8px) — never fully sharp (sharp = cold) or fully rounded (round = casual)

---

### Law 4 — Typography Leads Emotion

In a visual brand, photography stops us. **Typography makes us feel**.

**Rules:**
- Headlines are set at optical weights — Cormorant Garamond's light weight at large size creates elegance that bold cannot
- Italic is a tonal tool — use Cormorant Italic for moments of intimacy, poetry, emotion
- Never more than 65 characters per line of body copy (readability = luxury)
- Letter-spacing on Jost ALL CAPS labels is mandatory — never set caps without tracking
- Paragraphs breathe — line-height minimum 1.7 for body, 1.05 for display

---

### Law 5 — Gold Is a Promise, Not a Pattern

Burnished Gold `#C9A96E` is the single most powerful color in the ODSArts palette. It must be **protected**.

**Rules:**
- Gold is used for: Primary CTA, logo accent, decorative rules, hover states, active states, price displays
- Gold is NEVER used for: Background fills (full sections), body copy, icon fills at scale
- Gold should appear maximum 3 times in any viewport
- The power of gold comes from its scarcity — dilute it and it becomes decoration, not signal

**The Gold Rule:** When in doubt, remove one gold element from the design.

---

### Law 6 — Photography Is the Product

No AI-generated or stock photography. All visual assets must meet these standards:

**Photography Direction:**
- Shot with professional DSLR/mirrorless, natural or warm directional light
- Subject: The product in a real, curated home environment — never white studio backgrounds (except detail shots)
- Color treatment: Warm grade — slight lift in shadows, desaturated greens/blues, enriched ambers
- Composition: Rule of thirds; generous negative space; subject is never centered like a catalog
- Props: Minimal, curated — dried flowers, linen fabric, coffee books, architectural models
- Scale: Show scale in context — always show the frame hung on a wall, not floating

**Detail Shot Direction:**
- Macro shots of wood grain, joinery corners, glass surface
- Shot at an angle with raking light to show texture
- Shallow depth of field — only the detail should be sharp

---

### Law 7 — Motion Has Purpose

Every animation must earn its place by serving either **function** (communicating state change) or **emotion** (enhancing the feel of quality and care).

**Rules:**
- No animations purely for entertainment or "pizzazz"
- Transitions: 200–600ms range. Nothing under 150ms (too snappy), nothing over 800ms (too slow for UI)
- Easing: Almost always ease-out or custom cubic-bezier — never linear (mechanical) or bounce (playful)
- Hover effects: Subtle. Scale 1.02 maximum, not 1.1. Slight opacity shift, not dramatic changes
- Scroll animations: Fade-in with upward drift (8–16px). One direction. One axis. No rotation.
- Loading states: Skeleton screens with warm pulsing glow, not spinners

---

## Layout Principles

### The Grid
- Desktop: 12-column grid, 80px max outer gutter, 24px column gutter
- Tablet: 8-column grid, 40px outer gutter, 20px gutter
- Mobile: 4-column grid, 24px outer gutter, 16px gutter

### Content Max Width
- Text content: max-width 720px (optimal reading)
- Wide content/images: max-width 1200px
- Full bleed: 100vw (hero, story sections)

### Spacing Scale (8px base)
```
4px  — micro (icon padding, border offsets)
8px  — xs (tight internal elements)
16px — sm (element padding)
24px — md (card padding, small gaps)
32px — lg (section internal padding)
48px — xl (component gap)
64px — 2xl (section padding mobile)
96px — 3xl (section padding tablet)
128px — 4xl (section padding desktop)
160px — 5xl (hero vertical padding)
```

### Elevation / Shadow System
```
--shadow-xs:    0 1px 3px rgba(201, 169, 110, 0.06)
--shadow-sm:    0 4px 12px rgba(14, 13, 11, 0.15)
--shadow-md:    0 8px 24px rgba(14, 13, 11, 0.20)
--shadow-lg:    0 16px 48px rgba(14, 13, 11, 0.25)
--shadow-glow:  0 0 40px rgba(201, 169, 110, 0.12)
```

### Border Radius Scale
```
--radius-none: 0px       (sharp: dividers, rules)
--radius-sm:   4px       (inputs, tags)
--radius-md:   8px       (cards, buttons)
--radius-lg:   16px      (modals, large cards)
--radius-xl:   24px      (feature cards)
--radius-full: 9999px    (pills, avatars — use sparingly)
```

---

## Component Principles

### Buttons
- **Primary:** Gold fill, Obsidian text, Jost Medium 13px, ALL CAPS, tracking 0.15em, 48px height
- **Secondary (Ghost):** Gold 1px border, Gold text, transparent background
- **Tertiary:** Text link only, Gold, underline on hover
- **Destructive:** Warm rose, never red
- All buttons: 200ms transition on hover, no box-shadow on hover (shadow = cheap)

### Cards
- Background: `#1A1410` (dark) or `#EDE8DE` (light)
- 1px border: `rgba(201, 169, 110, 0.15)` — barely visible gold
- Hover: border opacity rises to 0.4, 2px
- No card drop shadows — use border instead (shadow = heavy-handed)

### Forms & Inputs
- Height: 52px (generous)
- Background: `rgba(255,255,255,0.04)` on dark, `#EDE8DE` on light
- Border: 1px `rgba(201, 169, 110, 0.3)` default, transitions to gold on focus
- Label: Jost Regular 12px, ALL CAPS, tracking 0.15em, above the input

### Navigation
- Height: 72px desktop, 60px mobile
- Transparent over hero, fills on scroll
- Logo centered or left — always Cormorant Garamond
- No hamburger menus on desktop; mobile: full-screen overlay, not a sidebar
