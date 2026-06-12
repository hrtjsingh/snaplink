import { getServerOrigin } from '@/lib/base-url'

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, '')
}

/** Dedicated origin for published user pages, e.g. https://pages.snaplink.com */
export function getUserPagesOrigin(): string | null {
  const origin = process.env.USER_PAGES_ORIGIN?.trim()
  return origin ? normalizeOrigin(origin) : null
}

export async function getPublicPageUrl(slug: string): Promise<string> {
  const userOrigin = getUserPagesOrigin()
  if (userOrigin) return `${userOrigin}/r/${slug}`

  const appOrigin = await getServerOrigin()
  return `${appOrigin}/r/${slug}`
}

export function getPublicPagePath(slug: string): string {
  return `/r/${slug}`
}

export async function getPublicPagesBaseUrl(): Promise<string> {
  return getUserPagesOrigin() ?? (await getServerOrigin())
}
