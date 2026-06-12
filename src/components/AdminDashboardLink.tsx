'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield } from 'lucide-react'

type AdminDashboardLinkProps = {
  mobileMenu?: boolean
  onNavigate?: () => void
}

export function AdminDashboardLink({
  mobileMenu = false,
  onNavigate,
}: AdminDashboardLinkProps = {}) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch('/api/admin/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setIsAdmin(Boolean(data?.isAdmin)))
      .catch(() => setIsAdmin(false))
  }, [])

  if (!isAdmin) return null

  if (mobileMenu) {
    return (
      <Link
        href="/admin"
        className="snap-nav-link py-2 text-rose-300 hover:text-rose-200"
        onClick={onNavigate}
      >
        Admin
      </Link>
    )
  }

  return (
    <Link
      href="/admin"
      className="snap-nav-link inline-flex items-center gap-1.5 text-rose-300 hover:text-rose-200"
    >
      <Shield className="h-4 w-4" />
      Admin
    </Link>
  )
}
