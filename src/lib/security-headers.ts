import { NextResponse, type NextRequest } from 'next/server'

const CLERK_SCRIPT_SRC = [
  'https://*.clerk.accounts.dev',
  'https://*.clerk.com',
  'https://challenges.cloudflare.com',
]

const CLERK_CONNECT_SRC = [
  'https://*.clerk.accounts.dev',
  'https://*.clerk.com',
]

const CLERK_FRAME_SRC = ['https://*.clerk.accounts.dev', 'https://*.clerk.com']

function joinSources(values: string[]): string {
  return values.join(' ')
}

/** CSP for the main Snaplink application shell. */
export function buildAppContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${joinSources(CLERK_SCRIPT_SRC)}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' ${joinSources(CLERK_CONNECT_SRC)}`,
    `frame-src 'self' ${joinSources(CLERK_FRAME_SRC)}`,
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
}

/** CSP for /r/[slug] shell pages that host sandboxed user content in an iframe. */
export function buildUserPageShellContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${joinSources(CLERK_SCRIPT_SRC)}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' ${joinSources(CLERK_CONNECT_SRC)}`,
    "frame-src 'self' blob:",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join('; ')
}

export function applySecurityHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const pathname = request.nextUrl.pathname
  const isUserPageShell = pathname.startsWith('/r/')

  response.headers.set(
    'Content-Security-Policy',
    isUserPageShell
      ? buildUserPageShellContentSecurityPolicy()
      : buildAppContentSecurityPolicy()
  )
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )

  if (isUserPageShell) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  } else {
    response.headers.set('X-Frame-Options', 'DENY')
  }

  return response
}

function hostnameFromOrigin(origin: string): string | null {
  try {
    return new URL(origin).hostname
  } catch {
    return null
  }
}

/**
 * When USER_PAGES_ORIGIN is set, public pages on the main app host redirect
 * to the dedicated user-content domain (e.g. pages.snaplink.com).
 */
export function maybeRedirectToUserPagesHost(
  request: NextRequest
): NextResponse | null {
  const userPagesOrigin = process.env.USER_PAGES_ORIGIN?.trim()
  if (!userPagesOrigin || !request.nextUrl.pathname.startsWith('/r/')) {
    return null
  }

  const requestHost = request.headers.get('host')?.split(':')[0]?.toLowerCase()
  const userHost = hostnameFromOrigin(userPagesOrigin)?.toLowerCase()

  if (!requestHost || !userHost || requestHost === userHost) {
    return null
  }

  const target = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    userPagesOrigin
  )

  return NextResponse.redirect(target, 308)
}
