import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import TopBar from '@/components/TopBar'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Family Finance',
  description: 'Your family finance planner',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <TopBar userName={session?.name} />
        <main className="pb-24 pt-16 min-h-screen">
          <div className="max-w-2xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
        {session && <BottomNav />}
      </body>
    </html>
  )
}
