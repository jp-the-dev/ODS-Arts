# ODSArts — Design Tokens (Live Theme)

> **Theme Direction: Luxury Ivory / White Jet**
> This document reflects the **live implemented theme** as of current build.
> Single source of truth for all visual decisions. Every token below maps directly to a CSS variable in `src/app/globals.css` or a usage pattern in the codebase.

> [!IMPORTANT]
> ODSArts follows a **light luxury** direction — ivory surfaces, obsidian text, gold accents.
> `darkMode` is NOT active. All page backgrounds are ivory-based.

---

## Core Principle

```
Ivory base  →  Obsidian text  →  Gold accent
  #F5F0E8         #0E0D0B          #C9A96E
```

Dark tones (`obsidian`, `walnut`) are used **only for text and CTAs**, never as backgrounds.
The hero image (marble + framed art) is the primary visual element. All overlays are ivory-tinted.

---

## Color Palette

### Brand Colors

| Token | Hex | Role |
|---|---|---|
| `ivory` | `#F5F0E8` | **Primary surface** — all page backgrounds |
| `ivory-50` | `#FAF7F2` | Raised cards, subtle hover |
| `ivory-200` | `#EDE8DE` | Inset / sunken panels, dividers |
| `obsidian` | `#0E0D0B` | **Primary text**, CTAs, nav logo |
| `walnut` | `#3D2B1F` | Italic accent text, warm secondary |
| `walnut-light` | `#5C3F2E` | Hover state for dark CTAs |
| `gold` | `#C9A96E` | Accents, rules, eyebrow labels, gold rule dividers |
| `gold-light` | `#E8C98A` | Champagne — hero italic accent over scrim |
| `pewter-dark` | `#6E6960` | Body copy on ivory surfaces |
| `pewter` | `#8B8680` | Muted captions, metadata |

### Semantic Usage Map

```
Page background     →  ivory  (#F5F0E8)
Hero italic accent  →  #E8D5B0  (champagne — over dark scrim only)
Hero body text      →  rgba(245,240,232,0.72)  (over dark scrim only)
Section headings    →  obsidian  (#0E0D0B)
Section italic      →  walnut  (#3D2B1F)
Body / description  →  pewter-dark  (#6E6960)
Gold rule / lines   →  gold  (#C9A96E)
Eyebrow labels      →  gold  (#C9A96E)
```

---

## Hero Section — Image Overlay System

The hero image is a **light marble wall** — all overlays must be ivory-tinted, never dark.

```
Layer 1 — Image (animated)
  → Full bleed, scale 1.0 → 1.08 on scroll, fades out from 20%–85% scroll

Layer 2 — Centre Scrim (inside same animated wrapper)
  → radial-gradient(ellipse 70% 55% at 50% 50%, rgba(28,20,14,0.42) 0%, transparent 100%)
  → Warm walnut oval ONLY behind the text block — edges stay pristine marble
  → Animates in/out WITH the image — no flash on navigation back

Layer 3 — Scroll Bloom (ivory)
  → Triggers at 30% scroll, fills solid #F5F0E8 by 90% scroll
  → Creates seamless transition into Brand Statement section (same ivory bg)
```

> [!WARNING]
> Do NOT add any `rgba(14,13,11,...)` (obsidian) gradients to the hero as static layers.
> Static dark overlays visible during image fade-in cause a "black shadow flash" when navigating back.
> All dark tones in the hero must be inside the animated `motion.div` wrapper.

---

## Navigation

| State | Background | Text | Logo |
|---|---|---|---|
| Transparent (over hero) | `transparent` | `obsidian/65` | `obsidian` |
| Scrolled | `ivory/90` + `backdrop-blur` | `obsidian/65` | `obsidian` |

CTA button: obsidian border → fills obsidian on hover, text flips to ivory.

---

## Typography

### Font Families

| Token | Font | Usage |
|---|---|---|
| `font-display` | Cormorant | Hero headings 64px+, pull quotes |
| `font-display-heading` | Cormorant Garamond | H1–H3 section headings |
| `font-body` | Jost | All body copy, labels, buttons, nav |

### Text Scale (clamp-based, fluid)

| Token | Value | Usage |
|---|---|---|
| `text-display` | `clamp(40px, 5.5vw, 88px)` | Hero h1 |
| `text-hero` | `clamp(32px, 4.5vw, 72px)` | Large section headings |
| `text-h1` | `clamp(28px, 3.5vw, 56px)` | Page headings |
| `text-h2` | `clamp(24px, 2.8vw, 40px)` | Section subheadings |
| `text-h3` | `clamp(20px, 2vw, 30px)` | Card titles |
| `text-base` | `clamp(14px, 1.1vw, 17px)` | Body paragraphs |
| `text-label` | `12px` | Uppercase labels, eyebrows, CTAs |
| `text-label-xs` | `10px` | Micro labels, footnotes |

### Letter Spacing (Jost labels always uppercase)
```
tracking-[0.22em]  →  CTA buttons
tracking-[0.25em]  →  Eyebrow labels
tracking-[0.30em]  →  Micro labels / scroll indicators
```

---

## Button System

### Primary CTA (on ivory surface)
```css
bg-obsidian text-ivory
hover:bg-walnut
font-body text-[11px] uppercase tracking-[0.22em] px-8 py-4
transition-colors duration-500
```

### Primary CTA (on hero — over dark scrim)
```css
bg-ivory text-obsidian
hover:bg-gold hover:text-obsidian
```

### Ghost / Underline CTA
```css
border-b border-obsidian/20
text-obsidian/50 hover:text-obsidian hover:border-obsidian
pb-[2px] transition-all duration-300
```

---

## Section Layout Patterns

### Eyebrow with side rules
```tsx
<div className="flex items-center gap-4">
  <div className="h-[1px] w-12 bg-gold/50" />
  <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
    LABEL
  </span>
  <div className="h-[1px] w-12 bg-gold/50" />
</div>
```

### Display heading with italic walnut accent
```tsx
<h2 className="font-display text-[clamp(34px,4.8vw,76px)] leading-[1.06] tracking-[-0.02em] text-obsidian">
  Every frame tells<br />
  <span className="italic text-walnut">a story worth keeping.</span>
</h2>
```

### Gold rule divider
```html
<div class="w-10 h-[1.5px] bg-gold mx-auto" />
```

### Materials / tag strip
```html
<div class="flex items-center gap-3">
  <div class="w-[5px] h-[5px] rounded-full bg-gold/60" />
  <span class="font-body text-[11px] uppercase tracking-[0.25em] text-obsidian/50">
    Solid Walnut
  </span>
</div>
```

---

## Scroll & Motion

### Spring config (hero)
```ts
useSpring(scrollYProgress, { stiffness: 50, damping: 18, restDelta: 0.001 })
```

### Stagger reveal (section content)
```ts
{ delayChildren: 0.3, staggerChildren: 0.18 }
```

### Entry item
```ts
hidden: { opacity: 0, y: 18 }
visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
```

### Easing reference
```
ease-luxury  →  cubic-bezier(0.25, 0, 0, 1)   — slow out, cinematic
ease-reveal  →  cubic-bezier(0.16, 1, 0.3, 1)  — spring-like reveal
```

---

## Scrollbar
```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #F5F0E8; }   /* ivory */
::-webkit-scrollbar-thumb { background: #C9A96E; border-radius: 3px; }  /* gold */
::-webkit-scrollbar-thumb:hover { background: #A07840; }
```
