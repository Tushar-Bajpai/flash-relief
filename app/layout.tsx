import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata, Viewport } from 'next'
import { clerkAppearance, clerkLocalization } from '@/lib/clerk-theme'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlashRelief — Move relief before the news',
  description: 'FlashRelief turns early flood signals into accountable action for faster, more transparent relief.',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  const inner = (
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )

  if (!publishableKey) {
    return inner
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={clerkAppearance}
      localization={clerkLocalization}
      signInFallbackRedirectUrl="/detect"
      signUpFallbackRedirectUrl="/detect"
      signInForceRedirectUrl="/detect"
      signUpForceRedirectUrl="/detect"
    >
      {inner}
    </ClerkProvider>
  )
}
