export type Collection = {
  slug: string
  number: string
  eyebrow: string
  title: string
  description: string
  longDescription: string
  materials: string[]
  features: string[]
  imageSrc: string
  imageAlt: string
  imagePosition: 'left' | 'right'
}

export const COLLECTIONS: Collection[] = [
  {
    slug: 'walnut',
    number: '01',
    eyebrow: 'Signature Wood',
    title: 'The Walnut Series',
    description: 'Crafted from rich natural walnut, designed for timeless family portraits and heirloom memories. The warmth of the wood perfectly complements both black-and-white and color photography.',
    longDescription: 'The Walnut Series represents our commitment to natural beauty and enduring craftsmanship. Each frame is cut from solid, sustainably sourced American walnut, selected for its distinct grain patterns and deep, warming tones. We employ a hand-rubbed oil finish that nourishes the wood and allows it to age gracefully over generations. This series doesn\'t just display a photograph; it grounds it with an organic, tactile presence that grounds a room.',
    materials: ['Solid American Walnut', 'Museum-Grade Anti-Reflective Glass', 'Acid-Free Archival Matting'],
    features: ['Hand-rubbed oil finish', 'Spline-joined corners for heirloom strength', 'Custom depths available for floating artwork'],
    imageSrc: '/images/collections/walnut.png',
    imageAlt: 'Close up of a luxury walnut wood picture frame',
    imagePosition: 'left',
  },
  {
    slug: 'gallery',
    number: '02',
    eyebrow: 'Minimalist Architecture',
    title: 'The Gallery Series',
    description: 'Ultra-thin, structural, and unapologetically modern. The Gallery Series uses powder-coated aluminum to let your artwork or photography speak entirely for itself.',
    longDescription: 'When the image must command the room entirely, The Gallery Series steps back. Engineered from aerospace-grade aluminum, the profile is astonishingly thin yet perfectly rigid, capable of supporting massive oversized prints without bowing. Finished in a matte, light-absorbing powder coat, these frames create a razor-sharp boundary that elevates contemporary photography and abstract art to a gallery standard.',
    materials: ['Aerospace-Grade Aluminum', 'UV-Protective Acrylic', 'Floating Mount Spacers'],
    features: ['Ultra-thin 5mm face profile', 'Matte black light-absorbing finish', 'Rigid structure for oversized prints'],
    imageSrc: '/images/collections/gallery.png',
    imageAlt: 'A minimalist gallery wall with multiple thin black frames',
    imagePosition: 'right',
  },
  {
    slug: 'heritage',
    number: '03',
    eyebrow: 'Vintage Opulence',
    title: 'The Heritage Collection',
    description: 'Ornate, gilded, and meticulously detailed. The Heritage Collection brings museum-quality grandeur into your home, perfect for classical paintings or bold statement portraiture.',
    longDescription: 'The Heritage Collection is a love letter to the golden age of framing. Each piece is intricately molded and hand-gilded by our master artisans using traditional water gilding techniques. The resulting finish catches the light with a warmth and depth that modern machinery simply cannot replicate. Designed for statement portraiture, oil paintings, and spaces that demand undeniable grandeur.',
    materials: ['Hand-Gilded 22k Gold Leaf', 'Archival Backing Board', '8-Ply Beveled Museum Matting'],
    features: ['Traditional water gilding technique', 'Intricate relief detailing', 'Subtle antiquing to highlight depth'],
    imageSrc: '/images/collections/heritage.png',
    imageAlt: 'A beautiful vintage ornate gold heritage picture frame',
    imagePosition: 'left',
  },
]
