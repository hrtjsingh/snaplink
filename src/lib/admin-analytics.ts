import { connectDB } from '@/lib/mongodb'
import {
  calcGrowth,
  formatDuration,
  getPlatformStats,
  type DailyViewCount,
} from '@/lib/analytics'
import { getBlockedUserIds, isUserBlocked } from '@/lib/moderation'
import { getUtcDateKey, DAILY_PAGE_CREATION_LIMIT } from '@/lib/page-rate-limit'
import type { PlatformStats } from '@/lib/types'

export interface AdminUserSummary {
  userId: string
  pageCount: number
  publicPages: number
  privatePages: number
  totalViews: number
  viewsThisMonth: number
  lastPageCreatedAt: Date | null
  pagesCreatedToday: number
  blocked: boolean
}

export interface AdminPageRow {
  slug: string
  title: string
  description: string
  ownerId: string
  visibility: 'public' | 'private'
  viewCount: number
  createdAt: Date
  updatedAt: Date
  lastViewedAt: Date | null
  blocked: boolean
  ownerBlocked: boolean
}

export type AdminActivityItem =
  | {
      type: 'page_created'
      at: Date
      userId: string
      slug: string
      title: string
    }
  | {
      type: 'page_view'
      at: Date
      userId: string
      slug: string
      referrer: string | null
    }

export interface AdminOverview {
  platform: PlatformStats
  totalUsers: number
  pagesCreatedToday: number
  viewsToday: number
  activeCreatorsToday: number
  dailyViews: DailyViewCount[]
  recentActivity: AdminActivityItem[]
}

export interface AdminUserDetail {
  summary: AdminUserSummary
  pages: AdminPageRow[]
  pagesCreatedToday: number
  dailyLimitUsed: number
  dailyLimitRemaining: number
  blocked: boolean
}

function startOfUtcDay(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const db = await connectDB()
  const today = startOfUtcDay()
  const dateKey = getUtcDateKey()

  const [
    platform,
    totalUsers,
    pagesCreatedToday,
    viewsToday,
    activeCreatorsToday,
    dailyViews,
    recentActivity,
  ] = await Promise.all([
    getPlatformStats(),
    db.collection('pages').distinct('ownerId'),
    db.collection('pages').countDocuments({ createdAt: { $gte: today } }),
    db.collection('page_views').countDocuments({ viewedAt: { $gte: today } }),
    db.collection('page_views').distinct('ownerId', { viewedAt: { $gte: today } }),
    getPlatformDailyViews(14),
    getRecentActivity(25),
  ])

  return {
    platform,
    totalUsers: totalUsers.length,
    pagesCreatedToday,
    viewsToday,
    activeCreatorsToday: activeCreatorsToday.length,
    dailyViews,
    recentActivity,
  }
}

