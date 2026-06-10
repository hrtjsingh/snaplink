import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { buildAppIconSvg, isPwaInstallable } from '@/lib/pwa'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const db = await connectDB()
  const page = await db.collection('pages').findOne({ slug })

  if (!page || !isPwaInstallable(page.visibility, page.pwaEnabled)) {
    return new NextResponse('Not found', { status: 404 })
  }

  return new NextResponse(buildAppIconSvg(page.title), {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
