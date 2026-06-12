import type { MetadataRoute } from 'next'
import { getAppBaseUrl } from '@/lib/app-seo'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getAppBaseUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/r/'],
        disallow: ['/dashboard/', '/admin/', '/api/', '/sign-in', '/sign-up'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
