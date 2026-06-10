import { connectDB } from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import type { Metadata, Viewport } from 'next'
import { PageData } from '@/lib/types'
import { isPwaInstallable, pagePath } from '@/lib/pwa'
import ClientRenderer from '@/components/ClientRenderer'
import ViewTracker from '@/components/ViewTracker'

async function getPageData(slug: string) {
  try {
    const db = await connectDB()
    const page = await db.collection('pages').findOne({ slug })

    if (!page || page.visibility === 'private') return null

    return {
      title: page.title,
      description: page.description,
      html: page.html,
      css: page.css,
      js: page.js,
      visibility: page.visibility as 'public' | 'private',
      pwaEnabled: page.pwaEnabled !== false,
    }
  } catch (err) {
    console.error(err)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageData(slug)

  if (!page) {
    return { title: 'Page not found' }
  }

  const pwa = isPwaInstallable(page.visibility, page.pwaEnabled)
  const iconPath = `${pagePath(slug)}/icon`

  return {
    title: page.title,
    description: page.description || undefined,
    manifest: pwa ? `${pagePath(slug)}/manifest.webmanifest` : undefined,
    appleWebApp: pwa
      ? {
          capable: true,
          title: page.title,
          statusBarStyle: 'black-translucent',
        }
      : undefined,
    icons: pwa
      ? {
          apple: iconPath,
          icon: iconPath,
        }
      : undefined,
    other: pwa
      ? {
          'mobile-web-app-capable': 'yes',
        }
      : undefined,
  }
}

export async function generateViewport({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Viewport> {
  const { slug } = await params
  const page = await getPageData(slug)

  if (!page) return {}

  const pwa = isPwaInstallable(page.visibility, page.pwaEnabled)

  return pwa ? { themeColor: '#06b6d4' } : {}
}

export default async function RenderPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await getPageData(slug)

  if (!page) notFound()

  const pageData: PageData = {
    title: page.title,
    description: page.description,
    html: page.html,
    css: page.css,
    js: page.js,
    visibility: page.visibility,
  }

  return (
    <>
      <ViewTracker slug={slug} />
      <ClientRenderer page={pageData} />
    </>
  )
}
