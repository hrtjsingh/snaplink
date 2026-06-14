import type { Metadata } from 'next'
import { SignIn } from '@clerk/nextjs'
import { AppBackground } from '@/components/AppBackground'
import { buildMarketingMetadata } from '@/lib/app-seo'

export const metadata: Metadata = buildMarketingMetadata({
  title: 'Sign in',
  description: 'Sign in to your Snaplink account to create and manage web pages.',
  path: '/sign-in',
  index: false,
})

export default function SignInPage() {
  return (
    <AppBackground>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-10 text-center">
          <div className="font-display text-3xl font-bold snap-gradient-text-static mb-2">
            Snaplink
          </div>
          <p className="text-zinc-500 text-sm">Sign in to your account</p>
        </div>
        <SignIn redirectUrl="/dashboard" />
      </div>
    </AppBackground>
  )
}
