import Link from 'next/link'
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { AppBackground } from '@/components/AppBackground'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDuration, formatGrowth, getPlatformStats } from '@/lib/analytics'
import {
  ArrowRight,
  Code,
  Globe,
  Shield,
  TrendingUp,
  CheckCircle,
  PlayCircle,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Sparkles,
} from 'lucide-react'

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export default async function Home() {
  const stats = await getPlatformStats()
  return (
    <AppBackground>
      <SiteHeader variant="marketing" />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-6xl mx-auto">
          <Badge className="mb-6 snap-badge animate-fade-in-up">
            Paste code · Get a link · Go live
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 md:mb-8 leading-tight animate-fade-in-up delay-100">
            Build & Share
            <br />
            <span className="snap-gradient-text">
              Web Pages
            </span>
            <br />
            Instantly
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-400 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Transform your ideas into stunning web pages with our powerful platform.
            Paste HTML/CSS/JS or upload files. Get instant public links with advanced analytics and collaboration tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up delay-300">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg">
                  Start Building <ArrowRight className="h-5 w-5" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg">
                <Link href="/dashboard/new">
                  Create New Page <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </SignedIn>
            <Button variant="glass" size="lg">
              <PlayCircle className="h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Live platform stats */}
          <div className="text-center mb-20 animate-fade-in-up delay-400">
            <p className="text-zinc-400 text-sm mb-6">Live platform activity</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalCreators}</div>
                <div className="text-sm text-zinc-500">Creators</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalPages}</div>
                <div className="text-sm text-zinc-500">Pages published</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{formatCompact(stats.totalViews)}</div>
                <div className="text-sm text-zinc-500">Total views</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-7xl mx-auto mb-16 md:mb-32">
          <div className="relative">
            <div className="snap-glow" />
            <Card className="relative snap-card overflow-hidden animate-scale-in delay-400">
              <CardContent className="p-0">
                <div className="border-b border-white/8 bg-white/5 px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-zinc-400 text-sm">Snaplink Dashboard</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">Live</Badge>
                </div>
                <div className="p-4 sm:p-8">
                  <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card className="snap-card bg-white/5">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-zinc-400">Total Pages</span>
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.totalPages}</div>
                        <div className="text-sm text-green-400">{formatGrowth(stats.pagesGrowth)}</div>
                      </CardContent>
                    </Card>
                    <Card className="snap-card bg-white/5">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-zinc-400">Views</span>
                          <BarChart3 className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{formatCompact(stats.totalViews)}</div>
                        <div className="text-sm text-blue-400">{formatGrowth(stats.viewsGrowth)}</div>
                      </CardContent>
                    </Card>
                    <Card className="snap-card bg-white/5">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-zinc-400">Engagement</span>
                          <Activity className="h-4 w-4 text-violet-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.engagementRate}%</div>
                        <div className="text-sm text-violet-400">engagement rate</div>
                      </CardContent>
                    </Card>
                    <Card className="snap-card bg-white/5">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-zinc-400">Performance</span>
                          <PieChart className="h-4 w-4 text-orange-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                          {stats.avgDurationMs > 0 ? formatDuration(stats.avgDurationMs) : '—'}
                        </div>
                        <div className="text-sm text-orange-400">avg. time on page</div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="h-64 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500/15 via-violet-500/15 to-rose-500/15">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4 text-cyan-400 animate-float" />
                      <p className="text-zinc-400">Interactive Analytics Dashboard</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mb-16 md:mb-32 animate-fade-in-up delay-200">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
              Your All-in-One
              <br />
              <span className="snap-gradient-text-static">
                Business Intelligence Hub
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto">
              Everything you need to create, manage, and optimize your web presence with advanced analytics and collaboration tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="snap-card snap-card-hover group animate-fade-in-up delay-100">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-cyan-500/15 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Instant Global Links</h3>
                <p className="text-zinc-300 mb-6">
                  Create shareable pages with unique URLs. Global CDN ensures fast loading worldwide with 99.9% uptime guarantee.
                </p>
                <div className="flex items-center text-cyan-400 font-medium">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="snap-card snap-card-hover group animate-fade-in-up delay-200">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-violet-500/15 group-hover:scale-110 transition-transform duration-300">
                  <Code className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Advanced Code Editor</h3>
                <p className="text-zinc-300 mb-6">
                  Professional IDE with syntax highlighting, auto-completion, and real-time collaboration. Supports all modern frameworks.
                </p>
                <div className="flex items-center text-violet-400 font-medium">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="snap-card snap-card-hover group animate-fade-in-up delay-300">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-emerald-500/15 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Enterprise Security</h3>
                <p className="text-zinc-300 mb-6">
                  Bank-grade security with SSL encryption, privacy controls, and compliance with GDPR, SOC2, and ISO standards.
                </p>
                <div className="flex items-center text-green-400 font-medium">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Analytics Section */}
        <section className="mb-16 md:mb-32">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
                The Story of Our
                <br />
                <span className="snap-gradient-text-static">
                  Growth & Impact
                </span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-zinc-300 mb-6 md:mb-8">
                Track every interaction, understand your audience, and optimize for better performance with our comprehensive analytics suite.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-zinc-300">Real-time visitor tracking and behavior analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-zinc-300">Advanced conversion funnel optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-zinc-300">Custom event tracking and goal setting</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="snap-glow" />
              <Card className="relative snap-card backdrop-blur">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-cyan-400 mb-2">{stats.totalPages}</div>
                      <div className="text-sm text-zinc-400">Pages Live</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-rose-400 mb-2">{stats.engagementRate}%</div>
                      <div className="text-sm text-zinc-400">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-400 mb-2">
                        {stats.avgDurationMs > 0 ? formatDuration(stats.avgDurationMs) : '—'}
                      </div>
                      <div className="text-sm text-zinc-400">Avg. Session</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-400 mb-2">{stats.totalCreators}</div>
                      <div className="text-sm text-zinc-400">Creators</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        {/* Pricing Section — beta */}
        <section id="pricing" className="mb-16 md:mb-32">
          <div className="text-center mb-10 md:mb-12">
            <Badge className="mb-4 snap-badge">
              <Sparkles className="w-3 h-3 mr-1" />
              Beta
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
              Free While We
              <br />
              <span className="snap-gradient-text-static">
                Build in Beta
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto">
              Page creation is live in beta. Create, publish, and share — no credit card required.
              Pricing plans will be introduced soon.
            </p>
          </div>

          <div className="max-w-6xl mx-auto w-full px-0">
            <Card className="snap-card w-full max-w-lg mx-auto border-cyan-500/30 shadow-lg shadow-cyan-500/10 py-0 gap-0">
              <CardContent className="p-6 sm:p-8 md:p-10 text-center">
                <h3 className="text-2xl font-semibold text-white mb-2">Beta Access</h3>
                <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
                  Everything you need to ship pages today — on us during early access.
                </p>
                <div className="text-4xl font-bold text-white mb-2">$0</div>
                <p className="text-sm text-cyan-400 mb-8">Pricing coming soon</p>
                <ul className="space-y-3 text-zinc-300 mb-8 text-left max-w-lg mx-auto w-full">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0" />
                    Create and publish pages during beta
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0" />
                    Live analytics on every page
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0" />
                    Public share links and optional PWA install
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0" />
                    Early adopters get first look at paid plans
                  </li>
                </ul>
                <div className="flex justify-center w-full">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button size="lg" className="w-full min-w-[220px] sm:w-auto">
                      Join Beta — Get Started <ArrowRight className="h-5 w-5" />
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Button asChild size="lg" className="w-full min-w-[220px] sm:w-auto">
                    <Link href="/dashboard/new">
                      Create a Page <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </SignedIn>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Platform metrics */}
        <section className="mb-16 md:mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
              Real Numbers,
              <br />
              <span className="snap-gradient-text-static">
                Real Tracking
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto">
              Every view, bounce, and session duration is recorded live — no mock data, no placeholders.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="snap-card snap-card-hover">
              <CardContent className="p-8 text-center">
                <Users className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">{stats.totalCreators}</div>
                <p className="text-zinc-400">Active creators on the platform</p>
              </CardContent>
            </Card>
            <Card className="snap-card snap-card-hover">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-10 h-10 text-violet-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">{stats.viewsThisMonth}</div>
                <p className="text-zinc-400">Views recorded this month</p>
              </CardContent>
            </Card>
            <Card className="snap-card snap-card-hover">
              <CardContent className="p-8 text-center">
                <Activity className="w-10 h-10 text-rose-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">{stats.engagementRate}%</div>
                <p className="text-zinc-400">Average engagement across all pages</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
              Ready to Build Something
              <br />
              <span className="snap-gradient-text-static">
                Amazing?
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-300 mb-8 md:mb-12">
              {stats.totalCreators > 0
                ? `Join ${stats.totalCreators} creator${stats.totalCreators !== 1 ? 's' : ''} already publishing with Snaplink.`
                : 'Be the first creator to publish with Snaplink.'}
              {' '}Join the beta — free while we build.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button size="lg">
                    Join Beta <ArrowRight className="h-5 w-5" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Button asChild size="lg">
                  <Link href="/dashboard/new">
                    Create Your First Page <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </SignedIn>
              <Button asChild variant="glass" size="lg">
                <Link href="#pricing">Beta &amp; Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/8 bg-white/3 backdrop-blur-xl animate-fade-in">
        <div className="container mx-auto px-4 py-10 sm:py-16">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold snap-gradient-text-static mb-4">
                Snaplink
              </div>
              <p className="text-zinc-400 mb-6 max-w-md">
                The most powerful platform for building and sharing web pages instantly.
                {stats.totalViews.toLocaleString()} views tracked across {stats.totalPages} live pages.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-110">
                  <span className="text-sm font-bold">X</span>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-110">
                  <span className="text-sm font-bold">LI</span>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-110">
                  <span className="text-sm font-bold">GH</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-zinc-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Beta &amp; Pricing</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3 text-zinc-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-zinc-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/8 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-zinc-400 text-sm">
              © 2026 Snaplink. All rights reserved.
            </p>
            <p className="text-zinc-400 text-sm mt-4 md:mt-0">
              Made with ❤️ for developers worldwide
            </p>
          </div>
        </div>
      </footer>
    </AppBackground>
  )
}