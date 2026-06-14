import { cn } from '@/lib/utils'

type SectionLabelProps = {
  index: string
  label: string
  className?: string
}

export function SectionLabel({ index, label, className }: SectionLabelProps) {
  return (
    <div className={cn('snap-section-label', className)}>
      <span className="snap-section-index">{index}</span>
      <span className="snap-section-divider" aria-hidden />
      <span className="snap-section-text">{label}</span>
    </div>
  )
}
