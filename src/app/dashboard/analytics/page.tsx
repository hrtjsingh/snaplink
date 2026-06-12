import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
  formatDuration,
  formatGrowth,
  getDailyViews,
  getUserAnalytics,
} from '@/lib/analytics'
import { BarChart3, Eye, Clock, TrendingDown } from 'lucide-react'

export default async function AnalyticsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const [analytics, dailyViews] = await Promise.all([
    getUserAnalytics(userId),
    getDailyViews(userId),
  ])

  const maxDailyViews = Math.max(...dailyViews.map((d) => d.count), 1)

  return (
    <div className="text-white animate-fade-in-up">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-3 snap-gradient-text-static">
          Analytics
        </h1>
        <p className="text-zinc-400 text-lg">
          Real-time metrics from tracked page views
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        <Card className="snap-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400">Total Views</span>
              <Eye className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-sm text-cyan-400 mt-2">
              {formatGrowth(analytics.monthOverMonthGrowth)}
            </p>
          </CardContent>
        </Card>

        <Card className="snap-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400">This Month</span>
              <BarChart3 className="h-5 w-5 text-violet-400" />
            </div>
            <div className="text-3xl font-bold">{analytics.viewsThisMonth.toLocaleString()}</div>
            <p className="text-sm text-violet-400 mt-2">
              {analytics.viewsLastMonth} last month
            </p>
          </CardContent>
        </Card>

        <Card className="snap-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400">Avg. Time on Page</span>
              <Clock className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold">
              {analytics.avgDurationMs > 0
                ? formatDuration(analytics.avgDurationMs)
                : '—'}
            </div>
            <p className="text-sm text-emerald-400 mt-2">across all pages</p>
          </CardContent>
        </Card>

        <Card className="snap-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400">Bounce Rate</span>
              <TrendingDown className="h-5 w-5 text-rose-400" />
            </div>
            <div className="text-3xl font-bold">{analytics.avgBounceRate}%</div>
            <p className="text-sm text-rose-400 mt-2">sessions under 10s</p>
          </CardContent>
        </Card>
      </div>

      <Card className="snap-card mb-10">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 md:mb-6">Views — Last 7 Days</h2>
          {analytics.totalViews === 0 ? (
            <p className="text-zinc-400">
              No views recorded yet. Share a public page to start collecting data.
            </p>
          ) : (
            <div className="flex items-end gap-1.5 sm:gap-3 h-36 sm:h-48 overflow-x-auto pb-2">
              {dailyViews.map((day) => (
                <div key={day.date} className="flex-1 min-w-[2.5rem] flex flex-col items-center gap-1 sm:gap-2">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-cyan-600/80 to-violet-500/80 transition-all duration-500"
                    style={{
                      height: `${Math.max((day.count / maxDailyViews) * 100, day.count > 0 ? 8 : 2)}%`,
                      minHeight: day.count > 0 ? '12px' : '4px',
                    }}
                  />
                  <span className="text-xs text-zinc-500">
                    {new Date(day.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                    })}
                  </span>
                  <span className="text-sm font-medium text-zinc-300">{day.count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="snap-card">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 md:mb-6">Per-Page Breakdown</h2>
          {analytics.pages.length === 0 ? (
            <p className="text-zinc-400">
              No pages yet.{' '}
              <Link href="/dashboard/new" className="text-cyan-400 hover:underline">
                Create one
              </Link>{' '}
              to start tracking.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400">
                    <th className="pb-3 pr-4 font-medium">Page</th>
                    <th className="pb-3 pr-4 font-medium">Views</th>
                    <th className="pb-3 pr-4 font-medium">This Month</th>
                    <th className="pb-3 pr-4 font-medium">Bounce Rate</th>
                    <th className="pb-3 pr-4 font-medium">Avg. Time</th>
                    <th className="pb-3 font-medium">Last Viewed</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.pages.map((page) => (
                    <tr key={page.slug} className="border-b border-white/5">
                      <td className="py-4 pr-4">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/r/${page.slug}`}
                            className="text-white hover:text-cyan-400 transition-colors"
                          >
                            {page.title}
                          </Link>
                          <Link
                            href={`/dashboard/edit/${page.slug}`}
                            className="text-xs text-zinc-500 hover:text-cyan-400 transition-colors"
                          >
                            Edit page
                          </Link>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-zinc-300">
                        {page.viewCount.toLocaleString()}
                      </td>
                      <td className="py-4 pr-4 text-zinc-300">
                        {page.viewsThisMonth}
                      </td>
                      <td className="py-4 pr-4 text-zinc-300">{page.bounceRate}%</td>
                      <td className="py-4 pr-4 text-zinc-300">
                        {page.avgDurationMs > 0
                          ? formatDuration(page.avgDurationMs)
                          : '—'}
                      </td>
                      <td className="py-4 text-zinc-300">
                        {page.lastViewedAt
                          ? page.lastViewedAt.toLocaleDateString()
                          : 'Never'}
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
