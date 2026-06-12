import DOMPurify from 'isomorphic-dompurify'

const HTML_PURIFY_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: [
    'script',
    'iframe',
    'object',
    'embed',
    'form',
    'base',
    'link',
    'meta',
    'template',
  ],
  FORBID_ATTR: [
    'onerror',
    'onload',
    'onclick',
    'onmouseover',
    'onfocus',
    'onblur',
    'onchange',
    'onsubmit',
    'oninput',
    'onkeydown',
    'onkeyup',
    'onkeypress',
    'onpointerdown',
    'onpointerup',
    'onmouseenter',
    'onmouseleave',
  ],
}

export function sanitizeHTML(html: string): string {
  if (!html?.trim()) return ''
  return DOMPurify.sanitize(html, HTML_PURIFY_CONFIG)
}

export function sanitizeCSS(css: string): string {
  if (!css?.trim()) return ''

  return css
    .replace(/@import\s+/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/behavior\s*:/gi, '')
    .replace(/-moz-binding\s*:/gi, '')
    .replace(/url\s*\(\s*(['"]?)javascript:/gi, 'url($1')
}
