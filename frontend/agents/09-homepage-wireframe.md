# ODSArts — Homepage Wireframe

> **Document type:** UX Wireframe + Design Rationale
> **Approach:** This is a narrative wireframe — each section is described structurally (what it contains and how it is laid out) alongside its UX rationale (why it exists and how it earns its place on a luxury homepage).
> **Reference:** Built from `01-brand-identity.md`, `03-color-palette.md`, `04-typography.md`, `05-homepage-visual-direction.md`, `06-design-principles.md`

---

## Wireframe Philosophy

The ODSArts homepage is structured as a **cinematic scroll experience**, not a product catalogue. The visitor moves through it the way they would move through a private gallery — drawn forward by curiosity, stopped by beauty, moved by emotion, and finally invited to act.

Every section has exactly one job. No section competes with another. The scroll has rhythm: **tension → release → tension → release → CTA.**

---

## Page Structure Overview

```
┌─────────────────────────────────────────┐
│  01  NAVIGATION (floating, transparent) │
├─────────────────────────────────────────┤
│  02  HERO — Full Viewport               │
├─────────────────────────────────────────┤
│  03  BRAND STATEMENT — Pause Moment     │
├─────────────────────────────────────────┤
│  04  FEATURED COLLECTIONS               │
├─────────────────────────────────────────┤
│  05  CRAFTSMANSHIP — Story Section      │
├─────────────────────────────────────────┤
│  06  CUSTOMER STORIES — Art Wall        │
├─────────────────────────────────────────┤
│  07  BEST SELLERS                       │
├─────────────────────────────────────────┤
│  08  WALL INSPIRATION GALLERY           │
├─────────────────────────────────────────┤
│  09  CUSTOM FRAMING PROCESS             │
├─────────────────────────────────────────┤
│  10  TESTIMONIALS                       │
├─────────────────────────────────────────┤
│  11  GIFTING BANNER — Final CTA         │
├─────────────────────────────────────────┤
│  12  FOOTER                             │
└─────────────────────────────────────────┘
```

---

## 01 — Navigation

### Purpose
Navigation is the **first brand signal**. On a luxury site it must be present but invisible — felt, not seen.

### Luxury Rationale
Traditional ecommerce nav is cluttered with dropdowns, promo banners, and cart icons. ODSArts nav is quiet authority. The visitor trusts a brand that doesn't shout.

### Layout

```
DESKTOP (72px height, transparent over hero):
┌────────────────────────────────────────────────────────────────────┐
│  ODSArts                    COLLECTIONS  ABOUT  CRAFTSMANSHIP  ···  [  SHOP  ] │
│  [Cormorant Garamond,       [Jost 12px,  ALL CAPS, tracking 0.15em,   Ivory]   │
│   logo + gold accent mark]                                                      │
└────────────────────────────────────────────────────────────────────┘

TABLET (60px, same layout — fewer links, shop CTA stays):
┌──────────────────────────────────────────────────────┐
│  ODSArts          COLLECTIONS    ABOUT    [  SHOP  ] │
└──────────────────────────────────────────────────────┘

MOBILE (60px, logo left, hamburger icon right):
┌─────────────────────────────────────────┐
│  ODSArts                          ☰    │
└─────────────────────────────────────────┘
Mobile menu = full-screen overlay, dark obsidian, centered links
```

### Behaviour
- **Transparent** over hero; smooth fill to `rgba(14,13,11,0.92)` + `backdrop-blur(20px)` on scroll past hero
- Active link: 1px gold underline, appears on hover with 300ms ease
- Logo: always links to homepage
- Mobile overlay: links stacked, Cormorant Garamond Italic, 32px, full-screen obsidian overlay

---

## 02 — Hero

### Purpose
To **stop the visitor in their tracks**. Not to sell immediately — to create desire. The hero should feel like walking into a gallery and seeing the first work on the wall.

### Luxury Rationale
Luxury brands never open with a sale. They open with beauty. One image. One line. One invitation. The visitor should feel they have discovered something, not been marketed to.

### Layout

