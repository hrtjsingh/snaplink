import type { MetadataRoute } from 'next'
import { getAppBaseUrl } from '@/lib/app-seo'
import { connectDB } from '@/lib/mongodb'
import { getBlockedUserIds } from '@/lib/moderation'
import { getPublicPagesBaseUrl } from '@/lib/user-pages-origin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = await getAppBaseUrl()
  const pagesBaseUrl = await getPublicPagesBaseUrl()

  const db = await connectDB()
  const pages = await db
    .collection('pages')
    .find({
      visibility: 'public',
      blocked: { $ne: true },
    })
    .project({ slug: 1, ownerId: 1, updatedAt: 1 })
    .sort({ updatedAt: -1 })
    .limit(5000)
    .toArray()

  const ownerIds = pages
    .map((page) => page.ownerId as string)
    .filter(Boolean)
  const blockedOwners = await getBlockedUserIds(ownerIds)

  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((page) => !blockedOwners.has(page.ownerId as string))
    .map((page) => ({
      url: `${pagesBaseUrl}/r/${page.slug as string}`,
      lastModified: (page.updatedAt as Date | undefined) ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...pageEntries,
  ]
}
