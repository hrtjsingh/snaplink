import { connectDB } from '@/lib/mongodb'

export interface BlockedUser {
  userId: string
  blockedAt: Date
  blockedBy: string
  reason?: string
}

let indexesEnsured = false

async function ensureModerationIndexes() {
  if (indexesEnsured) return
  const db = await connectDB()
  await db.collection('blocked_users').createIndexes([
    { key: { userId: 1 }, unique: true },
    { key: { blockedAt: -1 } },
  ])
  await db.collection('pages').createIndex({ blocked: 1 })
  indexesEnsured = true
}

export async function isUserBlocked(userId: string): Promise<boolean> {
  await ensureModerationIndexes()
  const db = await connectDB()
  const doc = await db.collection('blocked_users').findOne({ userId })
  return Boolean(doc)
}

export async function getBlockedUserIds(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set()

  await ensureModerationIndexes()
  const db = await connectDB()
  const docs = await db
    .collection('blocked_users')
    .find({ userId: { $in: userIds } })
    .project({ userId: 1 })
    .toArray()

  return new Set(docs.map((doc) => doc.userId as string))
}

export type PublicPageAccess =
  | { allowed: true }
  | { allowed: false; reason: 'page_blocked' | 'user_blocked' | 'not_found' | 'private' }

export async function checkPublicPageAccess(
  page: Record<string, unknown> | null | undefined
): Promise<PublicPageAccess> {
  if (!page) return { allowed: false, reason: 'not_found' }
  if (page.visibility === 'private') return { allowed: false, reason: 'private' }
  if (page.blocked) return { allowed: false, reason: 'page_blocked' }
  const ownerId = page.ownerId
  if (typeof ownerId === 'string' && (await isUserBlocked(ownerId))) {
    return { allowed: false, reason: 'user_blocked' }
  }
  return { allowed: true }
}

export async function blockUser(
  userId: string,
  blockedBy: string,
  reason?: string
): Promise<void> {
  await ensureModerationIndexes()
  const db = await connectDB()
  const now = new Date()

  await db.collection('blocked_users').updateOne(
    { userId },
    {
      $set: {
        userId,
        blockedAt: now,
        blockedBy,
        ...(reason ? { reason } : {}),
      },
    },
    { upsert: true }
  )
}

export async function unblockUser(userId: string): Promise<boolean> {
  await ensureModerationIndexes()
  const db = await connectDB()
  const result = await db.collection('blocked_users').deleteOne({ userId })
  return result.deletedCount > 0
}

export async function blockPage(
  slug: string,
  blockedBy: string,
  reason?: string
): Promise<boolean> {
  await ensureModerationIndexes()
  const db = await connectDB()
  const result = await db.collection('pages').updateOne(
    { slug },
    {
      $set: {
        blocked: true,
        blockedAt: new Date(),
        blockedBy,
        ...(reason ? { blockReason: reason } : {}),
        updatedAt: new Date(),
      },
    }
  )
  return result.matchedCount > 0
}

export async function unblockPage(slug: string): Promise<boolean> {
  await ensureModerationIndexes()
  const db = await connectDB()
  const result = await db.collection('pages').updateOne(
    { slug },
    {
      $set: {
        blocked: false,
        updatedAt: new Date(),
      },
      $unset: { blockedAt: '', blockedBy: '', blockReason: '' },
    }
  )
  return result.matchedCount > 0
}

export async function isPageBlocked(slug: string): Promise<boolean> {
  await ensureModerationIndexes()
  const db = await connectDB()
  const page = await db.collection('pages').findOne(
    { slug },
    { projection: { blocked: 1 } }
  )
  return Boolean(page?.blocked)
}

export async function adminDeletePage(slug: string): Promise<boolean> {
  const db = await connectDB()
  const result = await db.collection('pages').deleteOne({ slug })
  if (result.deletedCount === 0) return false

  await db.collection('page_views').deleteMany({ slug })
  return true
}

export async function assertUserCanCreateContent(userId: string): Promise<void> {
  if (await isUserBlocked(userId)) {
    throw new Error('USER_BLOCKED')
  }
}
