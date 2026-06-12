import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardBackLink() {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 md:mb-6">
      <Link href="/dashboard">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </Button>
  )
}