```
DESKTOP (100vh, full bleed):
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│                                                                   │
│        ┌────────────────────────────┐                            │
│        │                            │                            │
│        │   [HERO FRAME PHOTO]       │                            │
│        │   Single frame, gallery    │   HANDCRAFTED IN INDIA     │
│        │   wall, warm spotlight     │   [gold eyebrow, top-right]│
│        │                            │                            │
│        └────────────────────────────┘                            │
│                                                                   │
│              Art worth                                            │
│              living with.                                         │
│         [Cormorant Light Italic, 88px, ivory, centered]           │
│                                                                   │
│         Premium frames and wall art,                              │
│         made for the spaces that matter most.                     │
│         [Jost Regular, 18px, pewter, centered]                    │
│                                                                   │
│              [ EXPLORE THE COLLECTION → ]                         │
│              [ghost button, gold border + text]                   │
│                                                                   │
│  ↓  subtle scroll indicator (gold animated line, 40px)            │
└───────────────────────────────────────────────────────────────────┘

TABLET (100svh):
- Image fills top 55% of viewport
- Headline 64px
- CTA centered below

MOBILE (100svh):
- Image fills top 50% — cropped portrait
- Headline 38px, 2 lines max
- Subline hidden or shortened to 1 line
- CTA full-width ghost button below
```

### Content Elements
| Element | Content | Typography |
|---------|---------|------------|
| Eyebrow label | `HANDCRAFTED IN INDIA` | Jost 11px, ALL CAPS, gold, tracking 0.25em |
| Main headline | `Art worth living with.` | Cormorant Light Italic, 88px desktop / 40px mobile |
| Subheadline | `Premium frames and wall art, made for spaces that matter most.` | Jost Regular 18px, pewter |
| Primary CTA | `EXPLORE THE COLLECTION →` | Ghost button, gold |
| Scroll indicator | Animated gold vertical line | 40px, pulses softly |

### Animation
- Hero image: fade in + 10px upward drift, 1.2s on load
- Headline: letter-spacing collapses from 0.1em → -0.02em on load (800ms)
- CTA: fade in last, 400ms delay
- Parallax: image scrolls at 0.85x speed on desktop

---

## 03 — Brand Statement (Pause Moment)

### Purpose
A **breath between** the hero and the collections. This section exists purely to build emotional depth — to tell the visitor who ODSArts is and what it believes, before showing them what it sells.

### Luxury Rationale
Luxury brands make you feel before they make you buy. This section is modelled on the kind of text you find in a gallery programme — poetic, considered, unhurried. It signals that this brand has a point of view.

### Layout

```
DESKTOP (~50vh, full-width, centered):
┌───────────────────────────────────────────────────────┐
│                                                       │
│                   ─────                               │
│           [40px gold rule, centered, 1px]             │
│                                                       │
│   "We do not make frames.                             │
│    We make keepers of light,                          │
│    holders of time,                                   │
│    guardians of what you love."                       │
│   [Cormorant Italic Light, 44px, ivory, centered]     │
│                                                       │
│              — The ODSArts Studio                     │
│   [Jost, 13px, pewter, tracking 0.15em, centered]    │
│                                                       │
└───────────────────────────────────────────────────────┘

TABLET: Same, headline 36px
MOBILE: Headline 26px, left-aligned, smaller padding
```

### Animation
Text lines reveal staggered — each line fades up with 200ms delay between them, triggered on scroll entry.

---

## 04 — Featured Collections

### Purpose
To **orient the visitor** within the product world. Not a category grid — a curated editorial selection of three defining collections that tell the brand story through product families.

### Luxury Rationale
Rather than showing "all products", luxury brands curate. Three collections = three desires addressed. The visitor self-selects their identity: framing enthusiast, art collector, gift giver.

### Layout

```
DESKTOP (3-column, full width, dark walnut bg #1A1410):
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│          THE COLLECTIONS  [gold, Jost ALL CAPS, centered]        │
│          Discover our curated series. [Jost, pewter, centered]   │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  [IMAGE 3:4]     │  │  [IMAGE 3:4]     │  │  [IMAGE 3:4]  │ │
│  │  Full-height     │  │  Full-height     │  │  Full-height  │ │
│  │  portrait photo  │  │  portrait photo  │  │  portrait     │ │
│  │  gallery lit     │  │  gallery lit     │  │  photo        │ │
│  ├──────────────────┤  ├──────────────────┤  ├───────────────┤ │
│  │ WALNUT SERIES    │  │ CANVAS EDITIONS  │  │ THE GIFT EDIT │ │
│  │ [Jost, gold, sm] │  │ [Jost, gold, sm] │  │ [Jost, gold]  │ │
│  │ The Oslo Frame   │  │ Large Format Art │  │ For Someone   │ │
│  │ [Cormorant Italic│  │ [Cormorant Italic│  │ Special       │ │
│  │  28px, ivory]    │  │  28px, ivory]    │  │ [Corm. Italic]│ │
│  │ Explore →        │  │ Explore →        │  │ Explore →     │ │
│  │ [Jost, gold]     │  │ [Jost, gold]     │  │ [Jost, gold]  │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

TABLET: 2 cards visible + horizontal scroll hint for 3rd
        Cards: 48% width each with gap

MOBILE: 1 card full width, scroll horizontally (snap scroll)
        Each card: full-width, 3:4 ratio image + text below
```

