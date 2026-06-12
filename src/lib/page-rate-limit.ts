import type { Db } from 'mongodb'
import { connectDB } from '@/lib/mongodb'

export const DAILY_PAGE_CREATION_LIMIT = 3

export interface PageCreationLimit {
  userId: string
  dateKey: string
  count: number
  createdAt: Date
  updatedAt: Date
}

export interface PageCreationStatus {
  limit: number
  used: number
  remaining: number
  resetAt: string
}

let indexesEnsured = false

export function getUtcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function getNextUtcMidnight(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)
  )
}

async function ensureRateLimitIndexes(db: Db) {
  if (indexesEnsured) return
  await db.collection('page_creation_limits').createIndexes([
    { key: { userId: 1, dateKey: 1 }, unique: true },
    { key: { dateKey: 1 } },
  ])
  indexesEnsured = true
}

export async function getPageCreationStatus(
  userId: string
): Promise<PageCreationStatus> {
  const db = await connectDB()
  await ensureRateLimitIndexes(db)

  const dateKey = getUtcDateKey()
  const doc = await db
    .collection<PageCreationLimit>('page_creation_limits')
    .findOne({ userId, dateKey })

  const used = doc?.count ?? 0
  const remaining = Math.max(0, DAILY_PAGE_CREATION_LIMIT - used)

  return {
    limit: DAILY_PAGE_CREATION_LIMIT,
    used,
    remaining,
    resetAt: getNextUtcMidnight().toISOString(),
  }
}

type ReserveResult =
  | { ok: true; remaining: number }
  | { ok: false; status: PageCreationStatus }

export async function reservePageCreationSlot(
  userId: string
): Promise<ReserveResult> {
  const db = await connectDB()
  await ensureRateLimitIndexes(db)

  const dateKey = getUtcDateKey()
  const now = new Date()
  const coll = db.collection<PageCreationLimit>('page_creation_limits')

  const updated = await coll.findOneAndUpdate(
    {
      userId,
      dateKey,
      $or: [
        { count: { $lt: DAILY_PAGE_CREATION_LIMIT } },
        { count: { $exists: false } },
      ],
    },
    {
      $inc: { count: 1 },
      $set: { updatedAt: now },
      $setOnInsert: { userId, dateKey, createdAt: now },
    },
    { upsert: true, returnDocument: 'after' }
  )

  const count = updated?.count ?? 0

  if (!updated || count > DAILY_PAGE_CREATION_LIMIT) {
    if (updated && count > DAILY_PAGE_CREATION_LIMIT) {
      await coll.updateOne({ userId, dateKey }, { $inc: { count: -1 } })
    }

    return {
      ok: false,
      status: await getPageCreationStatus(userId),
    }
  }

  return {
    ok: true,
    remaining: Math.max(0, DAILY_PAGE_CREATION_LIMIT - count),
  }
}

export async function releasePageCreationSlot(userId: string): Promise<void> {
  const db = await connectDB()
  const dateKey = getUtcDateKey()

  await db.collection('page_creation_limits').updateOne(
    { userId, dateKey, count: { $gt: 0 } },
    { $inc: { count: -1 }, $set: { updatedAt: new Date() } }
  )
}
