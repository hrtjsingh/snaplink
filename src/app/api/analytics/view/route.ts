import { NextRequest, NextResponse } from 'next/server'
import { completePageView, recordPageView } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.viewId && typeof body.durationMs === 'number') {
      const updated = await completePageView(body.viewId, body.durationMs)
      if (!updated) {
        return NextResponse.json({ error: 'View not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true })
    }

    const { slug } = body
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const referrer = request.headers.get('referer') ?? undefined
    const result = await recordPageView(slug, referrer)

    if (!result) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error recording view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { viewId, durationMs } = body

    if (!viewId || typeof durationMs !== 'number' || durationMs < 0) {
      return NextResponse.json(
        { error: 'viewId and durationMs are required' },
        { status: 400 }
      )
    }

    const updated = await completePageView(viewId, durationMs)

    if (!updated) {
      return NextResponse.json({ error: 'View not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
