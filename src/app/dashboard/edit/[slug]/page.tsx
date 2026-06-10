import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import PageEditorForm from '@/components/PageEditorForm'
import { normalizePageCode, type PageFormValues } from '@/lib/page-code'

async function getPageForEdit(
  slug: string,
  userId: string
): Promise<PageFormValues | null> {
  const db = await connectDB()
  const page = await db.collection('pages').findOne({ slug, ownerId: userId })

  if (!page) return null

  const normalized = normalizePageCode(
    page.html,
    page.css ?? '',
    page.js ?? ''
  )

  return {
    title: page.title,
    description: page.description ?? '',
    html: normalized.html,
    css: normalized.css,
    js: normalized.js,
    visibility: page.visibility,
    pwaEnabled: page.pwaEnabled !== false,
  }
}

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { userId } = await auth()
  if (!userId) return null

  const { slug } = await params
  const initialData = await getPageForEdit(slug, userId)

  if (!initialData) notFound()

  return (
    <PageEditorForm mode="edit" slug={slug} initialData={initialData} />
  )
}
