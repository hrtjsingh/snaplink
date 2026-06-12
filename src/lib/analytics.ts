import { Db, ObjectId } from 'mongodb'
import { connectDB } from '@/lib/mongodb'
import { checkPublicPageAccess } from '@/lib/moderation'
import type { PageStats, PlatformStats, UserAnalytics } from '@/lib/types'

export const BOUNCE_THRESHOLD_MS = 10_000

let indexesEnsured = false

async function ensureIndexes(db: Db) {
  if (indexesEnsured) return
  await db.collection('page_views').createIndexes([
    { key: { slug: 1, viewedAt: -1 } },
    { key: { ownerId: 1, viewedAt: -1 } },
    { key: { viewedAt: -1 } },
  ])
  indexesEnsured = true
}

function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function previousMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1)
}

export function calcGrowth(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

export function formatGrowth(growth: number | null): string {
  if (growth === null) return 'No prior data'
  const sign = growth >= 0 ? '+' : ''
  return `${sign}${growth}% from last month`
}

async function aggregateViewMetrics(
  db: Db,
  match: Record<string, unknown>
): Promise<{
  viewCount: number
  bounceRate: number
  avgDurationMs: number
  viewsThisMonth: number
  viewsLastMonth: number
  lastViewedAt: Date | null
}> {
  const now = new Date()
  const thisMonth = monthStart(now)
  const lastMonth = previousMonthStart(now)

  const [stats] = await db.collection('page_views').aggregate([
    { $match: match },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              viewCount: { $sum: 1 },
              bounced: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $eq: ['$bounced', true] },
                        {
                          $and: [
                            { $ne: ['$durationMs', null] },
                            { $lt: ['$durationMs', BOUNCE_THRESHOLD_MS] },
                          ],
                        },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              withDuration: {
                $sum: { $cond: [{ $gt: ['$durationMs', 0] }, 1, 0] },
              },
              totalDuration: {
                $sum: { $cond: [{ $gt: ['$durationMs', 0] }, '$durationMs', 0] },
              },
              lastViewedAt: { $max: '$viewedAt' },
            },
          },
        ],
        thisMonth: [
          { $match: { viewedAt: { $gte: thisMonth } } },
          { $count: 'count' },
        ],
        lastMonth: [
          {
            $match: {
              viewedAt: { $gte: lastMonth, $lt: thisMonth },
            },
          },
          { $count: 'count' },
        ],
      },
    },
  ]).toArray()

  const totals = stats?.totals?.[0]
  const viewCount = totals?.viewCount ?? 0
  const bounced = totals?.bounced ?? 0
  const withDuration = totals?.withDuration ?? 0
  const totalDuration = totals?.totalDuration ?? 0

  return {
    viewCount,
    bounceRate: viewCount > 0 ? Math.round((bounced / viewCount) * 100) : 0,
    avgDurationMs: withDuration > 0 ? Math.round(totalDuration / withDuration) : 0,
    viewsThisMonth: stats?.thisMonth?.[0]?.count ?? 0,
    viewsLastMonth: stats?.lastMonth?.[0]?.count ?? 0,
    lastViewedAt: totals?.lastViewedAt ?? null,
  }
}

export async function recordPageView(slug: string, referrer?: string) {
  const db = await connectDB()
  await ensureIndexes(db)

  const page = await db.collection('pages').findOne({ slug, visibility: 'public' })
  if (!page) return null

  const access = await checkPublicPageAccess(page)
  if (!access.allowed) return null

  const viewedAt = new Date()
  const result = await db.collection('page_views').insertOne({
    slug,
    ownerId: page.ownerId,
    viewedAt,
    referrer: referrer || null,
  })

  await db.collection('pages').updateOne(
    { slug },
    {
      $inc: { viewCount: 1 },
      $set: { lastViewedAt: viewedAt },
    }
  )

  return { viewId: result.insertedId.toString() }
}

export async function completePageView(viewId: string, durationMs: number) {
  const db = await connectDB()
  await ensureIndexes(db)

  if (!ObjectId.isValid(viewId)) return false

  const bounced = durationMs < BOUNCE_THRESHOLD_MS
  const result = await db.collection('page_views').updateOne(
    { _id: new ObjectId(viewId) },
    { $set: { durationMs, bounced } }
  )

  return result.modifiedCount > 0
}

