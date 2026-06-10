import { NextResponse } from 'next/server'
import { getOriginFromRequest } from '@/lib/base-url'
import { connectDB } from '@/lib/mongodb'
import { buildManifest, isPwaInstallable } from '@/lib/pwa'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const db = await connectDB()
  const page = await db.collection('pages').findOne({ slug })

  if (!page || !isPwaInstallable(page.visibility, page.pwaEnabled)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const origin = getOriginFromRequest(request)
  const manifest = buildManifest(
    slug,
    page.title,
    page.description ?? '',
    origin
  )

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
