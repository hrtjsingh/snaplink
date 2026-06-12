import type { Metadata } from 'next'
import PageEditorForm from '@/components/PageEditorForm'
import { NO_INDEX_ROBOTS } from '@/lib/app-seo'
import { getPublicPagesBaseUrl } from '@/lib/user-pages-origin'

export const metadata: Metadata = {
  title: 'Create Page',
  robots: NO_INDEX_ROBOTS,
}

export default async function NewPagePage() {
  const publicPagesBaseUrl = await getPublicPagesBaseUrl()

  return <PageEditorForm mode="create" publicPagesBaseUrl={publicPagesBaseUrl} />
}