export async function getPageStats(
  slug: string,
  title: string,
  visibility: 'public' | 'private' = 'public',
  description = ''
): Promise<PageStats> {
  const db = await connectDB()
  await ensureIndexes(db)

  const metrics = await aggregateViewMetrics(db, { slug })
  const page = await db.collection('pages').findOne({ slug })

  return {
    slug,
    title,
    description: page?.description ?? description,
    visibility: page?.visibility ?? visibility,
    viewCount: page?.viewCount ?? metrics.viewCount,
    lastViewedAt: metrics.lastViewedAt ?? page?.lastViewedAt ?? null,
    bounceRate: metrics.bounceRate,
    avgDurationMs: metrics.avgDurationMs,
    viewsThisMonth: metrics.viewsThisMonth,
    viewsLastMonth: metrics.viewsLastMonth,
  }
}

export async function getUserAnalytics(userId: string): Promise<UserAnalytics> {
  const db = await connectDB()
  await ensureIndexes(db)

  const pages = await db
    .collection('pages')
    .find({ ownerId: userId })
    .sort({ createdAt: -1 })
    .toArray()

  const pageStats = await Promise.all(
    pages.map((page) =>
      getPageStats(
        page.slug,
        page.title,
        page.visibility as 'public' | 'private',
        page.description as string
      )
    )
  )

  const totalPages = pages.length
  const publicPages = pages.filter((p) => p.visibility === 'public').length
  const totalViews = pageStats.reduce((sum, p) => sum + p.viewCount, 0)
  const viewsThisMonth = pageStats.reduce((sum, p) => sum + p.viewsThisMonth, 0)
  const viewsLastMonth = pageStats.reduce((sum, p) => sum + p.viewsLastMonth, 0)

  const pagesWithViews = pageStats.filter((p) => p.viewCount > 0)
  const avgBounceRate =
    pagesWithViews.length > 0
      ? Math.round(
          pagesWithViews.reduce((sum, p) => sum + p.bounceRate, 0) /
            pagesWithViews.length
        )
      : 0

  const pagesWithDuration = pageStats.filter((p) => p.avgDurationMs > 0)
  const avgDurationMs =
    pagesWithDuration.length > 0
      ? Math.round(
          pagesWithDuration.reduce((sum, p) => sum + p.avgDurationMs, 0) /
            pagesWithDuration.length
        )
      : 0

  return {
    totalPages,
    publicPages,
    totalViews,
    avgViewsPerPage: totalPages > 0 ? Math.round(totalViews / totalPages) : 0,
    avgBounceRate,
    avgDurationMs,
    viewsThisMonth,
    viewsLastMonth,
    monthOverMonthGrowth: calcGrowth(viewsThisMonth, viewsLastMonth),
    pages: pageStats,
  }
}

export interface DailyViewCount {
  date: string
  count: number
}

export async function getDailyViews(
  userId: string,
  days = 7
): Promise<DailyViewCount[]> {
  const db = await connectDB()
  await ensureIndexes(db)

  const since = new Date()
  since.setDate(since.getDate() - (days - 1))
  since.setHours(0, 0, 0, 0)

  const results = await db
    .collection('page_views')
    .aggregate([
      { $match: { ownerId: userId, viewedAt: { $gte: since } } },
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
    results.map((r) => [r._id as string, r.count as number])
  )

  const daily: DailyViewCount[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    daily.push({ date: key, count: countsByDate.get(key) ?? 0 })
  }

  return daily
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const db = await connectDB()
  await ensureIndexes(db)

  const now = new Date()
  const thisMonth = monthStart(now)
  const lastMonth = previousMonthStart(now)

  const [pageCounts, creatorCount, viewMetrics, pagesThisMonth, pagesLastMonth] =
    await Promise.all([
      db.collection('pages').countDocuments({ visibility: 'public' }),
      db.collection('pages').distinct('ownerId'),
      aggregateViewMetrics(db, {}),
      db.collection('pages').countDocuments({
        visibility: 'public',
        createdAt: { $gte: thisMonth },
      }),
      db.collection('pages').countDocuments({
        visibility: 'public',
        createdAt: { $gte: lastMonth, $lt: thisMonth },
      }),
    ])

  const engagementRate =
    viewMetrics.viewCount > 0 ? 100 - viewMetrics.bounceRate : 0

  return {
    totalPages: pageCounts,
    totalViews: viewMetrics.viewCount,
    totalCreators: creatorCount.length,
    engagementRate,
    avgDurationMs: viewMetrics.avgDurationMs,
    viewsThisMonth: viewMetrics.viewsThisMonth,
    viewsLastMonth: viewMetrics.viewsLastMonth,
    pagesGrowth: calcGrowth(pagesThisMonth, pagesLastMonth),
    viewsGrowth: calcGrowth(
      viewMetrics.viewsThisMonth,
      viewMetrics.viewsLastMonth
    ),
  }
}
