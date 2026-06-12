export const SNAPLINK_FOOTER_ATTR = 'data-snaplink-footer'

export type PageTheme = {
  background?: string
  color?: string
}

export function extractBodyBlock(css: string) {
  if (!css) return { bodyStyle: '', restCSS: '' }

  let bodyStyle = ''
  let restCSS = css
  const bodyRegex = /body\s*\{([\s\S]*?)\}/gi

  restCSS = restCSS.replace(bodyRegex, (_, styles) => {
    bodyStyle += styles
    return ''
  })

  return { bodyStyle, restCSS }
}

export function parseCssBlock(block: string): Record<string, string> {
  const props: Record<string, string> = {}

  for (const part of block.split(';')) {
    const idx = part.indexOf(':')
    if (idx === -1) continue
    const key = part.slice(0, idx).trim().toLowerCase()
    const value = part.slice(idx + 1).trim()
    if (key && value) props[key] = value
  }

  return props
}

export function getThemeFromCss(css: string): PageTheme {
  const { bodyStyle } = extractBodyBlock(css)
  const props = parseCssBlock(bodyStyle)

  return {
    background: props.background || props['background-color'],
    color: props.color,
  }
}

export function themeToStyle(theme: PageTheme): {
  background?: string
  color?: string
} {
  return {
    ...(theme.background ? { background: theme.background } : {}),
    ...(theme.color ? { color: theme.color } : {}),
  }
}

export const snaplinkFooterCss = `
.snaplink-built-with-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  margin-top: auto;
  border-top: 1px solid color-mix(in srgb, currentColor 14%, transparent);
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.4;
  flex-shrink: 0;
  color: inherit;
}
.snaplink-built-with-footer a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: inherit;
  opacity: 0.72;
  text-decoration: none;
  transition: opacity 0.2s ease;
}
.snaplink-built-with-footer a:hover {
  opacity: 1;
}
.snaplink-built-with-footer .snaplink-brand {
  font-weight: 700;
  opacity: 1;
  background: linear-gradient(90deg, #22d3ee, #8b5cf6, #f472b6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
`

export function getSnaplinkFooterHtml(homeHref = '/'): string {
  return `<footer class="snaplink-built-with-footer" ${SNAPLINK_FOOTER_ATTR}="true"><a href="${homeHref}" ${SNAPLINK_FOOTER_ATTR}="true">Built with <span class="snaplink-brand">Snaplink</span></a></footer>`
}

export function injectSnaplinkFooter(html: string, homeHref = '/'): string {
  const footerBlock = `<style>${snaplinkFooterCss}</style>${getSnaplinkFooterHtml(homeHref)}`

  if (html.includes('</body>')) {
    return html.replace('</body>', `${footerBlock}</body>`)
  }

  return `${html}${footerBlock}`
}

export function readThemeFromElement(el: HTMLElement): PageTheme {
  const cs = getComputedStyle(el)
  const background =
    cs.background && cs.background !== 'none' ? cs.background : cs.backgroundColor
  const color = cs.color

  return {
    background: background && background !== 'rgba(0, 0, 0, 0)' ? background : undefined,
    color: color || undefined,
  }
}
