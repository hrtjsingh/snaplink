import { auth, clerkClient } from '@clerk/nextjs/server'

export interface ClerkUserProfile {
  userId: string
  email: string | null
  name: string | null
  username: string | null
  imageUrl: string | null
  createdAt: Date | null
  lastSignInAt: Date | null
}

function getSuperAdminIds(): string[] {
  return (
    process.env.SUPER_ADMIN_USER_IDS?.split(',')
      .map((id) => id.trim())
      .filter(Boolean) ?? []
  )
}

export function isSuperAdmin(userId: string): boolean {
  return getSuperAdminIds().includes(userId)
}

export async function requireSuperAdmin(): Promise<string> {
  const { userId } = await auth()

  if (!userId || !isSuperAdmin(userId)) {
    throw new Error('FORBIDDEN')
  }

  return userId
}

export async function getClerkUserProfile(
  userId: string
): Promise<ClerkUserProfile> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    return {
      userId,
      email: user.emailAddresses[0]?.emailAddress ?? null,
      name: user.fullName ?? null,
      username: user.username ?? null,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt ? new Date(user.createdAt) : null,
      lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt) : null,
    }
  } catch {
    return {
      userId,
      email: null,
      name: null,
      username: null,
      imageUrl: null,
      createdAt: null,
      lastSignInAt: null,
    }
  }
}

export async function getClerkUserProfiles(
  userIds: string[]
): Promise<Map<string, ClerkUserProfile>> {
  const profiles = new Map<string, ClerkUserProfile>()

  if (userIds.length === 0) return profiles

  try {
    const client = await clerkClient()
    const { data } = await client.users.getUserList({
      userId: userIds.slice(0, 100),
      limit: 100,
    })

    for (const user of data) {
      profiles.set(user.id, {
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? null,
        name: user.fullName ?? null,
        username: user.username ?? null,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt ? new Date(user.createdAt) : null,
        lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt) : null,
      })
    }
  } catch {
    // Fall back to bare user ids below.
  }

  for (const userId of userIds) {
    if (!profiles.has(userId)) {
      profiles.set(userId, {
        userId,
        email: null,
        name: null,
        username: null,
        imageUrl: null,
        createdAt: null,
        lastSignInAt: null,
      })
    }
  }

  return profiles
}
