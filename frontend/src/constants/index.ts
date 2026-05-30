// Brand constants — non-CSS values for use in OG images, canvas, metadata, etc.
// Reference: agents/03-color-palette.md, agents/01-brand-identity.md

export const BRAND = {
  name: 'ODSArts',
  tagline: 'Where memory becomes art.',
  email: 'hello@odsarts.in',
  instagram: 'https://instagram.com/odsarts',
  pinterest: 'https://pinterest.com/odsarts',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://odsarts.in',
} as const

export const COLORS = {
  obsidian: '#0E0D0B',
  gold: '#C9A96E',
  ivory: '#F5F0E8',
  walnut: '#3D2B1F',
  pewter: '#8B8680',
  linenWhite: '#FAF7F2',
  ashGrey: '#D4CFC8',
  warmBlack: '#1A1410',
  deepGold: '#A07840',
  champagne: '#E8D5B0',
} as const

export const BREAKPOINTS = {
  xs: 320,
  sm: 375,
  md: 640,
  lg: 768,
  xl: 1024,
  '2xl': 1280,
  '3xl': 1440,
  '4xl': 1920,
  '5xl': 2560,
} as const

export const NAV_LINKS = [
  { label: 'Collections', href: '/collections' },
  { label: 'Custom Framing', href: '/custom-framing' },
  { label: 'Craftsmanship', href: '/about' },
  { label: 'Gifting', href: '/gifting' },
  { label: 'Inspiration', href: '/inspiration' },
] as const

export const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Choose Your Photo',
    description: "Upload or send us your photograph. We'll advise on print size and composition.",
  },
  {
    number: '02',
    title: 'Select Your Frame',
    description: 'Browse sizes, finishes, mat colours, and glass options.',
  },
  {
    number: '03',
    title: 'We Craft It',
    description: 'Hand-finished in our studio. Every frame inspected before it leaves.',
  },
  {
    number: '04',
    title: 'Arrives Ready to Hang',
    description: 'In premium packaging with hanging hardware included.',
  },
] as const

export const INSPIRATION_STYLES = ['minimal', 'warm', 'gallery'] as const

export const GOLD_RULE = {
  sm: 40,   // px — centered short rule (Brand Statement section)
  full: '100%', // full-width (Footer top rule)
} as const
