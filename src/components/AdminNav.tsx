import Link from 'next/link'
import { LayoutDashboard, Users, FileText, Shield } from 'lucide-react'

const links = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
]

export function AdminNav() {
  return (
    <header className="container relative z-50 mx-auto px-4 py-4 sm:py-6 animate-fade-in">
      <nav className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/3 px-4 sm:px-6 py-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15">
              <Shield className="h-5 w-5 text-rose-400" />
            </div>
            <div className="min-w-0">
              <Link
                href="/admin"
                className="text-xl sm:text-2xl font-bold snap-gradient-text-static"
              >
                Super Admin
              </Link>
              <p className="text-xs text-zinc-500 truncate">
                Platform activity, users, and pages
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            Back to Dashboard
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 hover:border-cyan-500/30 hover:text-white transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
