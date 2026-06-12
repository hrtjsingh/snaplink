import { auth } from '@clerk/nextjs/server'
import { connectDB } from '@/lib/mongodb'
import type { Metadata, Viewport } from 'next'
import { PageData } from '@/lib/types'
import { isPwaInstallable, pagePath } from '@/lib/pwa'
import { checkPublicPageAccess, type PublicPageAccess } from '@/lib/moderation'
import { isSuperAdmin } from '@/lib/admin'
import { shouldAllowPersistentUserStorage } from '@/lib/sandbox-iframe'
import ClientRenderer from '@/components/ClientRenderer'
import ViewTracker from '@/components/ViewTracker'
import {
  PageFallback,
  type PageFallbackReason,
} from '@/components/PageFallback'

async function getPageRecord(slug: string) {
  try {
    const db = await connectDB()
    return db.collection('pages').findOne({ slug })
  } catch (err) {
    console.error(err)
    return null
  }
}

async function getPageData(slug: string) {
  const page = await getPageRecord(slug)
  const access = await checkPublicPageAccess(page)

  if (!access.allowed) return { access, page: null, record: page }

  return {
    access,
    record: page,
    page: {
      title: page!.title as string,
      description: page!.description as string,
      html: page!.html as string,
      css: page!.css as string,
      js: page!.js as string,
      visibility: page!.visibility as 'public' | 'private',
      pwaEnabled: page!.pwaEnabled !== false,
    },
  }
}

function fallbackReason(access: PublicPageAccess): PageFallbackReason {
  if (access.allowed) return 'not_found'
  return access.reason
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await getPageData(slug)

  if (!result.access.allowed || !result.page) {
    const reason = fallbackReason(result.access)
    const title =
      reason === 'not_found' || reason === 'private'
        ? 'Page not found'
        : 'Page unavailable'
    return { title: `${title} · Snaplink` }
  }

  const page = result.page
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
  const result = await getPageData(slug)

  if (!result.page) return { themeColor: '#06b6d4' }

  const pwa = isPwaInstallable(result.page.visibility, result.page.pwaEnabled)
  return pwa ? { themeColor: '#06b6d4' } : {}
}

export default async function RenderPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getPageData(slug)

  if (!result.access.allowed) {
    const reason = fallbackReason(result.access)
    const pageTitle =
      result.record?.title && typeof result.record.title === 'string'
        ? result.record.title
        : undefined

    const { userId } = await auth()
    const showAdminUnblock =
      reason === 'page_blocked' && Boolean(userId && isSuperAdmin(userId))

    return (
      <PageFallback
        slug={slug}
        pageTitle={pageTitle}
        reason={reason}
        showAdminUnblock={showAdminUnblock}
      />
    )
  }

  const page = result.page!

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
      <ClientRenderer
        page={pageData}
        persistentStorage={shouldAllowPersistentUserStorage()}
      />
    </>
  )
}
