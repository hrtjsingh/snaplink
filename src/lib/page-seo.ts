import type { Metadata } from 'next'
import { sanitizeHTML } from '@/lib/sanitize'
import { getPublicPageUrl } from '@/lib/user-pages-origin'
import {
  DEFAULT_OG_IMAGE,
  INDEX_ROBOTS,
  NO_INDEX_ROBOTS,
  SITE_NAME,
} from '@/lib/app-seo'

export function htmlToPlainText(html: string): string {
  if (!html?.trim()) return ''
  return sanitizeHTML(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trim()}…`
}

export function buildPageDescription(
  description: string | undefined,
  html: string
): string | undefined {
  const fromField = description?.trim()
  if (fromField) return truncate(fromField, 160)

  const fromHtml = htmlToPlainText(html)
  if (fromHtml) return truncate(fromHtml, 160)

  return undefined
}

export interface PageSeoInput {
  slug: string
  title: string
  description?: string
  html: string
  visibility: 'public' | 'private'
  updatedAt?: Date
}

export async function buildPublicPageMetadata(
  page: PageSeoInput
): Promise<Metadata> {
  const canonicalUrl = await getPublicPageUrl(page.slug)
  const metaDescription = buildPageDescription(page.description, page.html)
  const isIndexable = page.visibility === 'public'

  return {
    title: page.title,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: page.title,
      description: metaDescription,
      url: canonicalUrl,
      images: [{ url: DEFAULT_OG_IMAGE, alt: page.title }],
    },
    twitter: {
      card: 'summary',
      title: page.title,
      description: metaDescription,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: isIndexable ? INDEX_ROBOTS : NO_INDEX_ROBOTS,
  }
}

export function buildWebPageJsonLd(options: {
  title: string
  description?: string
  url: string
  dateModified?: Date
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: options.title,
    description: options.description,
    url: options.url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
    },
    ...(options.dateModified
      ? { dateModified: options.dateModified.toISOString() }
      : {}),
  }
}
