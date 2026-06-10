import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CopyUrlButton } from '@/components/CopyUrlButton'
import { DeletePageButton } from '@/components/DeletePageButton'
import {
  formatDuration,
  formatGrowth,
  getUserAnalytics,
} from '@/lib/analytics'
import {
  Plus,
  Globe,
  Lock,
  Calendar,
  ExternalLink,
  FileText,
  BarChart3,
  Eye,
  TrendingUp,
  Activity,
  Clock,
} from 'lucide-react'

function formatLastViewed(date: Date | null): string {
  if (!date) return 'Never'
  return date.toLocaleDateString()
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) return null

  const analytics = await getUserAnalytics(userId)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
              <span className="snap-gradient-text-static">My Pages</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Live analytics across {analytics.totalPages} page
              {analytics.totalPages !== 1 ? 's' : ''}
            </p>
          </div>
          <Button asChild size="lg" className="mt-4 md:mt-0">
            <Link href="/dashboard/new">
              <Plus className="h-5 w-5" />
              Create New Page
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="snap-card snap-card-hover animate-fade-in-up delay-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400">Total Pages</span>
                <FileText className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-white">{analytics.totalPages}</div>
              <div className="text-sm text-cyan-400 mt-2">
                {analytics.publicPages} public, {analytics.totalPages - analytics.publicPages} private
              </div>
            </CardContent>
          </Card>

          <Card className="snap-card snap-card-hover animate-fade-in-up delay-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400">Total Views</span>
                <Eye className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {analytics.totalViews.toLocaleString()}
              </div>
              <div className="text-sm text-blue-400 mt-2">
                {formatGrowth(analytics.monthOverMonthGrowth)}
              </div>
            </CardContent>
          </Card>

          <Card className="snap-card snap-card-hover animate-fade-in-up delay-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400">Avg Views</span>
                <BarChart3 className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">{analytics.avgViewsPerPage}</div>
              <div className="text-sm text-green-400 mt-2">per page</div>
            </CardContent>
          </Card>

          <Card className="snap-card snap-card-hover animate-fade-in-up delay-400">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400">Avg. Time</span>
                <Activity className="h-5 w-5 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {analytics.avgDurationMs > 0
                  ? formatDuration(analytics.avgDurationMs)
                  : '—'}
              </div>
              <div className="text-sm text-orange-400 mt-2">
                {analytics.avgBounceRate}% bounce rate
              </div>
            </CardContent>
          </Card>
        </div>

        {analytics.pages.length === 0 ? (
          <Card className="snap-card">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-cyan-500/15 animate-pulse-glow">
                  <FileText className="w-12 h-12 text-cyan-400 animate-float" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">No pages yet</h3>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                  Create your first page to start tracking real views, bounce rate, and time on page.
                </p>
                <Button asChild size="lg">
                  <Link href="/dashboard/new">
                    <Plus className="h-5 w-5" />
                    Create Your First Page
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Pages</h2>
              <span className="text-sm text-zinc-400">
                {analytics.pages.length} page{analytics.pages.length !== 1 ? 's' : ''} total
              </span>
            </div>

            <div className="grid gap-6">
              {analytics.pages.map((page) => {
                const pageUrl = `${appUrl}/r/${page.slug}`

                return (
                  <Card
                    key={page.slug}
                    className="snap-card snap-card-hover group animate-fade-in-up"
                  >
                    <CardContent className="p-8">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl text-white font-semibold mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                                {page.title}
                              </h3>
                              {page.description && (
                                <p className="text-zinc-400 mb-4">{page.description}</p>
                              )}
                            </div>
                            <Badge
                              className={`ml-4 ${
                                page.visibility === 'public'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              }`}
                            >
                              {page.visibility === 'public' ? (
                                <Globe className="w-3 h-3 mr-1" />
                              ) : (
                                <Lock className="w-3 h-3 mr-1" />
                              )}
                              {page.visibility}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 mb-6">
                            <div className="flex items-center space-x-2">
                              <Eye className="w-4 h-4" />
                              <span>{page.viewCount.toLocaleString()} views</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>Last viewed {formatLastViewed(page.lastViewedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {page.viewsThisMonth} views this month
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 p-4 rounded-xl border border-white/8 bg-white/5">
                            <div className="flex-1">
                              <div className="text-xs text-zinc-400 mb-1">Page URL</div>
                              <code className="text-cyan-400 text-sm break-all font-mono">
                                {pageUrl}
                              </code>
                            </div>
                            <CopyUrlButton url={pageUrl} />
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col gap-3 lg:min-w-[120px]">
                          <Button asChild size="sm" className="w-full lg:w-auto">
                            <Link href={`/r/${page.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              View Page
                            </Link>
                          </Button>
                          <Button asChild variant="glass" size="sm" className="w-full lg:w-auto">
                            <Link href={`/dashboard/edit/${page.slug}`}>Edit</Link>
                          </Button>
                          <Button asChild variant="glass" size="sm" className="w-full lg:w-auto">
                            <Link href="/dashboard/analytics">Analytics</Link>
                          </Button>
                          <DeletePageButton
                            slug={page.slug}
                            title={page.title}
                            className="w-full lg:w-auto"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/8">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-cyan-400">
                            {page.viewCount.toLocaleString()}
                          </div>
                          <div className="text-xs text-zinc-400">Total Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-400">
                            {page.bounceRate}%
                          </div>
                          <div className="text-xs text-zinc-400">Bounce Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-400">
                            {page.avgDurationMs > 0
                              ? formatDuration(page.avgDurationMs)
                              : '—'}
                          </div>
                          <div className="text-xs text-zinc-400">Avg. Time</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        <Card className="snap-card mt-12">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/dashboard/new">
                <div className="flex items-center space-x-4 p-4 rounded-xl border border-white/8 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer group snap-card-hover">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-cyan-500/15 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Create New Page</div>
                    <div className="text-sm text-zinc-400">Start a fresh project</div>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/templates">
                <div className="flex items-center space-x-4 p-4 rounded-xl border border-white/8 hover:border-violet-500/30 transition-all duration-300 cursor-pointer group snap-card-hover">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-violet-500/15 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Browse Templates</div>
                    <div className="text-sm text-zinc-400">Use pre-built designs</div>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/analytics">
                <div className="flex items-center space-x-4 p-4 rounded-xl border border-white/8 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer group snap-card-hover">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-emerald-500/15 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">View Analytics</div>
                    <div className="text-sm text-zinc-400">Deep insights & metrics</div>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
