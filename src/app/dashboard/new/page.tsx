import PageEditorForm from '@/components/PageEditorForm'
import { getPublicPagesBaseUrl } from '@/lib/user-pages-origin'

export default async function NewPagePage() {
  const publicPagesBaseUrl = await getPublicPagesBaseUrl()

  return <PageEditorForm mode="create" publicPagesBaseUrl={publicPagesBaseUrl} />
}
