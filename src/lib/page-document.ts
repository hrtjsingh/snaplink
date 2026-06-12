import { externalLinkHandlerScript } from '@/lib/external-links'
import { sandboxStoragePolyfillScript } from '@/lib/sandbox-storage-polyfill'

/**
 * CSP applied inside the sandboxed user page document. Without
 * allow-same-origin on the iframe, storage APIs use the polyfill below.
 */
export const USER_CONTENT_DOCUMENT_CSP = [
  "default-src 'none'",
  "style-src 'unsafe-inline'",
  "script-src 'unsafe-inline'",
  "img-src * data: blob:",
  "font-src * data:",
  "connect-src *",
  "media-src *",
  "child-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildUserPageDocument(options: {
  title: string
  html: string
  css?: string
  js?: string
  description?: string
  includeLinkHandler?: boolean
}): string {
  const {
    title,
    html,
    css = '',
    js = '',
    description,
    includeLinkHandler = true,
  } = options

  const safeTitle = escapeHtml(title)
  const safeDescription = description ? escapeHtml(description) : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="${USER_CONTENT_DOCUMENT_CSP}">
  <title>${safeTitle}</title>
  ${safeDescription ? `<meta name="description" content="${safeDescription}">` : ''}
  <script>${sandboxStoragePolyfillScript}</script>
  ${css ? `<style>\n${css}\n</style>` : ''}
</head>
<body>
${html}
${js ? `<script>\n${js}\n</script>\n` : ''}${includeLinkHandler ? `<script>${externalLinkHandlerScript}</script>` : ''}
</body>
</html>`
}
