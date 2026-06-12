import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { recordPageView } from '@/lib/analytics'
import { normalizePageCode } from '@/lib/page-code'
import {
  buildUserPageDocument,
  USER_CONTENT_DOCUMENT_CSP,
} from '@/lib/page-document'
import { checkPublicPageAccess } from '@/lib/moderation'
import { getPageFallbackHtml } from '@/components/PageFallback'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const db = await connectDB()
    const page = await db.collection('pages').findOne({ slug })
    const access = await checkPublicPageAccess(page)

    if (!access.allowed || !page) {
      const reason = !access.allowed ? access.reason : 'not_found'

      return new NextResponse(getPageFallbackHtml(reason, slug), {
        status: reason === 'not_found' || reason === 'private' ? 404 : 403,
        headers: { 'Content-Type': 'text/html' },
      })
    }

    await recordPageView(slug, request.headers.get('referer') ?? undefined)

    const { html, css, js } = normalizePageCode(
      page.html,
      page.css ?? '',
      page.js ?? ''
    )

    const assembledHTML = buildUserPageDocument({
      title: page.title as string,
      description: page.description as string | undefined,
      html,
      css,
      js,
    })

    return new NextResponse(assembledHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': USER_CONTENT_DOCUMENT_CSP,
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
      },
    })
  } catch (error) {
    console.error('Error rendering page:', error)
    return new NextResponse('Internal server error', {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      },
    })
  }
}
