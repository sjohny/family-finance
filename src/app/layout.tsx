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
  let session = null
  try {
    session = await getSession()
  } catch {
    // No session, user not logged in
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        {session && <TopBar userName={session.name} />}
        <main className={session ? 'pb-24 pt-16 min-h-screen' : 'min-h-screen'}>
          {session ? (
            <div className="max-w-2xl mx-auto px-4 py-6">
              {children}
            </div>
          ) : children}
        </main>
        {session && <BottomNav />}
      </body>
    </html>
  )
}
