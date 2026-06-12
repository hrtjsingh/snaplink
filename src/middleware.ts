import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  applySecurityHeaders,
  maybeRedirectToUserPagesHost,
} from '@/lib/security-headers'

export default clerkMiddleware((_auth, request) => {
  const redirect = maybeRedirectToUserPagesHost(request)
  if (redirect) {
    return applySecurityHeaders(request, redirect)
  }

  const response = NextResponse.next()
  return applySecurityHeaders(request, response)
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
