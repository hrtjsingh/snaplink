import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectDB } from '@/lib/mongodb'
import { normalizePageCode } from '@/lib/page-code'
import { generateSlug, sanitizeHTML, sanitizeCSS } from '@/lib/utils'
import { Page } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const result = await db.collection('pages').insertOne(page)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      slug: slug,
    })
  } catch (error) {
    console.error('Error creating page:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
