import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { nanoid } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(): string {
  return nanoid(8) // Generates 8-character slug like "2B5fWbEk"
}

export function sanitizeHTML(html: string): string {
  // Basic sanitization - in production use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
}

export function sanitizeCSS(css: string): string {
  // Basic CSS sanitization
  return css
    .replace(/@import\s+/gi, '') // Remove @import
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/javascript:/gi, '') // Remove javascript: in CSS
}
