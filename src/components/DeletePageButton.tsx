'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${title}"? This permanently removes the page and its analytics. This cannot be undone.`
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/pages/${slug}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete page')
      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      console.error('Error deleting page:', error)
      alert('Failed to delete page. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {label}
    </Button>
  )
}
