import type { Metadata } from 'next'
import { SignUp } from '@clerk/nextjs'
import { buildMarketingMetadata } from '@/lib/app-seo'

export const metadata: Metadata = buildMarketingMetadata({
  title: 'Sign up',
  description: 'Create a free Snaplink account and publish web pages in minutes.',
  path: '/sign-up',
  index: false,
})

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp redirectUrl="/dashboard/new" />
    </div>
  )
}
