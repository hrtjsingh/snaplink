import type { Metadata } from 'next'
import { NO_INDEX_ROBOTS } from '@/lib/app-seo'
import DashboardLayoutClient from '@/components/DashboardLayoutClient'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: NO_INDEX_ROBOTS,
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
