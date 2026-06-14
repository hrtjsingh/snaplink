import './globals.css'
import type { Metadata, Viewport } from 'next'
import { buildRootLayoutMetadata } from '@/lib/app-seo'
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const display = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = buildRootLayoutMetadata()

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050508',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${sans.variable} ${display.variable} ${mono.variable} font-sans`}>
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
