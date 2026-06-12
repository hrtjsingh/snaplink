import Link from 'next/link'
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { AppBackground } from '@/components/AppBackground'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, FileQuestion, ShieldOff, Sparkles } from 'lucide-react'
import { AdminUnblockPageButton } from '@/components/AdminUnblockPageButton'

export type PageFallbackReason =
  | 'not_found'
  | 'private'
  | 'page_blocked'
  | 'user_blocked'

const copy: Record<
  PageFallbackReason,
  { title: string; message: string; icon: 'missing' | 'blocked' }
> = {
  not_found: {
    title: 'Page not found',
    message:
      'This link does not exist or may have been removed. Build and share your own page on Snaplink in minutes.',
    icon: 'missing',
  },
  private: {
    title: 'Page not found',
    message:
      'This page is not publicly available. Create and publish your own page with Snaplink instead.',
    icon: 'missing',
  },
  page_blocked: {
    title: 'Page unavailable',
    message:
      'This page has been restricted. You can still create and share your own pages on Snaplink.',
    icon: 'blocked',
  },
  user_blocked: {
    title: 'Page unavailable',
    message:
      'This page is no longer available. Start fresh and publish something new on Snaplink.',
    icon: 'blocked',
  },
}

type PageFallbackProps = {
  slug?: string
  pageTitle?: string
  reason: PageFallbackReason
  showAdminUnblock?: boolean
}

export function PageFallback({
  slug,
  pageTitle,
  reason,
  showAdminUnblock = false,
}: PageFallbackProps) {
  const content = copy[reason]
  const Icon = content.icon === 'blocked' ? ShieldOff : FileQuestion

  const heading =
    pageTitle && reason !== 'not_found' && reason !== 'private'
      ? `"${pageTitle}" is unavailable`
      : content.title

  return (
    <AppBackground>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="snap-card max-w-lg w-full">
          <CardContent className="p-6 sm:p-8 text-center text-white">
            <div
              className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                content.icon === 'blocked' ? 'bg-rose-500/15' : 'bg-cyan-500/15'
              }`}
            >
              <Icon
                className={`h-7 w-7 ${
                  content.icon === 'blocked' ? 'text-rose-400' : 'text-cyan-400'
                }`}
              />
            </div>

            {/* <BadgeLine slug={slug} /> */}

            <h1 className="text-2xl sm:text-3xl font-bold mb-3">{heading}</h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
              {content.message}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {showAdminUnblock && slug && (
                <AdminUnblockPageButton
                  slug={slug}
                  title={pageTitle}
                  size="lg"
                  className="w-full sm:w-auto"
                />
              )}
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Sparkles className="h-5 w-5" />
                    Create a Page
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/dashboard/new">
                    Create a Page
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </SignedIn>
              <Button asChild variant="glass" size="lg" className="w-full sm:w-auto">
                <Link href="/">Back to Snaplink</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppBackground>
  )
}

function BadgeLine({ slug }: { slug?: string }) {
  if (!slug) return null
  return (
    <p className="text-xs text-zinc-500 font-mono mb-3 break-all">/r/{slug}</p>
  )
}

export function getPageFallbackHtml(
  reason: PageFallbackReason,
  slug?: string
): string {
  const content = copy[reason]
  const slugLine = slug ? `<p style="font-family:monospace;font-size:12px;color:#71717a;margin:0 0 12px">/r/${slug}</p>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title} · Snaplink</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: ui-sans-serif, system-ui, sans-serif;
      background: #030712;
      color: #fff;
    }
    .card {
      max-width: 480px;
      width: 100%;
      padding: 32px;
      text-align: center;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03);
    }
    h1 { font-size: 1.75rem; margin: 0 0 12px; }
    p { color: #a1a1aa; line-height: 1.6; margin: 0 0 24px; }
    .actions { display: flex; flex-direction: column; gap: 12px; }
    a {
      display: inline-block;
      padding: 12px 20px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
    }
    .primary {
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      color: #fff;
    }
    .secondary {
      border: 1px solid rgba(255,255,255,0.15);
      color: #fff;
      background: rgba(255,255,255,0.05);
    }
  </style>
</head>
<body>
  <div class="card">
    ${slugLine}
    <h1>${content.title}</h1>
    <p>${content.message}</p>
    <div class="actions">
      <a class="primary" href="/dashboard/new">Create a Page</a>
      <a class="secondary" href="/">Back to Snaplink</a>
    </div>
  </div>
</body>
</html>`
}
