# ODSArts — Brand System Index

> **Version:** 1.0  
> **Created:** May 2026  
> **Status:** Foundation — Ready for Development

This folder contains the complete brand identity and design system for **ODSArts** — a premium photo frame and wall art ecommerce brand.

---

## Brand in One Sentence

> *ODSArts creates handcrafted frames and wall art that transform photographs into timeless works of art — for people who believe their walls should mean something.*

---

## Brand Core

| Element | Definition |
|---------|-----------|
| **Tagline** | *"Where memory becomes art."* |
| **Archetype** | Creator + Caregiver |
| **Tone** | Quiet confidence, poetic restraint |
| **Aesthetic** | Dark luxury, warm gold, archival warmth |
| **Competitors** | Aura Frames, Desenio, Simply Framed |
| **Inspirations** | Apple, Aesop, Hasselblad, luxury interiors |

---

## Knowledge Files

| # | File | Description |
|---|------|-------------|
| 01 | [01-brand-identity.md](./01-brand-identity.md) | Mission, vision, pillars, origin story |
| 02 | [02-brand-personality.md](./02-brand-personality.md) | Voice, tone, personas, copy rules |
| 03 | [03-color-palette.md](./03-color-palette.md) | Full color system with hex codes and usage |
| 04 | [04-typography.md](./04-typography.md) | Font system, type scale, pairing rules |
| 05 | [05-homepage-visual-direction.md](./05-homepage-visual-direction.md) | Section-by-section homepage design brief |
| 06 | [06-design-principles.md](./06-design-principles.md) | The 7 design laws + layout/component rules |
| 07 | [07-ui-moodboard.md](./07-ui-moodboard.md) | Textual moodboard and visual references |
| 08 | [08-tailwind-tokens.md](./08-tailwind-tokens.md) | Complete Tailwind config + CSS custom properties |
| 09 | [09-homepage-wireframe.md](./09-homepage-wireframe.md) | Full UX wireframe — all 12 sections with rationale |
| 10 | [10-responsive-screen-sizes.md](./10-responsive-screen-sizes.md) | Responsive system — 320px to 2560px, all devices |
| 11 | [11-implementation-roadmap.md](./11-implementation-roadmap.md) | Frontend architecture — folder structure, components, tokens, dev order |
| 12 | [12-homepage-dependency-map.md](./12-homepage-dependency-map.md) | Component dependency map & implementation order |

---

## At-a-Glance: The Brand System

### Colors (Core 5)
```
Obsidian Night  #0E0D0B  — Primary background
Burnished Gold  #C9A96E  — Primary accent & CTA
Antique Ivory   #F5F0E8  — Text & light backgrounds
Walnut          #3D2B1F  — Dark secondary surface
Aged Pewter     #8B8680  — Secondary text & labels
```

### Fonts (Two Only)
```
Display / Headings:  Cormorant Garamond (Google Fonts, free)
Body / UI:           Jost (Google Fonts, free)
```

### Design Laws (7)
1. Restraint is luxury
2. Every touchpoint has weight
3. Warm, not cold
4. Typography leads emotion
5. Gold is a promise, not a pattern
6. Photography is the product
7. Motion has purpose

---

## Quick Reference: Do & Don't

| ✅ DO | ❌ DON'T |
|-------|---------|
| Use Obsidian `#0E0D0B` as base background | Use pure black `#000000` |
| Use Cormorant Garamond for headlines | Mix more than 2 typefaces |
| Use gold sparingly (max 3× per viewport) | Use gold as a background fill |
| Use generous white/dark space | Fill every pixel with content |
| Show products in real home environments | Use white studio backgrounds only |
| Use `ease-luxury` cubic-bezier transitions | Use `linear` or `bounce` easing |
| Write sparse, weighted copy | Write exclamation-mark copy |
| Use 1px gold borders on cards | Use heavy box-shadows |

---

## For Developers

All Tailwind tokens are in `08-tailwind-tokens.md`.
Copy the `tailwind.config.ts` block and the `globals.css` block directly into the project.

**Key utility compositions:**
- Eyebrow label: `font-body text-label-sm uppercase tracking-label text-gold-mid`
- Display headline: `font-display text-display text-ivory font-light tracking-tightest`
- Ghost CTA: `border border-gold-mid text-gold-mid hover:bg-gold-mid hover:text-obsidian`

---

## For Content Creators

**Voice checklist before publishing any copy:**
- [ ] Does it lead with feeling, not feature?
- [ ] Is every word earning its place?
- [ ] Does it avoid exclamation marks?
- [ ] Is it warm without being casual?
- [ ] Would a master craftsperson say this?
- [ ] Does it honor the customer's intelligence?

---

*This brand system is a living document. Update as the brand evolves.*
