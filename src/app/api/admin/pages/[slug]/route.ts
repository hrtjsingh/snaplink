import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/admin'
import { adminDeletePage } from '@/lib/moderation'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireSuperAdmin()
    const { slug } = await params

    const deleted = await adminDeletePage(slug)
    if (!deleted) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin delete page error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
