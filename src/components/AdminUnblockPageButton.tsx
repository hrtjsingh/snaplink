'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ConfirmDialog'

type AdminUnblockPageButtonProps = {
  slug: string
  title?: string
  size?: 'default' | 'sm' | 'lg'
  className?: string
  onSuccess?: () => void
}

export function AdminUnblockPageButton({
  slug,
  title,
  size = 'sm',
  className,
  onSuccess,
}: AdminUnblockPageButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const label = title ? `"${title}"` : 'this page'

  const handleUnblock = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/pages/${slug}/block`, {
        method: 'DELETE',
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to unblock page')
      }

      toast.success('Page unblocked')
      setOpen(false)
      onSuccess?.()
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to unblock page'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        size={size}
        className={className}
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
        Unblock Page
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Unblock page?"
        description={`${label} will become publicly accessible again unless the owner account is blocked.`}
        confirmLabel="Unblock Page"
        loading={loading}
        onConfirm={handleUnblock}
      />
    </>
  )
}
