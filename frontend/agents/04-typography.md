# ODSArts — Typography System

---

## Typography Philosophy

> Typography is the voice of the brand made visible. For ODSArts, type must feel **unhurried, refined, and deeply considered** — as if each character was chosen by a craftsperson, not a template.

ODSArts uses a **dual-font system**:
- The **Cormorant family** for emotional resonance, artistry, and display
- **Jost** for clean, modern UI hierarchy

This pairing creates tension between tradition and modernity — the same tension that makes a beautiful photograph in a hand-carved frame so compelling.

---

## Primary Typefaces

### Display & Heading — **Cormorant Garamond + The Cormorant Family**
**Source:** Google Fonts — **100% free, open license**
**Designer:** Christian Thalmann
**Classification:** Old-style serif, display
**Google Fonts URL:** [fonts.google.com/specimen/Cormorant+Garamond](https://fonts.google.com/specimen/Cormorant+Garamond)

**Why Cormorant Garamond:**
- Extremely high contrast between thick and thin strokes — mimics calligraphy and engraving
- Deeply literary and artistic heritage rooted in Claude Garamond's 16th-century types
- At large sizes, it projects gallery-worthy elegance rivalling premium licensed serifs
- Italic variant has an almost handwritten warmth — essential for ODSArts emotional moments
- Used by luxury editorial publications, fashion houses, and fine art brands worldwide
- **Free forever** — no license, no subscription, no expiry

---

### The Cormorant Family — Variant System

The Cormorant family has **6 distinct variants** on Google Fonts. Each has a distinct role in the ODSArts type system, functioning as a pseudo optical-sizing system:

| Variant | Google Fonts Name | Role | Size Range |
|---------|------------------|------|-----------|
| **Cormorant** | `Cormorant` | Purest display form, most refined strokes | 64px+ hero |
| **Cormorant Garamond** | `Cormorant Garamond` | Primary heading face, balanced & versatile | 28–64px |
| **Cormorant Infant** | `Cormorant Infant` | Warmer, more humanist — emotional body copy | 18–32px |
| **Cormorant SC** | `Cormorant SC` | Small caps — for labels, eyebrows, monograms | Any size (uppercase only) |
| **Cormorant Upright** | `Cormorant Upright` | Upright roman — structured, no italic | 16–28px captions |
| **Cormorant Unicase** | `Cormorant Unicase` | Mixed case novelty — accent use only | Decorative |

---

### Variant Usage Map (ODSArts System)

| Variant | Tailwind Token | Primary Use at ODSArts |
|---------|---------------|------------------------|
| **Cormorant** | `font-display` | Hero headlines, campaign titles |
| **Cormorant Garamond** | `font-display-heading` | H1, H2, H3 section headings |
| **Cormorant Garamond Italic** | `font-display-heading italic` | Pull quotes, product names, emotional moments |
| **Cormorant Infant** | `font-display-body` | Lead paragraphs, editorial body copy set in serif |
| **Cormorant SC** | `font-display-sc` | Eyebrow labels, monogram, brand marks |
| **Cormorant Upright** | `font-display-upright` | Captions, metadata set in serif |

---

### Weight Range (Cormorant Garamond)

| Weight | Value | Italic | Best Use |
|--------|-------|--------|---------|
| Light | 300 | ✅ | Hero display, large headlines |
| Regular | 400 | ✅ | Body headings, subheadings |
| Medium | 500 | ✅ | Emphasis within body |
| SemiBold | 600 | ✅ | Card titles, strong headings |
| Bold | 700 | ✅ | Rarely — only for extreme emphasis |

> **Light 300 italic at large size is the ODSArts signature typographic moment.** Use it for hero headlines and pull quotes.

```
Font Stacks:
Display:  'Cormorant', Georgia, 'Times New Roman', serif
Heading:  'Cormorant Garamond', Georgia, 'Times New Roman', serif
Infant:   'Cormorant Infant', Georgia, 'Times New Roman', serif
SC:       'Cormorant SC', Georgia, 'Times New Roman', serif
Upright:  'Cormorant Upright', Georgia, 'Times New Roman', serif
```

---

### Body & UI — **Jost**
**Source:** Google Fonts — **100% free**
**Classification:** Geometric sans-serif
**Weight Range:** Light (300), Regular (400), Medium (500), SemiBold (600)

**Why Jost:**
- Clean geometric structure with subtle humanist warmth
- Wide letter-spacing capability — pairs perfectly with Cormorant's expressiveness
- Versatile across navigation, buttons, labels, prices, and metadata
- Feels modern but not trendy — has longevity
- Excellent legibility on screens at small sizes

**Usage Contexts:**
- Navigation labels
- Button text (ALL CAPS, wide tracking)
- Price displays
- Form elements & inputs
- Category tags and eyebrow labels
- All utility UI text

```
Font Stack:
'Jost', 'Inter', system-ui, -apple-system, sans-serif
```

---

## Type Scale System

Using a **major third scale (1.25x ratio)** for harmony:

| Token | Size | Line Height | Font | Weight | Usage |
|-------|------|-------------|------|--------|-------|
| `--text-display` | 80px / 5rem | 1.05 | Cormorant | Light 300 | Hero headline |
| `--text-hero` | 64px / 4rem | 1.1 | Cormorant | Light 300 | Section hero |
| `--text-h1` | 48px / 3rem | 1.15 | Cormorant Garamond | Light 300 | Page title |
| `--text-h2` | 36px / 2.25rem | 1.2 | Cormorant Garamond | Regular 400 | Section title |
| `--text-h3` | 28px / 1.75rem | 1.3 | Cormorant Garamond | SemiBold 600 | Card title |
| `--text-h4` | 22px / 1.375rem | 1.35 | Cormorant Garamond | SemiBold 600 | Subsection |
| `--text-lead` | 20px / 1.25rem | 1.65 | Cormorant Infant | Regular 400 | Lead paragraph |
| `--text-xl` | 18px / 1.125rem | 1.6 | Jost | Regular 400 | Large UI body |
| `--text-base` | 16px / 1rem | 1.75 | Jost | Regular 400 | Body copy |
| `--text-sm` | 14px / 0.875rem | 1.6 | Jost | Regular 400 | Captions |
| `--text-xs` | 12px / 0.75rem | 1.5 | Jost | Medium 500 | Labels, tags |

---

## Letter-Spacing (Tracking) System

| Token | Value | Usage |
|-------|-------|-------|
| `--tracking-tight` | -0.02em | Display headlines (Cormorant at 64px+) |
| `--tracking-normal` | 0em | Body text, Cormorant Garamond headings |
| `--tracking-wide` | 0.08em | Navigation (Jost, uppercase) |
| `--tracking-wider` | 0.15em | Button labels (Jost, ALL CAPS) |
| `--tracking-widest` | 0.25em | Category eyebrow labels (Jost, ALL CAPS) |

> **Rule:** Jost in ALL CAPS with `tracking-wider` or `tracking-widest` is the signature ODSArts utility label treatment.
> **Cormorant note:** At display size (64px+), pull letter-spacing to -0.02em. At heading size (28–48px), leave at 0. Never add positive tracking to Cormorant — it breaks the rhythm of the letterforms.

---

## Type Pairing Demonstrations

### Hero Section
```
[Cormorant Light Italic 300, 80px, tracking: -0.02em, Ivory]
Art worth
living with.

[Jost Regular 400, 18px, tracking: 0.08em, Aged Pewter]
Handcrafted frames and wall art for spaces that mean something.

[Jost Medium 500, 13px, tracking: 0.25em, Burnished Gold, ALL CAPS]
EXPLORE COLLECTION →
```

### Product Name Treatment
```
[Jost Regular 400, 11px, tracking: 0.25em, ALL CAPS, Aged Pewter]
WALNUT SERIES

[Cormorant Garamond Italic 400, 28px, Ivory]
The Oslo Frame

[Cormorant Upright Regular 400, 16px, Aged Pewter]
Solid European walnut · Museum-grade glass · Archival backing

[Jost SemiBold 600, 22px, Burnished Gold]
₹12,400
```

### Pull Quote Treatment
```
[Cormorant Light Italic 300, 40px, centered, Ivory]
"I didn't expect to cry opening a frame.
Here I am."

[Jost Regular 400, 13px, tracking: 0.15em, Aged Pewter, ALL CAPS]
— PRIYA & RAHUL · MUMBAI
```

### Editorial Section (Brand Story)
```
[Cormorant SC Regular 400, 11px, tracking: 0.3em, Gold, ALL CAPS]
THE CRAFT

[Cormorant Garamond Light 300, 44px, Ivory]
Every frame begins
as a conversation.

[Cormorant Infant Regular 400, 20px, Aged Pewter, line-height: 1.7]
We start with the photograph — its proportions, its mood, its light.
Then we choose the frame not to contain it, but to complete it.
```

---

## Typographic Rules

1. **Match Cormorant variant to context** — `Cormorant` for hero display, `Cormorant Garamond` for headings, `Cormorant Infant` for lead body, `Cormorant SC` for labels, `Cormorant Upright` for captions
2. **Never use Cormorant below 16px** — the high-contrast strokes become unreadable at small sizes; use Jost instead
3. **Never add positive tracking to Cormorant** — it destroys the optical balance of the letterforms
4. **Light 300 italic is the emotional signature** — use for hero moments, pull quotes, and campaign headlines
5. **Cormorant SC is NOT for body text** — small caps only for eyebrows, labels, monograms
6. **Jost in ALL CAPS with wide tracking is the utility label voice** — never apply this treatment to Cormorant
7. **Always set `text-rendering: optimizeLegibility`** — critical for Cormorant's fine strokes on screen
8. **Maximum 3 type sizes visible per screen view** — restraint equals luxury
9. **Body line-height minimum 1.75** — generous line spacing signals premium quality
10. **Never use Cormorant Bold (700) at display size** — the strokes become too heavy; Light is always more elegant

---

## Google Fonts Import

**100% free. No license. No subscription. No expiry.**

```css
/* All Cormorant variants + Jost — paste in app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Cormorant+Infant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Cormorant+SC:wght@300;400;500;600;700&family=Cormorant+Upright:wght@300;400;500;600;700&family=Jost:wght@300;400;500;600&display=swap');
```

> **Performance tip:** In production, only load the weights and variants you actually use. The full import above is for development reference. A typical production build needs only:
> ```css
> /* Production — minimal load */
> @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cormorant+Infant:wght@0,400;1,400&family=Cormorant+SC:wght@400&family=Jost:wght@400;500;600&display=swap');
> ```

---

## Next.js Integration

Add fonts to `app/layout.tsx` using Next.js `<head>` or the `next/font/google` module:

```tsx
// app/layout.tsx — using next/font/google (recommended)
import { Cormorant, Cormorant_Garamond, Cormorant_Infant, Cormorant_SC, Jost } from 'next/font/google'

const cormorant = Cormorant({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
})

const cormorantInfant = Cormorant_Infant({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-display-body',
  display: 'swap',
})

const cormorantSC = Cormorant_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-display-sc',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${cormorantGaramond.variable} ${cormorantInfant.variable} ${cormorantSC.variable} ${jost.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
```

Then in `tailwind.config.ts`:
```ts
fontFamily: {
  'display':         ['var(--font-display)', 'Georgia', 'serif'],         // Cormorant — 64px+ hero
  'display-heading': ['var(--font-heading)', 'Georgia', 'serif'],         // Cormorant Garamond — headings
  'display-body':    ['var(--font-display-body)', 'Georgia', 'serif'],    // Cormorant Infant — lead copy
  'display-sc':      ['var(--font-display-sc)', 'Georgia', 'serif'],      // Cormorant SC — labels
  'body':            ['var(--font-body)', 'system-ui', 'sans-serif'],     // Jost — all UI
},
```

---

## Responsive Typography Behavior

| Breakpoint | Display Size | H1 Size | Body Size |
|------------|-------------|---------|-----------|
| Mobile (< 640px) | 40px | 28px | 15px |
| Tablet (640–1024px) | 56px | 36px | 16px |
| Desktop (1024–1440px) | 72px | 48px | 16px |
| Wide (> 1440px) | 88px | 56px | 18px |

Use `clamp()` for fluid typography:
```
display: clamp(40px, 5.5vw, 88px)
h1:      clamp(28px, 3.5vw, 56px)
body:    clamp(15px, 1.1vw, 18px)
```
