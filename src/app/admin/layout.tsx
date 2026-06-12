import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AppBackground } from '@/components/AppBackground'
import { AdminNav } from '@/components/AdminNav'
import { isSuperAdmin } from '@/lib/admin'
import { NO_INDEX_ROBOTS } from '@/lib/app-seo'

export const metadata: Metadata = {
  title: 'Admin',
  robots: NO_INDEX_ROBOTS,
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId || !isSuperAdmin(userId)) {
    redirect('/dashboard')
  }

  return (
    <AppBackground>
      <AdminNav />
      <main className="container mx-auto px-4 py-6 sm:py-8">{children}</main>
    </AppBackground>
  )
}
