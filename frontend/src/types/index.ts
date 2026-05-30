// Core TypeScript types for ODSArts
// Reference: agents/11-implementation-roadmap.md → lib/types.ts

export interface Image {
  src: string
  alt: string
  width: number
  height: number
}

export interface Product {
  id: string
  slug: string
  name: string
  collection: string
  price: number
  dimensions: string
  material: string
  description: string
  images: Image[]
  featured: boolean
}

export interface Collection {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  coverImage: Image
  products?: Product[]
}

export interface Testimonial {
  id: string
  quote: string
  author: string
  city: string
  productName?: string
  productSlug?: string
}

export interface CustomerStory {
  id: string
  image: Image
  customerName: string
  city: string
  frameName: string
}

export type InspirationStyle = 'minimal' | 'warm' | 'gallery'

export interface InspirationImage {
  id: string
  image: Image
  style: InspirationStyle
  frameSlug?: string
  frameName?: string
}

export interface ProcessStep {
  number: string
  title: string
  description: string
}

export type ButtonVariant = 'primary' | 'ghost' | 'text'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type TextAlign = 'left' | 'center' | 'right'
export type ContainerSize = 'text' | 'content' | 'wide' | 'full'
