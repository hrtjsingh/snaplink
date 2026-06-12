'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { AdminUnblockPageButton } from '@/components/AdminUnblockPageButton'

type AdminPageActionsProps = {
  slug: string
  title: string
  blocked: boolean
  ownerBlocked?: boolean
}

type PendingAction = 'delete' | 'block' | null

export function AdminPageActions({
  slug,
  title,
  blocked,
  ownerBlocked = false,
}: AdminPageActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<PendingAction>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  const refresh = () => router.refresh()

  const handleDelete = async () => {
    setLoading('delete')
    try {
      const res = await fetch(`/api/admin/pages/${slug}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to delete page')
      }
      toast.success('Page deleted')
      setPendingAction(null)
      refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete page')
    } finally {
      setLoading(null)
    }
  }

  const handleBlock = async () => {
    setLoading('block')
    try {
      const res = await fetch(`/api/admin/pages/${slug}/block`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to block page')
      }
      toast.success('Page blocked')
      setPendingAction(null)
      refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to block page')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {blocked ? (
          <AdminUnblockPageButton slug={slug} title={title} onSuccess={refresh} />
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setPendingAction('block')}
            disabled={loading !== null || ownerBlocked}
            title={
              ownerBlocked
                ? 'Owner is blocked — page is already restricted publicly'
                : undefined
            }
          >
            <Ban className="h-4 w-4" />
            Block Page
          </Button>
        )}

        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => setPendingAction('delete')}
          disabled={loading !== null}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <ConfirmDialog
        open={pendingAction === 'delete'}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title="Delete page?"
        description={`Delete "${title}" permanently? This removes the page and all analytics. This cannot be undone.`}
        confirmLabel="Delete Page"
        variant="destructive"
        loading={loading === 'delete'}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={pendingAction === 'block'}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title="Block page?"
        description={`Block "${title}"? It will be hidden from public view.`}
        confirmLabel="Block Page"
        variant="destructive"
        loading={loading === 'block'}
        onConfirm={handleBlock}
      />
    </>
  )
}
