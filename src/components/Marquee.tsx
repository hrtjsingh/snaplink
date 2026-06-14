'use client'

import { cn } from '@/lib/utils'

type MarqueeProps = {
  items: string[]
  className?: string
  speed?: 'slow' | 'normal' | 'fast'
}

export function Marquee({ items, className, speed = 'normal' }: MarqueeProps) {
  const doubled = [...items, ...items]
  const speedClass = {
    slow: 'snap-marquee-track-slow',
    normal: 'snap-marquee-track',
    fast: 'snap-marquee-track-fast',
  }[speed]

  return (
    <div className={cn('snap-marquee overflow-hidden', className)}>
      <div className={cn('snap-marquee-track-inner flex shrink-0', speedClass)}>
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="snap-marquee-item">
            {item}
            <span className="snap-marquee-dot" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  )
}
