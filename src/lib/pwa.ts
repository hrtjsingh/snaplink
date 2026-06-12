export function pagePath(slug: string): string {
  return `/r/${slug}`
}

export function isPwaInstallable(
  visibility: 'public' | 'private',
  pwaEnabled?: boolean
): boolean {
  return visibility === 'public' && pwaEnabled !== false
}

export function buildManifest(
  slug: string,
  title: string,
  description: string,
  origin: string
) {
  const pageUrl = `${origin}${pagePath(slug)}`
  const iconUrl = `${origin}${pagePath(slug)}/icon`

  return {
    id: pageUrl,
    name: title,
    short_name: title.length > 14 ? `${title.slice(0, 12)}…` : title,
    description: description || `${title} — installed with Snaplink`,
    start_url: pageUrl,
    scope: pageUrl,
    display: 'standalone',
    display_override: ['standalone', 'browser'],
    background_color: '#030712',
    theme_color: '#06b6d4',
    orientation: 'any',
    categories: ['utilities', 'productivity'],
    icons: [
      {
        src: iconUrl,
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: iconUrl,
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}

export function buildServiceWorkerScript(slug: string): string {
  const startUrl = pagePath(slug)
  const cacheName = `snaplink-${slug}-v1`

  return `const CACHE = '${cacheName}'
const START_URL = '${startUrl}'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(START_URL)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('snaplink-') && key !== CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(START_URL, copy))
          return response
        })
        .catch(() => caches.match(START_URL))
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  )
})
`
}

export function buildAppIconSvg(title: string): string {
  const letter = (title.trim()[0] || 'S').toUpperCase()
  const safeLetter = letter.replace(/[<>&"']/g, '')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${safeLetter}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <text x="256" y="300" text-anchor="middle" font-family="system-ui,sans-serif" font-size="220" font-weight="700" fill="#ffffff">${safeLetter}</text>
</svg>`
}
