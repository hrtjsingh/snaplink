import type { Metadata } from 'next'
import { getServerOrigin } from '@/lib/base-url'

export const SITE_NAME = 'Snaplink'
export const SITE_TAGLINE = 'Paste code, get a link'
export const DEFAULT_DESCRIPTION =
  'Paste HTML, CSS, and JavaScript. Publish shareable web pages instantly with analytics, PWA support, and public links.'
export const DEFAULT_KEYWORDS = [
  'web page builder',
  'HTML hosting',
  'paste code get link',
  'static site',
  'share web pages',
  'no-code publishing',
  'Snaplink',
]
export const DEFAULT_OG_IMAGE = '/icon.svg'

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, '')
}

/** Sync site URL for metadataBase and static metadata exports. */
export function getConfiguredSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return normalizeOrigin(fromEnv)

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '')}`

  return 'http://localhost:3000'
}

/** Resolve the main marketing app origin at request time. */
export async function getAppBaseUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return normalizeOrigin(fromEnv)
  return getServerOrigin()
}

export const NO_INDEX_ROBOTS: Metadata['robots'] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
}

export const INDEX_ROBOTS: Metadata['robots'] = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true },
}

export function buildMarketingMetadata(options: {
  title: string
  description?: string
  path?: string
  index?: boolean
}): Metadata {
  const baseUrl = getConfiguredSiteUrl()
  const path = options.path ?? '/'
  const canonicalUrl = path === '/' ? baseUrl : `${baseUrl}${path}`
  const description = options.description ?? DEFAULT_DESCRIPTION

  return {
    title: options.title,
    description,
    keywords: DEFAULT_KEYWORDS,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: options.title,
      description,
      url: canonicalUrl,
      locale: 'en_US',
      images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: options.index === false ? NO_INDEX_ROBOTS : INDEX_ROBOTS,
  }
}

export function buildRootLayoutMetadata(): Metadata {
  const baseUrl = getConfiguredSiteUrl()

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${SITE_NAME} — ${SITE_TAGLINE}`,
      template: `%s · ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: DEFAULT_KEYWORDS,
    authors: [{ name: SITE_NAME, url: baseUrl }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: 'technology',
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: DEFAULT_DESCRIPTION,
      url: baseUrl,
      locale: 'en_US',
      images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME, width: 512, height: 512 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: DEFAULT_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: INDEX_ROBOTS,
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
    },
  }
}

export function buildWebSiteJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: siteUrl,
  }
}

export function buildOrganizationJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: siteUrl,
    logo: `${siteUrl}${DEFAULT_OG_IMAGE}`,
    description: DEFAULT_DESCRIPTION,
  }
}

export function buildSoftwareApplicationJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    url: siteUrl,
    description: DEFAULT_DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free during beta',
    },
  }
}
