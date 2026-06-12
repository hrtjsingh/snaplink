'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface DeletePageButtonProps {
  slug: string
  title: string
  redirectTo?: string
  variant?: 'default' | 'glass' | 'destructive' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  label?: string
}

export function DeletePageButton({
  slug,
  title,
  redirectTo = '/dashboard',
  variant = 'destructive',
  size = 'sm',
  className,
  label = 'Delete',
}: DeletePageButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/pages/${slug}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete page')
      toast.success('Page deleted')
      setOpen(false)
      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      console.error('Error deleting page:', error)
      toast.error('Failed to delete page. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        {label}
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete page?"
        description={`Delete "${title}"? This permanently removes the page and its analytics. This cannot be undone.`}
        confirmLabel="Delete Page"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  )
}
