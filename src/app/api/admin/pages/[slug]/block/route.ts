import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/admin'
import { blockPage, unblockPage } from '@/lib/moderation'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const adminId = await requireSuperAdmin()
    const { slug } = await params

    const blocked = await blockPage(slug, adminId)
    if (!blocked) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, blocked: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin block page error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireSuperAdmin()
    const { slug } = await params

    const unblocked = await unblockPage(slug)
    if (!unblocked) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, blocked: false, message: 'Page unblocked' })
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin unblock page error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
