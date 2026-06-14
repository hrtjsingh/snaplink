'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminDashboardLink } from '@/components/AdminDashboardLink'
import { cn } from '@/lib/utils'

type SiteHeaderProps = {
  variant: 'marketing' | 'dashboard'
}

export function SiteHeader({ variant }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const desktopLinks =
    variant === 'marketing' ? (
      <>
        <Link href="#features" className="snap-nav-link">
          Features
        </Link>
        <Link href="#pricing" className="snap-nav-link">
          Beta
        </Link>
      </>
    ) : (
      <>
        <Link href="/dashboard" className="snap-nav-link">
          My Pages
        </Link>
        <Link href="/dashboard/new" className="snap-nav-link">
          Create New
        </Link>
        <AdminDashboardLink />
      </>
    )

  const mobileLinks =
    variant === 'marketing' ? (
      <>
        <Link href="#features" className="snap-nav-link py-2" onClick={close}>
          Features
        </Link>
        <Link href="#pricing" className="snap-nav-link py-2" onClick={close}>
          Beta
        </Link>
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost" className="w-full justify-center">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="w-full justify-center">Get Started</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="snap-nav-link py-2"
            onClick={close}
          >
            Dashboard
          </Link>
        </SignedIn>
      </>
    ) : (
      <>
        <Link href="/dashboard" className="snap-nav-link py-2" onClick={close}>
          My Pages
        </Link>
        <Link
          href="/dashboard/new"
          className="snap-nav-link py-2"
          onClick={close}
        >
          Create New
        </Link>
      </>
    )

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-500',
        scrolled ? 'py-2' : 'py-4 sm:py-6'
      )}
    >
      <div className="container mx-auto px-4">
        <nav
          className={cn(
            'relative z-50 flex justify-between items-center rounded-2xl border px-4 sm:px-6 py-3 sm:py-3.5 backdrop-blur-2xl transition-all duration-500',
            scrolled
              ? 'border-white/8 bg-[var(--snap-bg)]/80 shadow-2xl shadow-black/40'
              : 'border-white/6 bg-white/2'
          )}
        >
          <div className="font-display text-xl sm:text-2xl font-bold snap-gradient-text-static min-w-0 tracking-tight">
            <Link href="/">Snaplink</Link>
          </div>

          <div className="hidden md:flex items-center gap-8 shrink-0">
            {desktopLinks}
            {variant === 'marketing' ? (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm" className="snap-btn-shine">
                      Get Started
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="snap-nav-link">
                    Dashboard
                  </Link>
                  <UserButton />
                </SignedIn>
              </>
            ) : (
              <UserButton />
            )}
          </div>

          <div className="flex md:hidden items-center gap-2 shrink-0">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-xl border border-white/8 bg-white/3 text-zinc-400 hover:text-white hover:border-white/15 transition-colors"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={close}
          />
          <div className="absolute inset-x-4 top-full z-50 mt-2 md:hidden">
            <div className="rounded-2xl border border-white/8 bg-[var(--snap-bg-elevated)]/95 px-4 py-4 shadow-2xl shadow-black/50 backdrop-blur-2xl animate-fade-in-up">
              <div className="flex flex-col gap-3">
                {mobileLinks}
                {variant === 'dashboard' && (
                  <AdminDashboardLink mobileMenu onNavigate={close} />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
