import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
  formatDuration,
  getAdminOverview,
} from '@/lib/admin-analytics'
import { formatGrowth } from '@/lib/analytics'
import { getClerkUserProfiles } from '@/lib/admin'
import {
  Activity,
  BarChart3,
  Eye,
  FileText,
  PlusCircle,
  Users,
} from 'lucide-react'

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview()
  const { platform } = overview
  const maxDailyViews = Math.max(...overview.dailyViews.map((d) => d.count), 1)

  const activityUserIds = [
    ...new Set(overview.recentActivity.map((item) => item.userId)),
  ]
  const profiles = await getClerkUserProfiles(activityUserIds)

  return (
    <div className="text-white animate-fade-in-up">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-3 snap-gradient-text-static">
          Platform Overview
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg">
          Live activity across all users and pages
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        <Card className="snap-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400">Creators</span>
              <Users className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold">{overview.totalUsers}</div>
            <p className="text-sm text-cyan-400 mt-2">
              {overview.activeCreatorsToday} active today
            </p>
          </CardContent>
        </Card>

        <Card className="snap-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400">Total Pages</span>
              <FileText className="h-5 w-5 text-violet-400" />
            </div>
            <div className="text-3xl font-bold">{platform.totalPages}</div>
            <p className="text-sm text-violet-400 mt-2">
              {overview.pagesCreatedToday} created today
            </p>
          </CardContent>
        </Card>

        <Card className="snap-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400">Total Views</span>
              <Eye className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold">
              {formatCompact(platform.totalViews)}
            </div>
            <p className="text-sm text-blue-400 mt-2">
              {overview.viewsToday} today · {formatGrowth(platform.viewsGrowth)}
            </p>
          </CardContent>
        </Card>

        <Card className="snap-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400">Engagement</span>
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold">{platform.engagementRate}%</div>
            <p className="text-sm text-emerald-400 mt-2">
              Avg. {formatDuration(platform.avgDurationMs)} on page
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8 md:mb-10">
        <Card className="snap-card">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              Views — Last 14 Days
            </h2>
            <div className="flex items-end gap-1.5 sm:gap-2 h-36 sm:h-48 overflow-x-auto pb-2">
              {overview.dailyViews.map((day) => (
                <div
                  key={day.date}
                  className="flex-1 min-w-[2rem] flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-cyan-600/80 to-violet-500/80"
                    style={{
                      height: `${Math.max((day.count / maxDailyViews) * 100, day.count > 0 ? 8 : 2)}%`,
                      minHeight: day.count > 0 ? '12px' : '4px',
                    }}
                  />
                  <span className="text-[10px] sm:text-xs text-zinc-500">
                    {new Date(day.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-xs font-medium text-zinc-300">
                    {day.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="snap-card">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 md:mb-6">
              Recent Activity
            </h2>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {overview.recentActivity.length === 0 ? (
                <p className="text-zinc-400 text-sm">No activity yet.</p>
              ) : (
                overview.recentActivity.map((item, index) => {
                  const profile = profiles.get(item.userId)
                  const userLabel =
                    profile?.name ||
                    profile?.email ||
                    profile?.username ||
                    item.userId.slice(0, 12)

                  return (
                    <div
                      key={`${item.type}-${item.slug}-${item.at.toISOString()}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/5 p-3"
                    >
                      <div className="mt-0.5">
                        {item.type === 'page_created' ? (
                          <PlusCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white">
                          {item.type === 'page_created' ? (
                            <>
                              <span className="text-zinc-400">Created </span>
                              <Link
                                href={`/r/${item.slug}`}
                                className="text-cyan-400 hover:underline"
                                target="_blank"
                              >
                                {item.title}
                              </Link>
                            </>
                          ) : (
                            <>
                              <span className="text-zinc-400">View on </span>
                              <Link
                                href={`/r/${item.slug}`}
                                className="text-cyan-400 hover:underline"
                                target="_blank"
                              >
                                /r/{item.slug}
                              </Link>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          <Link
                            href={`/admin/users/${item.userId}`}
                            className="hover:text-cyan-400 transition-colors"
                          >
                            {userLabel}
                          </Link>
                          {' · '}
                          {item.at.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/users">
          <Card className="snap-card snap-card-hover h-full">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">All Users</h3>
              <p className="text-sm text-zinc-400">
                Profiles, page counts, and monthly views
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/pages">
          <Card className="snap-card snap-card-hover h-full">
            <CardContent className="p-6">
              <FileText className="h-8 w-8 text-violet-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">All Pages</h3>
              <p className="text-sm text-zinc-400">
                Every published page across the platform
              </p>
            </CardContent>
          </Card>
        </Link>
        <Card className="snap-card">
          <CardContent className="p-6">
            <BarChart3 className="h-8 w-8 text-emerald-400 mb-3" />
            <h3 className="font-semibold text-white mb-1">This Month</h3>
            <p className="text-sm text-zinc-400">
              {platform.viewsThisMonth.toLocaleString()} views ·{' '}
              {formatGrowth(platform.viewsGrowth)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