### Card Interaction
- Default: 1px gold border at 15% opacity
- Hover (desktop): border to 40% opacity + image scale 1.02 + gold line draws from bottom (400ms)
- Tap (mobile/tablet): immediate scale 0.98 then restore — tactile press feel

### Collections
| # | Name | Emotion | Photography |
|---|------|---------|-------------|
| 1 | **The Walnut Series** | Warmth, heritage, craft | Close detail of wood grain + frame in a study |
| 2 | **Canvas Editions** | Artistic, expressive, gallery | Large canvas on a gallery-style white wall with warm lighting |
| 3 | **The Gift Edit** | Love, milestone, occasion | Hands holding a wrapped box with ribbon, soft bokeh |

---

## 05 — Craftsmanship

### Purpose
To **build credibility and desire** by showing what goes into making each piece. This section turns a product into a craft object — elevating its perceived value before the visitor ever sees a price.

### Luxury Rationale
Luxury is justified by process. Showing craft — materials, hands, detail — triggers the psychological value signal that says "this is worth more". It is the difference between buying a frame and commissioning a work.

### Layout

```
DESKTOP (50/50 split, full width, 2 sub-sections alternating):

Sub-section A (image left, text right, dark bg):
┌──────────────────────────────────────────────────────────┐
│  ┌───────────────────────┐   THE CRAFT                   │
│  │                       │   [Jost, gold, ALL CAPS]      │
│  │  [MACRO PHOTO:        │                               │
│  │   hands applying      │   Every frame begins          │
│  │   finish to frame]    │   as a conversation.          │
│  │   Shallow DOF,        │   [Cormorant, 44px, ivory]    │
│  │   warm lighting]      │                               │
│  │                       │   We start with the           │
│  └───────────────────────┘   photograph — its            │
│                              proportions, its mood,      │
│                              its light.                  │
│                              [Jost, 16px, pewter, 1.8lh] │
│                                                          │
│                              LEARN ABOUT OUR PROCESS →   │
│                              [Jost, gold, text link]     │
└──────────────────────────────────────────────────────────┘

Sub-section B (text left, image right, ivory/linen bg):
┌──────────────────────────────────────────────────────────┐
│  OUR MATERIALS                                           │
│  [Jost, gold, ALL CAPS]                                  │
│                                                          │
│  Chosen for how they age.         ┌──────────────────┐  │
│  [Cormorant, 40px, obsidian]      │ [MACRO PHOTO:    │  │
│                                   │  wood grain,     │  │
│  European walnut. Museum glass.   │  close-up,       │  │
│  Archival backing. Every detail   │  raking light]   │  │
│  chosen to protect what's inside. │                  │  │
│  [Jost, 16px, pewter]             └──────────────────┘  │
│                                                          │
│  ─────  [3 material pills: Walnut · Glass · Linen]       │
└──────────────────────────────────────────────────────────┘

TABLET: Same layout, images slightly smaller (45% width)

MOBILE: Stacked — image full width on top, text below
        Image: 4:3 ratio
        Text: left-aligned, full-width, generous padding
```

### Material Callout Pills (Mobile-friendly chips)
```
[ Solid Walnut ]  [ Museum Glass ]  [ Archival Backing ]  [ Hand-Finished ]
[Jost 11px, ALL CAPS, gold border, transparent bg, rounded-sm]
```

---

## 06 — Customer Stories (Art Wall)

### Purpose
To provide **social proof through beauty** — real customers, real homes, real frames. Not reviews with star ratings. A visual community wall that shows the product living in the world.

