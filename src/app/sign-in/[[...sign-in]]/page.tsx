import type { Metadata } from 'next'
import { SignIn } from '@clerk/nextjs'
import { buildMarketingMetadata } from '@/lib/app-seo'

export const metadata: Metadata = buildMarketingMetadata({
  title: 'Sign in',
  description: 'Sign in to your Snaplink account to create and manage web pages.',
  path: '/sign-in',
  index: false,
})

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn redirectUrl="/dashboard" />
    </div>
  )
}
