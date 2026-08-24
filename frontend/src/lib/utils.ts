// Utility functions
// Reference: agents/11-implementation-roadmap.md → lib/utils.ts

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Class name merger — combine Tailwind classes safely
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
