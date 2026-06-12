import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectDB } from '@/lib/mongodb'
import {
  DAILY_PAGE_CREATION_LIMIT,
  getPageCreationStatus,
  releasePageCreationSlot,
  reservePageCreationSlot,
} from '@/lib/page-rate-limit'
import { normalizePageCode } from '@/lib/page-code'
import { assertUserCanCreateContent } from '@/lib/moderation'
import { generateSlug, sanitizeHTML, sanitizeCSS } from '@/lib/utils'
import { Page } from '@/lib/types'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = await getPageCreationStatus(userId)
    return NextResponse.json(status)
  } catch (error) {
    console.error('Error fetching page creation limit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      await assertUserCanCreateContent(userId)
    } catch {
      return NextResponse.json(
        { error: 'Your account has been restricted. You cannot create new pages.' },
        { status: 403 }
      )
    }

    const slot = await reservePageCreationSlot(userId)
    if (!slot.ok) {
      return NextResponse.json(
        {
          error: `Daily limit reached. You can create up to ${DAILY_PAGE_CREATION_LIMIT} pages per day.`,
          ...slot.status,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { title, description, html, css, js, visibility, pwaEnabled } = body

    if (!title || !html) {
      await releasePageCreationSlot(userId)
      return NextResponse.json(
        { error: 'Title and HTML are required' }, 
        { status: 400 }
      )
    }

    const normalized = normalizePageCode(html, css, js)
    const sanitizedHTML = sanitizeHTML(normalized.html)
    const sanitizedCSS = sanitizeCSS(normalized.css)

    const db = await connectDB()
    const slug = generateSlug()

    const page: Omit<Page, '_id'> = {
      ownerId: userId,
      title: title.trim(),
      description: description?.trim() || '',
      html: sanitizedHTML,
      css: sanitizedCSS,
      js: normalized.js,
      slug,
      visibility: visibility || 'public',
      pwaEnabled:
        (visibility || 'public') === 'public' ? pwaEnabled !== false : false,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
    }

    try {
      const result = await db.collection('pages').insertOne(page)

      return NextResponse.json({
        success: true,
        id: result.insertedId,
        slug: slug,
        remaining: slot.remaining,
      })
    } catch (insertError) {
      await releasePageCreationSlot(userId)
      throw insertError
    }
  } catch (error) {
    console.error('Error creating page:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
