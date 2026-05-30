# ODSArts — Homepage Visual Direction

---

## Design Philosophy for the Homepage

The ODSArts homepage is not a storefront. It is a **gallery opening**.
The visitor should feel as if they have stepped into a beautifully curated private gallery — one that sells, yes, but primarily *moves* you first.

Inspired by: Hasselblad's cinematic obsidian hero, Apple's restraint and pacing, Aesop's ritual-like scroll experience, Aura Frames' emotional storytelling.

---

## Overall Mood

| Element | Direction |
|---------|-----------|
| Primary theme | Dark luxury gallery |
| Lighting feel | Warm spotlight, directional light |
| Atmosphere | Still, reverential, intimate |
| Pacing | Slow, deliberate, cinematic |
| First impression | Silence before a masterpiece |

---

## Section-by-Section Visual Direction

---

### Section 1 — Hero (Full Viewport)

**Layout:** Full bleed, 100vh
**Background:** Deep Obsidian `#0E0D0B` — near-black with brown warmth
**Treatment:** A single, breathtaking product photograph centered and dramatically lit — as if a gallery spotlight falls only on the frame. Everything else recedes to black.

**Visual Composition:**
- Center stage: a gallery wall scene — a single large frame hung on a dark linen wall, photographed like fine art
- Soft volumetric light from top-left, casting subtle frame shadows
- Foreground: very subtle atmospheric grain texture overlay (8% opacity)
- Background: pure obsidian with imperceptible warm vignette

**Typography:**
```
[Top — small eyebrow label]
JOST · ALL CAPS · TRACKING 0.25em · Burnished Gold · 11px
"HANDCRAFTED IN INDIA"

[Center — Main Headline]
Cormorant Garamond Light · 80px · Ivory · tracking: -0.02em
"Art worth
living with."

[Below — Subline]
Jost Regular · 18px · Aged Pewter · line-height: 1.7
"Premium frames and wall art,
made for the spaces that matter most."

[CTA — Bottom Center]
Jost Medium · 13px · ALL CAPS · tracking: 0.25em
[Ghost button: gold border, gold text, transparent BG]
"EXPLORE THE COLLECTION →"
```

**Motion Behavior:**
- On load: hero image fades in over 1.2s with subtle upward drift (10px translateY → 0)
- Headline letter-spacing animates from 0.1em → -0.02em on load (luxury reveal feel)
- CTA border draws clockwise on hover (CSS clip-path animation)
- Subtle parallax on scroll — image scrolls at 0.85x speed

**Navigation (on hero):**
- Floating nav — fully transparent over hero
- Logo: `ODSArts` in Cormorant Garamond + small gold ligature accent
- Links: Jost Regular · ALL CAPS · tracking: 0.15em · Ivory · 12px
- On scroll past hero: nav background transitions to `rgba(14,13,11,0.92)` with backdrop-blur

---

### Section 2 — Brand Statement (Pause Moment)

**Layout:** Full-width, ~60vh, centered content
**Background:** Obsidian, breaking with a single hair-thin gold horizontal rule

**Content:**
```
[Small gold rule — 40px wide, centered, 1px height]

[Cormorant Garamond Italic Light 300 · 44px · Ivory · centered]
"We do not make frames.
We make keepers of light,
holders of time,
guardians of what you love."

[Small label below]
Jost Regular · 13px · Aged Pewter · tracking: 0.15em
— The ODSArts Studio
```

**Animation:** Text fades in line by line as viewport enters, staggered 200ms delay per line.

---

### Section 3 — Featured Collections (Horizontal Scroll or 3-Column Grid)

**Layout:** Full width, dark walnut-tinted background `#1A1410`
**Approach:** Three collection cards, each full-height photograph

**Card Design:**
- 1:1.4 portrait aspect ratio
- Product/room photography — dramatically lit, editorial quality
- On hover: subtle scale 1.02 + gold border appears (1px, animated clip-path from bottom)
- Collection label in Jost ALL CAPS, gold, tracking: 0.2em
- Collection name in Cormorant Garamond Italic, ivory
- "Explore →" in Jost Regular, gold

