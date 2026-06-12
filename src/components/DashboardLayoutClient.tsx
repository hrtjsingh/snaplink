'use client'

import { useAuth } from '@clerk/nextjs'
import { redirect, usePathname } from 'next/navigation'
import { AppBackground } from '@/components/AppBackground'
import { DashboardBackLink } from '@/components/DashboardBackLink'
import { ClerkUserIdLogger } from '@/components/ClerkUserIdLogger'
import { SiteHeader } from '@/components/SiteHeader'

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = useAuth()
  const pathname = usePathname()
  const isDashboardHome = pathname === '/dashboard'

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <AppBackground>
      <ClerkUserIdLogger />
      <SiteHeader variant="dashboard" />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {!isDashboardHome && <DashboardBackLink />}
        {children}
      </main>
    </AppBackground>
  )
}