### Luxury Rationale
Luxury social proof is not testimonials — it's aspiration. Seeing a beautiful home with an ODSArts frame makes the visitor think: "My home could look like that." This section sells lifestyle, not product.

### Layout

```
DESKTOP (Masonry grid, full width, dark bg):
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              In their homes.                                    │
│     [Cormorant Italic, 56px, ivory, centered]                   │
│     Frames made for real walls, real light, real lives.         │
│     [Jost, 14px, pewter, centered, tracking 0.1em]              │
│                                                                 │
│  ┌────────┐  ┌──────────┐  ┌───────┐  ┌──────────┐            │
│  │ [IMG]  │  │ [IMG]    │  │ [IMG] │  │ [IMG]    │            │
│  │ 3:4    │  │ 4:3      │  │ 1:1   │  │ 3:4      │            │
│  │ tall   │  │ wide     │  │ sqr   │  │ tall     │            │
│  └────────┘  │          │  └───────┘  │          │            │
│              └──────────┘             └──────────┘            │
│  ┌──────────────┐  ┌──────┐  ┌────────────┐                   │
│  │ [IMG]        │  │[IMG] │  │ [IMG]      │                   │
│  │ 16:9 wide    │  │ 1:1  │  │ 3:4        │                   │
│  └──────────────┘  └──────┘  └────────────┘                   │
│                                                                 │
│              [ VIEW MORE STORIES → ]                            │
│              [ghost button, centered]                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

TABLET: 2-column masonry grid, still mixed ratios

MOBILE: Single column, uniform 4:3 ratio, scroll vertically
        Show 4 images, "View More" loads next 4 (lazy load)
```

### Hover State (Desktop)
On hover, each image dims to 80% brightness and reveals:
```
┌──────────────────────────┐
│  [image at 80% opacity]  │
│   ✦  Priya · Mumbai      │
│   [Jost 12px, ivory]     │
│   The Oslo Frame         │
│   [Cormorant Italic, sm] │
└──────────────────────────┘
```

---

## 07 — Best Sellers

### Purpose
To **surface the most proven products** at the exact moment the visitor has been emotionally warmed by the brand. They now trust ODSArts — now they can be shown what to buy.

### Luxury Rationale
Placement matters enormously. Best sellers placed here (after craft and stories) convert differently than best sellers in a cold hero carousel. The visitor has been primed to value the product.

### Layout

```
DESKTOP (4-column product grid, linen bg #EDE8DE):
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│    BEST SELLERS       Our most beloved pieces. [Jost, pewter]    │
│    [Jost, gold, sm]                                              │
│                                                                  │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│ │[PRODUCT  │  │[PRODUCT  │  │[PRODUCT  │  │[PRODUCT  │         │
│ │ IMAGE    │  │ IMAGE    │  │ IMAGE    │  │ IMAGE    │         │
│ │ 3:4]     │  │ 3:4]     │  │ 3:4]     │  │ 3:4]     │         │
│ ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤         │
│ │WALNUT    │  │ CANVAS   │  │ MAPLE    │  │ CLASSIC  │         │
│ │SERIES    │  │ EDITIONS │  │ GALLERY  │  │ BLACK    │         │
│ │[Jost, xs]│  │[Jost, xs]│  │[Jost, xs]│  │[Jost, xs]│         │
│ │The Oslo  │  │ Midnight │  │The Milan │  │The Paris │         │
│ │Frame     │  │ Bloom    │  │Frame     │  │Frame     │         │
│ │[Corm.    │  │[Corm.    │  │[Corm.    │  │[Corm.    │         │
│ │Italic]   │  │Italic]   │  │Italic]   │  │Italic]   │         │
│ │₹ 12,400  │  │₹ 18,000  │  │₹ 9,800   │  │₹ 11,200  │         │
│ │[Jost,    │  │[Jost,    │  │[Jost,    │  │[Jost,    │         │
│ │ gold, sb]│  │ gold, sb]│  │ gold, sb]│  │ gold, sb]│         │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
│                                                                  │
│                 [ VIEW ALL PRODUCTS → ]                          │
└──────────────────────────────────────────────────────────────────┘

TABLET: 2-column grid, same card structure

MOBILE: 1.5 column — first card full, second card partially visible
        Indicates horizontal scroll (snap scroll)
        Or: 2-column tighter grid at 375px+
```

