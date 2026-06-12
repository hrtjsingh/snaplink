import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminPageActions } from '@/components/AdminPageActions'
import { getAdminPages } from '@/lib/admin-analytics'
import { getClerkUserProfiles } from '@/lib/admin'
import { ExternalLink, FileText, Globe, Lock } from 'lucide-react'

function pageStatus(page: {
  blocked: boolean
  ownerBlocked: boolean
}) {
  if (page.ownerBlocked) return { label: 'Owner blocked', className: 'bg-rose-500/20 text-rose-400 border-rose-500/30' }
  if (page.blocked) return { label: 'Blocked', className: 'bg-rose-500/20 text-rose-400 border-rose-500/30' }
  return { label: 'Active', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
}

export default async function AdminPagesPage() {
  const pages = await getAdminPages(200)
  const ownerIds = [...new Set(pages.map((page) => page.ownerId))]
  const profiles = await getClerkUserProfiles(ownerIds)

  return (
    <div className="text-white animate-fade-in-up">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 snap-gradient-text-static flex items-center gap-3">
          <FileText className="h-8 w-8 text-violet-400" />
          All Pages
        </h1>
        <p className="text-zinc-400">
          {pages.length} page{pages.length !== 1 ? 's' : ''} across the platform
        </p>
      </div>

      <Card className="snap-card">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="pb-3 pr-4 font-medium">Page</th>
                  <th className="pb-3 pr-4 font-medium">Owner</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Visibility</th>
                  <th className="pb-3 pr-4 font-medium">Views</th>
                  <th className="pb-3 pr-4 font-medium">Created</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => {
                  const profile = profiles.get(page.ownerId)
                  const ownerLabel =
                    profile?.name ||
                    profile?.email ||
                    profile?.username ||
                    page.ownerId.slice(0, 12)
                  const status = pageStatus(page)

                  return (
                    <tr key={page.slug} className="border-b border-white/5">
                      <td className="py-4 pr-4">
                        <div className="font-medium text-white">{page.title}</div>
                        {page.description && (
                          <div className="text-xs text-zinc-500 truncate max-w-xs">
                            {page.description}
                          </div>
                        )}
                        <div className="text-xs text-zinc-500">/r/{page.slug}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <Link
                          href={`/admin/users/${page.ownerId}`}
                          className="text-cyan-400 hover:underline"
                        >
                          {ownerLabel}
                        </Link>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge className={status.className}>{status.label}</Badge>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge
                          className={
                            page.visibility === 'public'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }
                        >
                          {page.visibility === 'public' ? (
                            <Globe className="w-3 h-3 mr-1" />
                          ) : (
                            <Lock className="w-3 h-3 mr-1" />
                          )}
                          {page.visibility}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4 text-zinc-300">
                        {page.viewCount.toLocaleString()}
                      </td>
                      <td className="py-4 pr-4 text-zinc-300">
                        {page.createdAt.toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/r/${page.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-cyan-400 hover:underline text-xs"
                          >
                            Open
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          <AdminPageActions
                            slug={page.slug}
                            title={page.title}
                            blocked={page.blocked}
                            ownerBlocked={page.ownerBlocked}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
