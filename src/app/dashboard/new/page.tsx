import PageEditorForm from '@/components/PageEditorForm'
import { getServerOrigin } from '@/lib/base-url'

export default async function NewPagePage() {
  const appUrl = await getServerOrigin()

  return <PageEditorForm mode="create" appUrl={appUrl} />
}