**Collections Featured:**
1. *The Walnut Series* — premium wooden frames
2. *Canvas Editions* — large format wall art prints
3. *The Gift Edit* — curated gifting collections

---

### Section 4 — The Craft (Full-Width Story Section)

**Layout:** 50/50 split — image left, text right
**Background:** Alternating — first instance: dark left / light right. Second: inverse.

**Visual:**
- Close-up macro photography: hands applying finish to a frame, wood grain detail, glass being cleaned
- Shot with shallow depth of field — tactile, intimate, cinematic

**Text Block:**
```
[Eyebrow]
Jost · ALL CAPS · Gold · tracking: 0.25em
"THE CRAFT"

[Headline]
Cormorant Garamond Regular · 40px · Obsidian (light bg) / Ivory (dark bg)
"Every frame begins
as a conversation."

[Body]
Jost Regular · 16px · Aged Pewter · line-height: 1.8
"We start with the photograph — its proportions,
its mood, its light. Then we choose the frame
not to contain it, but to complete it."

[CTA]
Jost Medium · 12px · ALL CAPS · Gold · tracking: 0.2em · underline on hover
"LEARN ABOUT OUR PROCESS →"
```

---

### Section 5 — Social Proof (Customer Art Wall)

**Layout:** Masonry or organic grid — full width, dark background
**Concept:** A curated wall of customer-submitted photographs of their frames in their homes

**Visual Direction:**
- Mix of portrait, square, landscape frames shown in real interior contexts
- Warm, editorial photography only — no dark backgrounds or amateur shots
- Overlay on hover: customer name + city + gold asterisk icon

**Section Header:**
```
[Cormorant Garamond Italic · 48px · Ivory · centered]
"In their homes."

[Jost · 14px · Aged Pewter · centered · tracking: 0.1em]
Frames made for real walls, real light, real lives.
```

---

### Section 6 — Testimonials (Editorial Quote Carousel)

**Layout:** Full-width dark section, single quote centered, minimal
**Treatment:** Large Cormorant Garamond Italic quote, sparse layout

- Auto-scroll with manual dots
- Transition: crossfade, 0.6s
- Gold quotation mark glyph (oversized, decorative)

---

### Section 7 — The Gift Promise

**Layout:** Full-bleed image background (unwrapping/unboxing photograph)
**Overlay:** Dark gradient top-to-bottom (`rgba(14,13,11,0) → rgba(14,13,11,0.85)`)
**Content position:** Bottom-centered

```
[Cormorant Garamond Light · 56px · Ivory]
"Give the wall
something worth looking at."

[Jost Regular · 16px · Ivory/80% opacity]
Free gift wrapping. Handwritten notes. Express delivery available.

[Two CTAs side by side]
[Primary: Gold filled] SHOP GIFTS
[Secondary: Gold outline] BUILD YOUR OWN
```

---

### Section 8 — Footer

**Layout:** Dark obsidian, generous padding, minimal
**Three columns:** Brand | Navigation | Trust Signals
**Bottom bar:** Jost 12px, Aged Pewter, tracking: 0.1em

**Footer visual element:** A single thin gold rule at the top of the footer — 100% width — signals the end of the gallery.

---

## Scroll Experience Principles

1. **Reveal, don't dump** — Content should appear as you scroll, not be visible on load
2. **Pacing** — Mix dense sections with breathing room sections (minimum 2 "pause" sections per page)
3. **Anchor points** — Every 3rd section should have a CTA moment
4. **No distractions above the fold** — The hero exists only to create desire

---

## Animation Vocabulary

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Fade in up | 600ms | cubic-bezier(0.25, 0, 0, 1) | Text reveals |
| Scale hover | 300ms | ease-out | Product cards |
| Border draw | 400ms | ease-in-out | CTA hover borders |
| Crossfade | 600ms | ease | Testimonial carousel |
| Parallax | Continuous | linear | Hero image |
| Gold shimmer | 2s loop | ease-in-out | Gold accent elements |
