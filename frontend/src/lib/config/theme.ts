/**
 * ODSArts — Active Theme Configuration
 *
 * Theme Direction: Luxury Ivory / White Jet
 * Updated to reflect the live implemented theme.
 *
 * Core principle:
 *   Light, warm, editorial luxury — not dark moody.
 *   The hero image (marble + framed art) is the primary visual.
 *   All surfaces are ivory-based. Gold is the accent system.
 *   Obsidian is used ONLY for text and CTAs, never as a background.
 */

// ─── Surface Palette ────────────────────────────────────────────────────────

export const SURFACES = {
  /** Page background — all sections */
  base: '#F5F0E8',       // ivory
  /** Slightly brighter surface — card highlights */
  raised: '#FAF7F2',     // linen white
  /** Subtle depth for dividers or inset panels */
  sunken: '#EDE8DE',     // ivory-200
} as const

// ─── Text Palette ────────────────────────────────────────────────────────────

export const TEXT = {
  /** Primary headings — on ivory surfaces */
  primary: '#0E0D0B',    // obsidian
  /** Warm secondary — italic accents, section sub-headings */
  secondary: '#3D2B1F',  // walnut
  /** Body copy, descriptions */
  body: '#6E6960',       // pewter-dark
  /** Muted labels, captions */
  muted: 'rgba(61,43,31,0.55)',
  /** Ivory text — for use OVER the hero image's dark centre scrim only */
  onImage: '#F5F0E8',
  /** Champagne ivory — italic hero accent over dark scrim */
  onImageAccent: '#E8D5B0',
  /** Ivory body over dark scrim */
  onImageBody: 'rgba(245,240,232,0.72)',
} as const

// ─── Accent / Brand ──────────────────────────────────────────────────────────

export const ACCENTS = {
  gold: '#C9A96E',
  goldLight: '#E8C98A',
  goldDark: '#A07840',
  goldRule: '40px',
  goldRuleFull: '100%',
} as const

// ─── Hero Scrim ──────────────────────────────────────────────────────────────
// Marble hero image is light — a warm radial scrim sits only in the centre
// to make ivory text legible without affecting image edges.

export const HERO_SCRIM = {
  /** Warm walnut-tinted elliptical gradient centred on text */
  center: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(28,20,14,0.42) 0%, transparent 100%)',
  /** Ivory bloom fills on scroll — transitions to section 2 */
  bloom: '#F5F0E8',
} as const

// ─── CTA Styles ──────────────────────────────────────────────────────────────

export const CTA = {
  /** Primary CTA — ivory fill, obsidian text, gold hover */
  primaryOnImage: {
    bg: '#F5F0E8',
    text: '#0E0D0B',
    hoverBg: '#C9A96E',
  },
  /** Primary CTA — on ivory surface */
  primaryOnSurface: {
    bg: '#0E0D0B',
    text: '#F5F0E8',
    hoverBg: '#3D2B1F',
  },
  /** Ghost CTA — underline only, obsidian toned */
  ghost: {
    text: 'rgba(61,43,31,0.55)',
    border: 'rgba(61,43,31,0.25)',
  },
} as const

// ─── Navigation ──────────────────────────────────────────────────────────────

export const NAV = {
  /** Transparent over hero — text obsidian (marble image is light) */
  transparent: {
    bg: 'transparent',
    text: '#0E0D0B',
    logo: '#0E0D0B',
  },
  /** Frosted ivory when scrolled */
  scrolled: {
    bg: 'rgba(245,240,232,0.90)',
    border: 'rgba(14,13,11,0.08)',
    text: '#0E0D0B',
    logo: '#0E0D0B',
  },
} as const

// ─── Section 2 (Brand Statement) ─────────────────────────────────────────────

export const BRAND_STATEMENT = {
  bg: '#F5F0E8',
  headingColor: '#0E0D0B',
  accentColor: '#3D2B1F',       // walnut italic
  bodyColor: '#6E6960',         // pewter-dark
  goldGlow: 'radial-gradient(ellipse at top, rgba(201,169,110,0.12) 0%, transparent 70%)',
} as const
