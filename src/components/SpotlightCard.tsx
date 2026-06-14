'use client'

import { useRef, type MouseEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SpotlightCardProps = {
  children: ReactNode
  className?: string
}

export function SpotlightCard({ children, className }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn('snap-spotlight-card', className)}
    >
      {children}
    </div>
  )
}
