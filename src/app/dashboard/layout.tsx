'use client'
import { useAuth, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AppBackground } from '@/components/AppBackground'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = useAuth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <AppBackground>
      <header className="container mx-auto px-4 py-6 relative animate-fade-in">
        <nav className="flex justify-between items-center rounded-2xl border border-white/8 bg-white/3 px-6 py-4 backdrop-blur-xl">
          <div className="text-2xl font-bold snap-gradient-text-static">
            <Link href="/">
              Snaplink
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="snap-nav-link">
              My Pages
            </Link>
            <Link href="/dashboard/new" className="snap-nav-link">
              Create New
            </Link>
            <UserButton />
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </AppBackground>
  )
}
