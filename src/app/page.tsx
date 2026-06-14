import type { Metadata } from 'next'
import Link from 'next/link'
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { AppBackground } from '@/components/AppBackground'
import { AppJsonLd } from '@/components/AppJsonLd'
import { Marquee } from '@/components/Marquee'
import { ScrollReveal } from '@/components/ScrollReveal'
import { SectionLabel } from '@/components/SectionLabel'
import { SiteHeader } from '@/components/SiteHeader'
import { SpotlightCard } from '@/components/SpotlightCard'
import { buildMarketingMetadata, SITE_NAME, SITE_TAGLINE } from '@/lib/app-seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDuration, formatGrowth, getPlatformStats } from '@/lib/analytics'
import {
  ArrowRight,
  Code,
  Globe,
  Shield,
  CheckCircle,
  BarChart3,
  Activity,
  Users,
  Sparkles,
  Zap,
  Layers,
} from 'lucide-react'

export const metadata: Metadata = buildMarketingMetadata({
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  path: '/',
})

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export default async function Home() {
  const stats = await getPlatformStats()

  return (
    <AppBackground>
      <AppJsonLd />
      <SiteHeader variant="marketing" />

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 pt-8 pb-16 md:pt-16 md:pb-28 relative">
          <div className="snap-hero-glow" aria-hidden />

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
            <div>
              <Badge className="mb-8 snap-badge animate-fade-in-up">
                Paste code · Get link · Go live
              </Badge>

              <h1 className="snap-display text-[clamp(2.75rem,8vw,5.5rem)] mb-8 animate-fade-in-up delay-100">
                Build &amp; share
                <br />
                <span className="snap-gradient-text">web pages</span>
                <br />
                <span className="text-zinc-500">instantly.</span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-lg leading-relaxed animate-fade-in-up delay-200">
                Paste HTML, CSS &amp; JS. Get a public link with live analytics.
                No deploy pipeline. No friction.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-14 animate-fade-in-up delay-300">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button size="lg" className="snap-btn-shine">
                      Start building <ArrowRight className="h-5 w-5" />
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Button asChild size="lg" className="snap-btn-shine">
                    <Link href="/dashboard/new">
                      Create new page <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </SignedIn>
                <Button asChild variant="glass" size="lg">
                  <Link href="#features">Explore features</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-10 animate-fade-in-up delay-400">
                {[
                  { value: stats.totalCreators, label: 'Creators' },
                  { value: stats.totalPages, label: 'Pages live' },
                  { value: formatCompact(stats.totalViews), label: 'Total views' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="snap-stat-value text-3xl md:text-4xl">{stat.value}</div>
                    <div className="text-xs uppercase tracking-[0.15em] text-zinc-600 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard preview */}
            <ScrollReveal direction="left" delay={200} className="relative">
              <div className="relative lg:perspective-[1200px]">
                <div className="snap-glow" />
                <Card className="relative snap-card overflow-hidden lg:[transform:rotateY(-4deg)_rotateX(2deg)] lg:transition-transform lg:duration-700 lg:hover:[transform:rotateY(-1deg)_rotateX(0.5deg)]">
                  <CardContent className="p-0">
                    <div className="border-b border-white/6 bg-white/3 px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-teal-400/80" />
                        </div>
                        <span className="text-zinc-500 text-xs font-mono tracking-wide">
                          snaplink — dashboard
                        </span>
                      </div>
                      <Badge className="bg-teal-400/10 text-teal-300 border-teal-400/20 text-[10px] uppercase tracking-widest">
                        Live
                      </Badge>
                    </div>
                    <div className="p-5 sm:p-7">
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        {[
                          { label: 'Pages', value: stats.totalPages, growth: formatGrowth(stats.pagesGrowth), color: 'text-teal-400' },
                          { label: 'Views', value: formatCompact(stats.totalViews), growth: formatGrowth(stats.viewsGrowth), color: 'text-violet-400' },
                          { label: 'Engagement', value: `${stats.engagementRate}%`, growth: 'rate', color: 'text-rose-400' },
                          { label: 'Avg. time', value: stats.avgDurationMs > 0 ? formatDuration(stats.avgDurationMs) : '—', growth: 'on page', color: 'text-amber-400' },
                        ].map((m) => (
                          <div key={m.label} className="rounded-xl border border-white/6 bg-white/2 p-4">
                            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">{m.label}</div>
                            <div className={`text-2xl font-display font-bold ${m.color}`}>{m.value}</div>
                            <div className="text-[10px] text-zinc-600 mt-1">{m.growth}</div>
                          </div>
                        ))}
                      </div>
                      <div className="h-36 rounded-xl flex items-center justify-center border border-white/6 bg-gradient-to-br from-teal-400/5 via-violet-400/5 to-rose-400/5">
                        <BarChart3 className="h-10 w-10 text-teal-400/60 animate-float" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <Marquee
          items={['Instant deploy', 'Live analytics', 'Zero config', 'Public links', 'PWA ready', 'Real-time stats']}
          className="mb-20 md:mb-32"
        />

        {/* Features — bento grid */}
        <section id="features" className="container mx-auto px-4 mb-20 md:mb-32">
          <ScrollReveal className="mb-16 md:mb-20">
            <SectionLabel index="01" label="Features" />
            <h2 className="snap-display text-4xl md:text-6xl max-w-3xl">
              Everything to ship
              <span className="snap-gradient-text-static"> fast.</span>
            </h2>
            <p className="text-lg text-zinc-400 mt-6 max-w-xl">
              Create, publish, and track — one platform, zero deploy headaches.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-4 md:gap-5 max-w-7xl mx-auto">
            <ScrollReveal delay={0} className="md:col-span-2">
              <SpotlightCard>
                <Card className="snap-card snap-card-hover h-full border-teal-400/10">
                  <CardContent className="p-8 md:p-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-teal-400/10 border border-teal-400/15">
                      <Globe className="w-7 h-7 text-teal-400" />
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                      Instant global links
                    </h3>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-lg">
                      Unique URLs for every page. Share anywhere — social, email, embeds.
                      Fast loads worldwide.
                    </p>
                    <div className="flex items-center gap-2 mt-8 text-teal-400 text-sm font-medium">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <SpotlightCard>
                <Card className="snap-card snap-card-hover h-full">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-violet-400/10 border border-violet-400/15">
                      <Zap className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-3">
                      Zero deploy
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Paste code, hit publish. Live in seconds — no CI/CD required.
                    </p>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <SpotlightCard>
                <Card className="snap-card snap-card-hover h-full">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-rose-400/10 border border-rose-400/15">
                      <Layers className="w-6 h-6 text-rose-400" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-3">
                      Multi-mode editor
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Single HTML, separate editors, or file upload — your workflow.
                    </p>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </ScrollReveal>

            <ScrollReveal delay={200} className="md:col-span-2">
              <SpotlightCard>
                <Card className="snap-card snap-card-hover h-full">
                  <CardContent className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-violet-400/10 border border-violet-400/15">
                        <Code className="w-7 h-7 text-violet-400" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-white mb-3">
                        Advanced code editor
                      </h3>
                      <p className="text-zinc-400 leading-relaxed">
                        Separate HTML, CSS &amp; JS panels. Syntax-aware workflow built for developers.
                      </p>
                    </div>
                    <div className="flex-1 w-full rounded-xl border border-white/6 bg-[var(--snap-bg)] p-4 font-mono text-xs text-zinc-500 leading-relaxed">
                      <span className="text-violet-400">&lt;div</span> className=<span className="text-teal-400">&quot;hero&quot;</span><span className="text-violet-400">&gt;</span>
                      <br />
                      {'  '}<span className="text-zinc-600">{'// your page, your rules'}</span>
                      <br />
                      <span className="text-violet-400">&lt;/div&gt;</span>
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </ScrollReveal>

            <ScrollReveal delay={250} className="md:col-span-3">
              <SpotlightCard>
                <Card className="snap-card snap-card-hover">
                  <CardContent className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-400/10 border border-emerald-400/15">
                        <Shield className="w-7 h-7 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-display text-2xl font-bold text-white mb-2">
                          Enterprise-grade security
                        </h3>
                        <p className="text-zinc-400 max-w-xl">
                          SSL everywhere. Public or private pages. Sanitized rendering. Your code, your control.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['SSL', 'Private pages', 'Sanitized HTML', 'GDPR-ready'].map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full border border-white/8 bg-white/3 text-xs text-zinc-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </ScrollReveal>
          </div>
        </section>

        {/* Analytics */}
        <section className="container mx-auto px-4 mb-20 md:mb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
            <ScrollReveal>
              <SectionLabel index="02" label="Analytics" />
              <h2 className="snap-display text-4xl md:text-5xl mb-6">
                Real data.
                <br />
                <span className="snap-gradient-text-static">Real impact.</span>
              </h2>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                Every view, bounce, and session tracked live. No mock charts. No placeholders.
              </p>
              <ul className="space-y-4">
                {[
                  'Real-time visitor tracking',
                  'Bounce rate & session duration',
                  'Custom event tracking',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-zinc-300">
                    <CheckCircle className="h-5 w-5 text-teal-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={150}>
              <div className="relative">
                <div className="snap-glow" />
                <Card className="relative snap-card">
                  <CardContent className="p-8 md:p-10">
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { value: stats.totalPages, label: 'Pages live', color: 'text-teal-400' },
                        { value: `${stats.engagementRate}%`, label: 'Engagement', color: 'text-rose-400' },
                        { value: stats.avgDurationMs > 0 ? formatDuration(stats.avgDurationMs) : '—', label: 'Avg. session', color: 'text-violet-400' },
                        { value: stats.totalCreators, label: 'Creators', color: 'text-amber-400' },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-4 rounded-xl border border-white/6 bg-white/2">
                          <div className={`font-display text-3xl md:text-4xl font-bold mb-1 ${s.color}`}>
                            {s.value}
                          </div>
                          <div className="text-xs uppercase tracking-widest text-zinc-600">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="container mx-auto px-4 mb-20 md:mb-32">
          <ScrollReveal className="text-center mb-12 md:mb-16">
            <SectionLabel index="03" label="Pricing" className="justify-center" />
            <Badge className="mb-6 snap-badge">
              <Sparkles className="w-3 h-3 mr-1" />
              Beta
            </Badge>
            <h2 className="snap-display text-4xl md:text-6xl">
              Free while we
              <br />
              <span className="snap-gradient-text-static">build in beta.</span>
            </h2>
            <p className="text-lg text-zinc-400 mt-6 max-w-xl mx-auto">
              Create, publish, share — no credit card. Paid plans coming soon.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100} className="max-w-lg mx-auto">
            <div className="snap-border-gradient">
              <div className="snap-border-gradient-inner">
                <Card className="border-0 bg-transparent shadow-none">
                  <CardContent className="p-8 md:p-10 text-center">
                    <h3 className="font-display text-2xl font-bold text-white mb-2">Beta access</h3>
                    <p className="text-zinc-500 mb-8">Everything to ship pages today.</p>
                    <div className="font-display text-6xl font-bold text-white mb-1">$0</div>
                    <p className="text-sm text-teal-400 mb-8 uppercase tracking-widest">Pricing soon</p>
                    <ul className="space-y-3 text-zinc-400 mb-10 text-left">
                      {[
                        'Create & publish pages (3/day)',
                        'Live analytics on every page',
                        'Public links + optional PWA',
                        'Early access to paid plans',
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <SignedOut>
                      <SignUpButton mode="modal">
                        <Button size="lg" className="w-full snap-btn-shine">
                          Join beta <ArrowRight className="h-5 w-5" />
                        </Button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <Button asChild size="lg" className="w-full snap-btn-shine">
                        <Link href="/dashboard/new">
                          Create a page <ArrowRight className="h-5 w-5" />
                        </Link>
                      </Button>
                    </SignedIn>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Platform metrics */}
        <section className="container mx-auto px-4 mb-20 md:mb-32">
          <ScrollReveal className="text-center mb-12 md:mb-16">
            <SectionLabel index="04" label="Platform" className="justify-center" />
            <h2 className="snap-display text-4xl md:text-5xl">
              Numbers that
              <span className="snap-gradient-text-static"> matter.</span>
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { icon: Users, value: stats.totalCreators, label: 'Active creators', color: 'text-teal-400' },
              { icon: BarChart3, value: stats.viewsThisMonth, label: 'Views this month', color: 'text-violet-400' },
              { icon: Activity, value: `${stats.engagementRate}%`, label: 'Avg. engagement', color: 'text-rose-400' },
            ].map((item, i) => (
              <ScrollReveal key={item.label} delay={i * 100}>
                <SpotlightCard>
                  <Card className="snap-card snap-card-hover">
                    <CardContent className="p-8 text-center">
                      <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-5`} />
                      <div className="snap-stat-value text-4xl mb-2">{item.value}</div>
                      <p className="text-sm text-zinc-500">{item.label}</p>
                    </CardContent>
                  </Card>
                </SpotlightCard>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-20 md:pb-32">
          <ScrollReveal>
            <div className="relative max-w-4xl mx-auto text-center rounded-3xl border border-white/8 bg-white/2 backdrop-blur-2xl px-8 py-16 md:py-24 overflow-hidden">
              <div className="snap-hero-glow opacity-60" aria-hidden />
              <h2 className="relative snap-display text-4xl md:text-6xl mb-6">
                Ready to build
                <br />
                <span className="snap-gradient-text-static">something great?</span>
              </h2>
              <p className="relative text-lg text-zinc-400 mb-10 max-w-lg mx-auto">
                {stats.totalCreators > 0
                  ? `Join ${stats.totalCreators} creator${stats.totalCreators !== 1 ? 's' : ''} on Snaplink.`
                  : 'Be the first creator on Snaplink.'}
                {' '}Free during beta.
              </p>
              <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button size="lg" className="snap-btn-shine">
                      Join beta <ArrowRight className="h-5 w-5" />
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Button asChild size="lg" className="snap-btn-shine">
                    <Link href="/dashboard/new">
                      Create first page <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </SignedIn>
                <Button asChild variant="glass" size="lg">
                  <Link href="#pricing">Beta &amp; pricing</Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/6 animate-fade-in">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2">
              <div className="font-display text-2xl font-bold snap-gradient-text-static mb-4">
                Snaplink
              </div>
              <p className="text-zinc-500 mb-6 max-w-sm text-sm leading-relaxed">
                Build and share web pages instantly.
                {stats.totalViews.toLocaleString()} views across {stats.totalPages} live pages.
              </p>
              <div className="flex gap-3">
                {['X', 'LI', 'GH'].map((s) => (
                  <div
                    key={s}
                    className="w-9 h-9 rounded-lg flex items-center justify-center border border-white/8 bg-white/3 text-zinc-500 text-xs font-bold hover:border-teal-400/30 hover:text-teal-400 transition-all duration-300 cursor-pointer"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Beta & Pricing', 'Templates', 'Integrations'] },
              { title: 'Resources', links: ['Documentation', 'Help Center', 'Community', 'Blog'] },
              { title: 'Company', links: ['About', 'Careers', 'Privacy', 'Terms'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-display text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-zinc-500 hover:text-teal-400 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/6 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-600 text-xs">© 2026 Snaplink. All rights reserved.</p>
            <p className="text-zinc-600 text-xs">Made for developers worldwide</p>
          </div>
        </div>
      </footer>
    </AppBackground>
  )
}
