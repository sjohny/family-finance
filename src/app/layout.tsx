import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import TopBar from '@/components/TopBar'

export const metadata: Metadata = {
  title: 'Family Finance',
  description: 'Your family finance planner',
  manifest: '/manifest.json',
  themeColor: '#f9f6ed',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <TopBar />
        <main className="pb-24 pt-16 min-h-screen">
          <div className="max-w-2xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