### Product Card Anatomy
```
┌─────────────────────┐
│  [Product image     │  ← full-bleed, no padding, 3:4 ratio
│   3:4 ratio]        │
│   ↑ hover: + icon   │  ← on hover: small "+" appears (Quick View)
├─────────────────────┤  ← 1px gold rule (15% opacity)
│ WALNUT SERIES       │  ← Jost 10px, ALL CAPS, gold, tracking 0.2em
│ The Oslo Frame      │  ← Cormorant Garamond Italic, 22px, obsidian
│ 30×40 cm           │  ← Jost 13px, pewter
│ ₹ 12,400            │  ← Jost SemiBold, 20px, gold
│ [ ADD TO CART ]     │  ← ghost button, appears on hover
└─────────────────────┘
```

---

## 08 — Wall Inspiration Gallery

### Purpose
To show **ODSArts products in interior design context** — giving the visitor a vision of what their space could become. This is pure aspiration.

### Luxury Rationale
Interior design brands like HAY, Muuto, and premium decor labels always show rooms, not products. The visitor doesn't buy a frame — they buy the feeling of that room. This section sells the lifestyle.

### Layout

```
DESKTOP (Horizontal scroll marquee or 2-row mosaic, dark bg):
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│    WALL INSPIRATION         Find your room. Find your frame.     │
│    [Jost, gold, ALL CAPS]   [Jost, pewter]                       │
│                                                                  │
│  Style filters:  [ ALL ]  [ MINIMAL ]  [ WARM ]  [ GALLERY ]    │
│  [Jost 11px, ALL CAPS, pill buttons, gold border]                │
│                                                                  │
│  ━━━━ AUTO-SCROLLING MOSAIC ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  ┌────────┐  ┌──────────────┐  ┌────────┐  ┌──────────────┐     │
│  │[ROOM   │  │[ROOM PHOTO   │  │[ROOM   │  │[ROOM PHOTO   │     │
│  │PHOTO]  │  │wide format]  │  │PHOTO]  │  │wide format]  │     │
│  │portrait│  │landscape     │  │portrait│  │landscape     │     │
│  └────────┘  └──────────────┘  └────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌────────┐  ┌──────────────┐  ┌────────┐     │
│  │[wide format] │  │[square]│  │[wide format] │  │[square]│     │
│  └──────────────┘  └────────┘  └──────────────┘  └────────┘     │
│                                                                  │
│                [ GET INSPIRED → ]  [ghost button]                │
└──────────────────────────────────────────────────────────────────┘

TABLET: Same but 2-row mosaic, no auto-scroll — manual swipe

MOBILE: Horizontal snap scroll, single row, each image 85vw wide
        Style filters scroll horizontally too (pill row)
```

### Image Hover (Desktop)
Each image on hover shows:
- Dimmed to 85% brightness
- Small tag in bottom-left: frame name + Jost 11px + gold
- "Shop this frame →" text link

---

## 09 — Custom Framing Process

### Purpose
To **remove purchase anxiety** by making the ordering process feel simple, guided, and personal. Luxury buyers need to understand what they're getting into before committing.

### Luxury Rationale
Complexity is the enemy of luxury conversion. Breaking the process into 4 clear steps — shown elegantly — transforms something potentially intimidating into a ritual. It feels like working with an artisan, not filling out a form.

### Layout

```
DESKTOP (4-step horizontal timeline, full width, ivory/linen bg):
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│             HOW IT WORKS                                         │
│    [Jost, gold, ALL CAPS, centered]                              │
│    Your frame, made for you.                                     │
│    [Cormorant Italic, 40px, obsidian, centered]                  │
│                                                                  │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│       ↓             ↓             ↓             ↓               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │   01    │  │   02    │  │   03    │  │   04    │           │
│  │ [icon:  │  │ [icon:  │  │ [icon:  │  │ [icon:  │           │
│  │  photo] │  │  frame] │  │  craft] │  │  ship]  │           │
│  ├─────────┤  ├─────────┤  ├─────────┤  ├─────────┤           │
│  │ CHOOSE  │  │ SELECT  │  │ WE      │  │ ARRIVES │           │
│  │ YOUR    │  │ YOUR    │  │ CRAFT   │  │ READY   │           │
│  │ PHOTO   │  │ FRAME   │  │ IT      │  │ TO HANG │           │
│  │         │  │         │  │         │  │         │           │
│  │ Upload  │  │ Browse  │  │ Hand-   │  │ In      │           │
│  │ or send │  │ sizes,  │  │ crafted │  │ premium │           │
│  │ to us.  │  │ finishes│  │ in 5–7  │  │ packag- │           │
│  │         │  │ & mats. │  │ days.   │  │ ing.    │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
│  [Jost ALL CAPS gold sm]    [Jost Regular 14px pewter]           │
│                                                                  │
│              [ START YOUR CUSTOM FRAME → ]                       │
│              [Primary filled gold button, centered]              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

TABLET: Same 4-step layout, slightly compressed card widths

MOBILE: Vertical timeline — steps stacked, 1 per row
        Gold vertical line on left, step numbers on line
        Cards: left icon, right text
        ┌──────────────────────────────┐
        │  ●  01  CHOOSE YOUR PHOTO   │
        │  │      Upload or send to   │
        │  │      us. We'll advise.   │
        │  │                          │
        │  ●  02  SELECT YOUR FRAME   │
        │  │      Sizes, finishes...  │
        └──────────────────────────────┘
```

