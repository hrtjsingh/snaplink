import './globals.css'
import type { Metadata, Viewport } from 'next'
import { buildRootLayoutMetadata } from '@/lib/app-seo'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = buildRootLayoutMetadata()

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#06b6d4',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${sans.variable} ${mono.variable} font-sans`}>
          {children}
          <Toaster
            theme="dark"
            position="bottom-center"
            richColors
            closeButton
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
