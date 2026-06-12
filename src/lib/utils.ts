import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { nanoid } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(): string {
  return nanoid(8) // Generates 8-character slug like "2B5fWbEk"
}

export { sanitizeHTML, sanitizeCSS } from '@/lib/sanitize'
