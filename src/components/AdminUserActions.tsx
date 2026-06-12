'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ConfirmDialog'

type AdminUserActionsProps = {
  userId: string
  userLabel: string
  blocked: boolean
}

export function AdminUserActions({
  userId,
  userLabel,
  blocked,
}: AdminUserActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleToggle = async () => {
    const nextBlock = !blocked
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: nextBlock ? 'POST' : 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to update user status')
      }

      toast.success(nextBlock ? 'User blocked' : 'User unblocked')
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update user'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={blocked ? 'glass' : 'destructive'}
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : blocked ? (
          <ShieldCheck className="h-4 w-4" />
        ) : (
          <Ban className="h-4 w-4" />
        )}
        {blocked ? 'Unblock User' : 'Block User'}
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={blocked ? 'Unblock user?' : 'Block user?'}
        description={
          blocked
            ? `${userLabel} will be able to create and publish pages again.`
            : `Block ${userLabel}? They cannot create pages and all their public pages will be hidden.`
        }
        confirmLabel={blocked ? 'Unblock User' : 'Block User'}
        variant={blocked ? 'default' : 'destructive'}
        loading={loading}
        onConfirm={handleToggle}
      />
    </>
  )
}
