// Utility functions
// Reference: agents/11-implementation-roadmap.md → lib/utils.ts

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Class name merger — combine Tailwind classes safely
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Format price in INR
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Truncate text to a character limit with ellipsis
export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length).trimEnd() + '…' : text
}
