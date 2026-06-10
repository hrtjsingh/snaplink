import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectDB } from '@/lib/mongodb'
import { normalizePageCode } from '@/lib/page-code'
import { sanitizeHTML, sanitizeCSS } from '@/lib/utils'

async function getOwnedPage(slug: string, userId: string) {
  const db = await connectDB()
  return db.collection('pages').findOne({ slug, ownerId: userId })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: slug } = await params
    const page = await getOwnedPage(slug, userId)

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json({
      slug: page.slug,
      title: page.title,
      description: page.description,
      html: page.html,
      css: page.css,
      js: page.js,
      visibility: page.visibility,
      pwaEnabled: page.pwaEnabled !== false,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: slug } = await params
    const page = await getOwnedPage(slug, userId)

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, html, css, js, visibility, pwaEnabled } = body

    if (!title || !html) {
      return NextResponse.json(
        { error: 'Title and HTML are required' },
        { status: 400 }
      )
    }

    const normalized = normalizePageCode(html, css, js)
    const db = await connectDB()
    await db.collection('pages').updateOne(
      { slug, ownerId: userId },
      {
        $set: {
          title: title.trim(),
          description: description?.trim() || '',
          html: sanitizeHTML(normalized.html),
          css: sanitizeCSS(normalized.css),
          js: normalized.js,
          visibility: visibility || 'public',
          pwaEnabled:
            (visibility || 'public') === 'public' ? pwaEnabled !== false : false,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ success: true, slug })
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: slug } = await params
    const page = await getOwnedPage(slug, userId)

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const db = await connectDB()
    await Promise.all([
      db.collection('pages').deleteOne({ slug, ownerId: userId }),
      db.collection('page_views').deleteMany({ slug }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
