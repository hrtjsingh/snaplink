import { headers } from 'next/headers'

function originFromHost(host: string | null, proto: string | null): string {
  if (!host) return 'http://localhost:3000'

  const hostname = host.split(',')[0].trim()
  const protocol =
    proto?.split(',')[0].trim() ??
    (hostname.startsWith('localhost') ? 'http' : 'https')

  return `${protocol}://${hostname}`
}

/** Resolve origin from an incoming Request (API routes, route handlers). */
export function getOriginFromRequest(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')

  if (forwardedHost) {
    return originFromHost(forwardedHost, forwardedProto)
  }

  return new URL(request.url).origin
}

/** Resolve origin in Server Components and server actions. */
export async function getServerOrigin(): Promise<string> {
  const headersList = await headers()
  return originFromHost(
    headersList.get('x-forwarded-host') ?? headersList.get('host'),
    headersList.get('x-forwarded-proto')
  )
}
