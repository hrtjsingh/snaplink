'use client'

import { useState } from 'react'
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

type SiteHeaderProps = {
  variant: 'marketing' | 'dashboard'
}

export function SiteHeader({ variant }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

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
    <header className="container mx-auto px-4 py-4 sm:py-6 relative animate-fade-in">
      <nav className="flex justify-between items-center rounded-2xl border border-white/8 bg-white/3 px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-xl">
        <div className="text-xl sm:text-2xl font-bold snap-gradient-text-static min-w-0">
          <Link href="/">Snaplink</Link>
        </div>

        <div className="hidden md:flex items-center gap-6 shrink-0">
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
                  <Button>Get Started</Button>
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
            className="p-2 rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:border-white/20 transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden mt-2 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-xl px-4 py-4 animate-fade-in-up">
          <div className="flex flex-col gap-3">{mobileLinks}</div>
        </div>
      )}
    </header>
  )
}
