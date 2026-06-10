import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { recordPageView } from '@/lib/analytics'
import { externalLinkHandlerScript } from '@/lib/external-links'
import { normalizePageCode } from '@/lib/page-code'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const db = await connectDB()
    const page = await db.collection('pages').findOne({ slug })

    if (!page || page.visibility === 'private') {
      return new NextResponse('Page not found', { 
        status: 404,
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }

    await recordPageView(slug, request.headers.get('referer') ?? undefined)

    const { html, css, js } = normalizePageCode(
      page.html,
      page.css ?? '',
      page.js ?? ''
    )

    const assembledHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  ${page.description ? `<meta name="description" content="${page.description}">` : ''}
  ${css ? `<style>\n${css}\n</style>` : ''}
</head>
<body>
${html}
${js ? `<script>\n${js}\n</script>\n` : ''}<script>${externalLinkHandlerScript}</script>
</body>
</html>`

    return new NextResponse(assembledHTML, {
      headers: {
        'Content-Type': 'text/html',
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