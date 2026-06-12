import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminPageActions } from '@/components/AdminPageActions'
import { AdminUserActions } from '@/components/AdminUserActions'
import { getAdminUserDetail } from '@/lib/admin-analytics'
import { getClerkUserProfile } from '@/lib/admin'
import { DAILY_PAGE_CREATION_LIMIT } from '@/lib/page-rate-limit'
import {
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  Lock,
  Mail,
  User,
} from 'lucide-react'

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const [detail, profile] = await Promise.all([
    getAdminUserDetail(userId),
    getClerkUserProfile(userId),
  ])

  if (!detail) notFound()

  const { summary, pages } = detail

  const userLabel =
    profile.name || profile.email || profile.username || userId

  return (
    <div className="text-white animate-fade-in-up">
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          ← All users
        </Link>
      </div>

      <Card className="snap-card mb-8">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {profile.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.imageUrl}
                alt=""
                className="h-20 w-20 rounded-2xl border border-white/10"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <User className="h-10 w-10 text-zinc-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {profile.name || profile.username || 'Unknown user'}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  {detail.blocked && (
                    <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                      Blocked
                    </Badge>
                  )}
                  <AdminUserActions
                    userId={userId}
                    userLabel={userLabel}
                    blocked={detail.blocked}
                  />
                </div>
              </div>
              <div className="space-y-2 text-sm text-zinc-400">
                {profile.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </p>
                )}
                <p className="flex items-center gap-2 break-all">
                  <User className="h-4 w-4 shrink-0" />
                  {userId}
                </p>
                {profile.createdAt && (
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined {profile.createdAt.toLocaleDateString()}
                    {profile.lastSignInAt &&
                      ` · Last sign-in ${profile.lastSignInAt.toLocaleDateString()}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="snap-card">
          <CardContent className="p-4 sm:p-6">
            <div className="text-zinc-400 text-sm mb-1">Pages</div>
            <div className="text-2xl font-bold">{summary.pageCount}</div>
          </CardContent>
        </Card>
        <Card className="snap-card">
          <CardContent className="p-4 sm:p-6">
            <div className="text-zinc-400 text-sm mb-1">Total views</div>
            <div className="text-2xl font-bold">
              {summary.totalViews.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="snap-card">
          <CardContent className="p-4 sm:p-6">
            <div className="text-zinc-400 text-sm mb-1">Views this month</div>
            <div className="text-2xl font-bold">
              {summary.viewsThisMonth.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="snap-card">
          <CardContent className="p-4 sm:p-6">
            <div className="text-zinc-400 text-sm mb-1">Daily create limit</div>
            <div className="text-2xl font-bold">
              {detail.dailyLimitUsed}/{DAILY_PAGE_CREATION_LIMIT}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {detail.dailyLimitRemaining} remaining today
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="snap-card">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-400" />
            Pages ({pages.length})
          </h2>

          {pages.length === 0 ? (
            <p className="text-zinc-400">No pages yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400">
                    <th className="pb-3 pr-4 font-medium">Title</th>
                    <th className="pb-3 pr-4 font-medium">Visibility</th>
                    <th className="pb-3 pr-4 font-medium">Views</th>
                    <th className="pb-3 pr-4 font-medium">Created</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.slug} className="border-b border-white/5">
                      <td className="py-4 pr-4">
                        <div className="font-medium text-white">{page.title}</div>
                        <div className="text-xs text-zinc-500">/r/{page.slug}</div>
                        {(page.blocked || page.ownerBlocked) && (
                          <Badge className="mt-2 bg-rose-500/20 text-rose-400 border-rose-500/30">
                            {page.ownerBlocked ? 'Owner blocked' : 'Blocked'}
                          </Badge>
                        )}
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
                            View
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
