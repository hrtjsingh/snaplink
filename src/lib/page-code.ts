export type EditorMode = 'single' | 'separate' | 'upload'

export interface PageFormValues {
  title: string
  description: string
  html: string
  css: string
  js: string
  visibility: 'public' | 'private'
  pwaEnabled?: boolean
}

/** Strip document shell and return only injectable body content. */
export function extractBodyHTML(html: string): string {
  if (!html?.trim()) return ''

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    return bodyMatch[1].trim()
  }

  return html
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .trim()
}

function extractAllStyles(html: string): { html: string; css: string } {
  let css = ''
  const stripped = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, content) => {
    const chunk = content.trim()
    if (chunk) css += (css ? '\n\n' : '') + chunk
    return ''
  })
  return { html: stripped, css }
}

function extractAllScripts(html: string): { html: string; js: string } {
  let js = ''
  const stripped = html.replace(
    /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi,
    (_, content) => {
      const chunk = content.trim()
      if (chunk) js += (js ? '\n\n' : '') + chunk
      return ''
    }
  )
  return { html: stripped, js }
}

/** Split stored fields into clean html (body fragment), css, and js. */
export function normalizePageCode(
  html: string,
  css = '',
  js = ''
): Pick<PageFormValues, 'html' | 'css' | 'js'> {
  let rawHtml = html || ''
  let rawCss = css?.trim() || ''
  let rawJs = js?.trim() || ''

  const styles = extractAllStyles(rawHtml)
  rawHtml = styles.html
  if (styles.css) {
    rawCss = rawCss ? `${styles.css}\n\n${rawCss}` : styles.css
  }

  const scripts = extractAllScripts(rawHtml)
  rawHtml = scripts.html
  if (scripts.js) {
    rawJs = rawJs ? `${scripts.js}\n\n${rawJs}` : scripts.js
  }

  return {
    html: extractBodyHTML(rawHtml),
    css: rawCss.trim(),
    js: rawJs.trim(),
  }
}

export function buildCombinedHTML(html: string, css: string, js: string): string {
  const { html: body, css: cleanCss, js: cleanJs } = normalizePageCode(html, css, js)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page</title>
  ${cleanCss ? `<style>\n${cleanCss}\n</style>` : ''}
</head>
<body>
${body}
${cleanJs ? `<script>\n${cleanJs}\n</script>` : ''}
</body>
</html>`
}

export function parseCodeForSubmit(
  mode: EditorMode,
  values: {
    combinedHTML: string
    html: string
    css: string
    js: string
  }
): Pick<PageFormValues, 'html' | 'css' | 'js'> {
  if (mode === 'single' && values.combinedHTML.trim()) {
    return normalizePageCode(values.combinedHTML)
  }

  return normalizePageCode(values.html, values.css, values.js)
}

export function isFormValid(
  mode: EditorMode,
  title: string,
  values: { combinedHTML: string; html: string }
): boolean {
  if (!title.trim()) return false
  if (mode === 'single') return !!values.combinedHTML.trim()
  if (mode === 'separate') return !!values.html.trim()
  return !!values.html.trim() || !!values.combinedHTML.trim()
}