### Step Icons
- Simple line-art icons, gold stroke, no fill — consistent 24×24px
- Step 01: Camera / photograph icon
- Step 02: Frame / border icon
- Step 03: Hands / craft icon
- Step 04: Box / package icon

---

## 10 — Testimonials

### Purpose
To **validate the emotional purchase decision** with proof that others have felt what the visitor is now feeling. Not star ratings — full human moments.

### Luxury Rationale
Luxury buyers need emotional validation, not metric validation. A 4.9 star average means nothing. A quote like "I didn't expect to cry opening a frame" means everything. The format is editorial, not transactional.

### Layout

```
DESKTOP (full-width, single centered quote, dark bg):
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                           "                                      │
│                [oversized gold quotation mark, 120px]            │
│                                                                  │
│     "The frame arrived and I stood in my hallway for ten         │
│      minutes just holding it. My mother's wedding photograph     │
│      has never looked like that before."                         │
│                                                                  │
│     [Cormorant Light Italic, 32px, ivory, centered, max-w 700px] │
│                                                                  │
│                ─── ANANYA S. · BANGALORE ───                     │
│     [Jost, 11px, pewter, ALL CAPS, tracking 0.2em, centered]     │
│     The Oslo Frame, Walnut Series                                │
│     [Cormorant Upright, 13px, gold, centered]                    │
│                                                                  │
│                ○  ●  ○  ○  [dot navigation, gold]                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

TABLET: Same layout, headline 28px
MOBILE: Same layout, headline 22px, quote max 80vw wide
        Dots for navigation shown, swipe to advance
```

### Carousel Behaviour
- Auto-advance every 6 seconds (long enough to read)
- Crossfade transition, 600ms
- Pause on hover / on touch
- Manual dots: gold fill = active, gold 20% opacity = inactive
- Minimum 4–6 quotes curated from real customers

---

## 11 — Gifting Banner (Final CTA Section)

### Purpose
To **convert visitors who haven't bought for themselves** by reframing the purchase as a gift. This widens the audience at the point of highest intent — the visitor has now seen everything.

### Luxury Rationale
Gifting is the highest-value entry point for luxury items. Someone buying a gift has fewer price objections — they want to give something beautiful and memorable. This section addresses them directly.

### Layout

```
DESKTOP (full-bleed image section, 70vh):
┌──────────────────────────────────────────────────────────────────┐
│  [Full-bleed background: unboxing photo — hands with tissue,     │
│   a framed print wrapped in linen, dark warm background]         │
│                                                                  │
│  [Dark gradient overlay from transparent to 85% at bottom]       │
│                                                                  │
│                                                                  │
│                                                                  │
│                                                                  │
│   Give the wall                                                  │
│   something worth looking at.                                    │
│   [Cormorant Light, 56px, ivory, bottom-left, desktop]           │
│                                                                  │
│   Free gift wrapping · Handwritten note · Express delivery        │
│   [Jost, 14px, ivory 70%, tracking 0.08em]                       │
│                                                                  │
│   [  SHOP GIFTS  ]    [  BUILD YOUR OWN  ]                       │
│   [Gold filled]       [Gold ghost]                               │
└──────────────────────────────────────────────────────────────────┘

TABLET: Content centered, 60vh
MOBILE: Content bottom-aligned, headline 32px, buttons stacked
        Buttons full-width, 52px height
```

