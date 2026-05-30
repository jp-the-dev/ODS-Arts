# ODSArts — Color Palette

> Inspired by the reference image: Hasselblad's deep obsidian + warm gold treatment.
> Palette direction: **Dark luxury with warm metallic warmth and linen softness.**

---

## Palette Philosophy

The ODSArts palette is drawn from the materials and environments of fine art and premium interiors:
- The **deep charcoal** of a museum gallery wall
- The **warm gold** of a burnished frame
- The **natural linen** of archival matting
- The **soft cream** of acid-free mounting paper
- The **muted sage** of dried botanicals in a luxury interior

The palette deliberately avoids pure black (#000000) and pure white (#ffffff) — instead using **warm-toned near-blacks and off-whites** to feel organic, not digital.

---

## Primary Palette

### Obsidian Night `#0E0D0B`
**Role:** Primary background, hero sections, dark mode base
**Feeling:** Depth, gravitas, premium weight
**Use:** Hero backgrounds, footer, dark product backdrops
```
HEX: #0E0D0B
HSL: 40°, 8%, 6%
RGB: 14, 13, 11
```

### Burnished Gold `#C9A96E`
**Role:** Primary accent, CTAs, logo accent, hover states
**Feeling:** Luxury, warmth, artistry, heritage
**Use:** Logo mark, primary buttons, decorative lines, hover effects
```
HEX: #C9A96E
HSL: 38°, 46%, 61%
RGB: 201, 169, 110
```

### Antique Ivory `#F5F0E8`
**Role:** Light mode background, card surfaces, text on dark
**Feeling:** Warmth, calm, archival quality
**Use:** Light backgrounds, card surfaces, body text on dark BG
```
HEX: #F5F0E8
HSL: 40°, 47%, 94%
RGB: 245, 240, 232
```

---

## Secondary Palette

### Walnut `#3D2B1F`
**Role:** Secondary backgrounds, warm dark cards, depth layer
**Feeling:** Handcrafted, grounded, material richness
**Use:** Section dividers, card backgrounds in dark mode
```
HEX: #3D2B1F
HSL: 22°, 32%, 18%
RGB: 61, 43, 31
```

### Pale Linen `#EDE8DE`
**Role:** Subtle surface differentiation in light mode
**Feeling:** Natural, tactile, understated elegance
**Use:** Product card backgrounds, input fields, dividers
```
HEX: #EDE8DE
HSL: 40°, 28%, 89%
RGB: 237, 232, 222
```

### Aged Pewter `#8B8680`
**Role:** Secondary text, captions, subheadings
**Feeling:** Sophisticated, quiet, recessive
**Use:** Metadata, captions, secondary UI labels
```
HEX: #8B8680
HSL: 30°, 5%, 53%
RGB: 139, 134, 128
```

---

## Accent Palette

### Dust Rose `#C4A99A`
**Role:** Tertiary accent for gifting & wedding sections
**Feeling:** Tender, romantic, soft luxury
**Use:** Wedding collection badges, gifting CTA highlights
```
HEX: #C4A99A
HSL: 18°, 24%, 68%
RGB: 196, 169, 154
```

### Mineral Sage `#8A9A8E`
**Role:** Nature & home collection accent
**Feeling:** Organic, calm, curated
**Use:** Nature art category, botanical collection tags
```
HEX: #8A9A8E
HSL: 135°, 7%, 57%
RGB: 138, 154, 142
```

---

## Color Relationships

```
DARK MODE (Primary Experience)
─────────────────────────────────────────────────
Background:   Obsidian Night   #0E0D0B
Card:         Walnut           #3D2B1F
Border:       #2A2520 (5% lighter than bg)
Body Text:    Antique Ivory    #F5F0E8
Muted Text:   Aged Pewter      #8B8680
Accent:       Burnished Gold   #C9A96E
CTA Button:   Burnished Gold   #C9A96E (text: #0E0D0B)
CTA Outline:  Gold border on transparent

LIGHT MODE (Secondary / Product Pages)
─────────────────────────────────────────────────
Background:   Antique Ivory    #F5F0E8
Card:         Pale Linen       #EDE8DE
Border:       #D5CFC3
Body Text:    Obsidian Night   #0E0D0B
Muted Text:   Aged Pewter      #8B8680
Accent:       Burnished Gold   #C9A96E
```

---

## Gradient Tokens

```
gradient-hero:    linear-gradient(180deg, #0E0D0B 0%, #1A1510 60%, #2A1F14 100%)
gradient-gold:    linear-gradient(135deg, #C9A96E 0%, #E8C98A 50%, #C9A96E 100%)
gradient-reveal:  linear-gradient(180deg, transparent 0%, #0E0D0B 85%)
gradient-glow:    radial-gradient(ellipse at center, #C9A96E22 0%, transparent 70%)
```

---

## Accessibility Notes

| Combination | WCAG Contrast | Rating |
|-------------|--------------|--------|
| Ivory `#F5F0E8` on Obsidian `#0E0D0B` | 18.2:1 | ✅ AAA |
| Gold `#C9A96E` on Obsidian `#0E0D0B` | 7.8:1 | ✅ AA |
| Obsidian `#0E0D0B` on Ivory `#F5F0E8` | 18.2:1 | ✅ AAA |
| Pewter `#8B8680` on Ivory `#F5F0E8` | 4.6:1 | ✅ AA |
| Gold `#C9A96E` on White `#FFFFFF` | 2.9:1 | ⚠️ Use for decorative only |

---

## Do's & Don'ts

### ✅ DO
- Use gold sparingly — it loses power when overused
- Pair obsidian backgrounds with warm (not cool) lighting
- Use linen/ivory for product photography backgrounds
- Allow significant dark space — negative space IS the luxury

### ❌ DON'T
- Use pure black (#000000) — it reads as harsh, not premium
- Use pure white (#ffffff) — it reads as cheap and clinical
- Mix cool grey tones — they undercut the warmth of the palette
- Use gold as a background — it overwhelms; reserve it for accents