export async function getPlatformDailyViews(days = 14): Promise<DailyViewCount[]> {
  const db = await connectDB()
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - (days - 1))
  since.setUTCHours(0, 0, 0, 0)

  const results = await db
    .collection('page_views')
    .aggregate([
      { $match: { viewedAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray()

  const countsByDate = new Map(
    results.map((row) => [row._id as string, row.count as number])
  )

  const daily: DailyViewCount[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setUTCDate(since.getUTCDate() + i)
    const key = d.toISOString().slice(0, 10)
    daily.push({ date: key, count: countsByDate.get(key) ?? 0 })
  }

  return daily
}

export async function getRecentActivity(limit = 30): Promise<AdminActivityItem[]> {
  const db = await connectDB()

  const [created, viewed] = await Promise.all([
    db
      .collection('pages')
      .find({}, { projection: { slug: 1, title: 1, ownerId: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray(),
    db
      .collection('page_views')
      .find({}, { projection: { slug: 1, ownerId: 1, viewedAt: 1, referrer: 1 } })
      .sort({ viewedAt: -1 })
      .limit(limit)
      .toArray(),
  ])

  const activity: AdminActivityItem[] = [
    ...created.map((page) => ({
      type: 'page_created' as const,
      at: page.createdAt as Date,
      userId: page.ownerId as string,
      slug: page.slug as string,
      title: page.title as string,
    })),
    ...viewed.map((view) => ({
      type: 'page_view' as const,
      at: view.viewedAt as Date,
      userId: view.ownerId as string,
      slug: view.slug as string,
      referrer: (view.referrer as string | null) ?? null,
    })),
  ]

  return activity
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, limit)
}

export async function getAdminUsers(): Promise<AdminUserSummary[]> {
  const db = await connectDB()
  const today = startOfUtcDay()
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const rows = await db
    .collection('pages')
    .aggregate([
      {
        $group: {
          _id: '$ownerId',
          pageCount: { $sum: 1 },
          publicPages: {
            $sum: { $cond: [{ $eq: ['$visibility', 'public'] }, 1, 0] },
          },
          totalViews: { $sum: { $ifNull: ['$viewCount', 0] } },
          lastPageCreatedAt: { $max: '$createdAt' },
          pagesCreatedToday: {
            $sum: { $cond: [{ $gte: ['$createdAt', today] }, 1, 0] },
          },
        },
      },
      { $sort: { lastPageCreatedAt: -1 } },
    ])
    .toArray()

  const userIds = rows.map((row) => row._id as string)
  const viewsThisMonth = await db
    .collection('page_views')
    .aggregate([
      { $match: { ownerId: { $in: userIds }, viewedAt: { $gte: thisMonth } } },
      { $group: { _id: '$ownerId', count: { $sum: 1 } } },
    ])
    .toArray()

  const viewsMap = new Map(
    viewsThisMonth.map((row) => [row._id as string, row.count as number])
  )
  const blockedIds = await getBlockedUserIds(userIds)

  return rows.map((row) => ({
    userId: row._id as string,
    pageCount: row.pageCount as number,
    publicPages: row.publicPages as number,
    privatePages: (row.pageCount as number) - (row.publicPages as number),
    totalViews: row.totalViews as number,
    viewsThisMonth: viewsMap.get(row._id as string) ?? 0,
    lastPageCreatedAt: (row.lastPageCreatedAt as Date | null) ?? null,
    pagesCreatedToday: row.pagesCreatedToday as number,
    blocked: blockedIds.has(row._id as string),
  }))
}

export async function getAdminUserDetail(
  userId: string
): Promise<AdminUserDetail | null> {
  const db = await connectDB()
  const dateKey = getUtcDateKey()

  const pages = await db
    .collection('pages')
    .find({ ownerId: userId })
    .sort({ createdAt: -1 })
    .toArray()

  if (pages.length === 0) {
    const [limitDoc, blockedOnly] = await Promise.all([
      db.collection('page_creation_limits').findOne({ userId, dateKey }),
      isUserBlocked(userId),
    ])

    if (!limitDoc && !blockedOnly) return null
  }

  const users = await getAdminUsers()
  const summary =
    users.find((user) => user.userId === userId) ??
    ({
      userId,
      pageCount: 0,
      publicPages: 0,
      privatePages: 0,
      totalViews: 0,
      viewsThisMonth: 0,
      lastPageCreatedAt: null,
      pagesCreatedToday: 0,
      blocked: false,
    } satisfies AdminUserSummary)

  const limitDoc = await db.collection('page_creation_limits').findOne({
    userId,
    dateKey,
  })
  const dailyLimitUsed = limitDoc?.count ?? 0
  const blocked = await isUserBlocked(userId)

  return {
    summary: {
      ...summary,
      blocked,
    },
    pages: pages.map((page) => ({
      slug: page.slug as string,
      title: page.title as string,
      description: (page.description as string) ?? '',
      ownerId: page.ownerId as string,
      visibility: page.visibility as 'public' | 'private',
      viewCount: (page.viewCount as number) ?? 0,
      createdAt: page.createdAt as Date,
      updatedAt: page.updatedAt as Date,
      lastViewedAt: (page.lastViewedAt as Date | null) ?? null,
      blocked: Boolean(page.blocked),
      ownerBlocked: blocked,
    })),
    pagesCreatedToday: summary.pagesCreatedToday,
    dailyLimitUsed,
    dailyLimitRemaining: Math.max(0, DAILY_PAGE_CREATION_LIMIT - dailyLimitUsed),
    blocked,
  }
}

export async function getAdminPages(limit = 100): Promise<AdminPageRow[]> {
  const db = await connectDB()

  const pages = await db
    .collection('pages')
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  const ownerIds = [...new Set(pages.map((page) => page.ownerId as string))]
  const blockedOwners = await getBlockedUserIds(ownerIds)

  return pages.map((page) => ({
    slug: page.slug as string,
    title: page.title as string,
    description: (page.description as string) ?? '',
    ownerId: page.ownerId as string,
    visibility: page.visibility as 'public' | 'private',
    viewCount: (page.viewCount as number) ?? 0,
    createdAt: page.createdAt as Date,
    updatedAt: page.updatedAt as Date,
    lastViewedAt: (page.lastViewedAt as Date | null) ?? null,
    blocked: Boolean(page.blocked),
    ownerBlocked: blockedOwners.has(page.ownerId as string),
  }))
}

export { calcGrowth, formatDuration } from '@/lib/analytics'
