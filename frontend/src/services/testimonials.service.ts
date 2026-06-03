// Testimonial and customer story data — Server only (uses ISR caching via apiFetch)
import { apiFetch } from '@/lib/api/client'
import type { CustomerStory, InspirationImage, Testimonial } from '@/types'

export async function getTestimonials(): Promise<Testimonial[]> {
  return apiFetch<Testimonial[]>('/testimonials', { revalidate: 3600 })
}

export async function getCustomerStories(): Promise<CustomerStory[]> {
  // Customer stories are editorial content — currently static, extend when endpoint is added
  return []
}

export async function getInspirationImages(): Promise<InspirationImage[]> {
  // Inspiration images are editorial content — currently static, extend when endpoint is added
  return []
}