---

## 12 — Footer

### Purpose
To provide **wayfinding, trust signals, and brand closing**. The footer is the last thing a visitor sees — it should feel like the back of a beautiful book: complete, considered, calm.

### Luxury Rationale
A cheap footer betrays an entire luxury experience. ODSArts footer is spacious, typographically precise, and contains only what matters. No cookie banners cluttering it. No aggressive newsletter pop-ups.

### Layout

```
DESKTOP (4-column, dark obsidian, generous padding):
┌──────────────────────────────────────────────────────────────────┐
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [1px gold rule, full width — the gallery closes]                │
│                                                                  │
│  ODSArts            SHOP             ABOUT           CONTACT     │
│  [Cormorant,        Collections      Our Story       hello@      │
│   24px, ivory]      Best Sellers     Craftsmanship   odsarts.in  │
│                     Custom Framing   Sustainability              │
│  "Where memory      The Gift Edit    Press                       │
│   becomes art."                                                  │
│  [Cormorant         HELP             FOLLOW                      │
│   Italic, 16px,     Shipping Info    @odsarts                    │
│   pewter]           Returns          Instagram                   │
│                     Care Guide       Pinterest                   │
│                     FAQ              Pinterest                   │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  © 2026 ODSArts     Privacy Policy   Terms         Made in India │
│  [Jost, 11px, pewter, tracking 0.08em]                          │
└──────────────────────────────────────────────────────────────────┘

TABLET: 2-column — Brand+Shop on left, About+Help on right
         Social links below both columns

MOBILE: Accordion footer — each section collapses/expands
        Brand block always visible at top (logo + tagline)
        Bottom bar: © + Privacy + Terms (2-col)
```

### Footer Newsletter (Inline, understated)
```
[Below the main columns, above bottom bar]
─────────────────────────────────
Stay in the studio.   [  your@email.com  ]  [ → ]
[Jost, 12px, pewter]  [Input: gold border]  [gold arrow]
```

---

## Scroll Pacing Map

```
SECTION           VIEWPORT HEIGHT   EMOTIONAL PURPOSE
────────────────────────────────────────────────────────
Navigation        Fixed/floating    Brand signal
Hero              100vh             STOP. Create desire.
Brand Statement   50vh              Pause. Build belief.
Collections       auto (~70vh)      Orient. Curate.
Craftsmanship     auto (~80vh)      Justify. Elevate value.
Customer Stories  auto (~60vh)      Aspire. Social proof.
Best Sellers      auto (~70vh)      BUY MOMENT #1
Wall Inspiration  auto (~60vh)      Dream. Visualise.
Custom Process    auto (~60vh)      Reduce anxiety.
Testimonials      60vh              Validate emotion.
Gifting Banner    70vh              BUY MOMENT #2 (gift)
Footer            auto              Close. Navigate.
```

---

## CTA Architecture

The homepage has exactly **2 primary buy moments** — both come after emotional warm-up:

| # | Position | CTA | Audience |
|---|----------|-----|---------|
| 1 | Hero | `EXPLORE THE COLLECTION →` | Everyone |
| 2 | Best Sellers | `VIEW ALL PRODUCTS →` | Warm visitors |
| 3 | Custom Process | `START YOUR CUSTOM FRAME →` | Custom intent |
| 4 | Gifting Banner | `SHOP GIFTS` + `BUILD YOUR OWN` | Gift buyers |

**Rule:** Never show more than one CTA in any single section. Never repeat the same CTA twice in a row.

---

## Animation Sequence Map

| Section | Entry Animation | Trigger |
|---------|----------------|---------|
| Hero | Fade in + parallax | Page load |
| Brand Statement | Lines reveal staggered (200ms) | Scroll enter |
| Collections | Cards slide up (100ms stagger) | Scroll enter |
| Craftsmanship | Split reveal (image left, text right) | Scroll enter |
| Customer Stories | Grid items fade in (organic order) | Scroll enter |
| Best Sellers | Cards slide up (50ms stagger) | Scroll enter |
| Wall Inspiration | Images drift in horizontally | Scroll enter |
| Process Steps | Steps reveal left → right (100ms stagger) | Scroll enter |
| Testimonials | Quote crossfades | Auto + manual |
| Gifting | Background parallax + text fade | Scroll enter |
| Footer | Columns fade in | Scroll enter |
