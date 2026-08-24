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

export const NAV_LINKS = [
  { label: 'Collections', href: '/collections' },
  { label: 'Art', href: '/art' },
  { label: 'Custom Framing', href: '/custom-framing' },
  { label: 'About', href: '/about' },
  { label: 'Gifting', href: '/gifting' },
  { label: 'Inspiration', href: '/inspiration' },
] as const
