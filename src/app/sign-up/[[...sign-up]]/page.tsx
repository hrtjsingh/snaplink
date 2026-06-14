import type { Metadata } from 'next'
import { SignUp } from '@clerk/nextjs'
import { AppBackground } from '@/components/AppBackground'
import { buildMarketingMetadata } from '@/lib/app-seo'

export const metadata: Metadata = buildMarketingMetadata({
  title: 'Sign up',
  description: 'Create a free Snaplink account and publish web pages in minutes.',
  path: '/sign-up',
  index: false,
})

export default function SignUpPage() {
  return (
    <AppBackground>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-10 text-center">
          <div className="font-display text-3xl font-bold snap-gradient-text-static mb-2">
            Snaplink
          </div>
          <p className="text-zinc-500 text-sm">Create your free account</p>
        </div>
        <SignUp redirectUrl="/dashboard/new" />
      </div>
    </AppBackground>
  )
}
