import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/admin'
import { blockUser, unblockUser } from '@/lib/moderation'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminId = await requireSuperAdmin()
    const { userId } = await params

    if (adminId === userId) {
      return NextResponse.json(
        { error: 'You cannot block your own account' },
        { status: 400 }
      )
    }

    await blockUser(userId, adminId)
    return NextResponse.json({ success: true, blocked: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin block user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireSuperAdmin()
    const { userId } = await params

    const unblocked = await unblockUser(userId)
    if (!unblocked) {
      return NextResponse.json({ error: 'User is not blocked' }, { status: 404 })
    }

    return NextResponse.json({ success: true, blocked: false })
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin unblock user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
