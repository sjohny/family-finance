'use client'

import { usePathname } from 'next/navigation'
import { logout } from '@/lib/actions'
import { LogOut } from 'lucide-react'

const titles: Record<string, string> = {
  '/': 'Overview',
  '/ledger': 'The Ledger',
  '/vault': 'The Vault',
}

export default function TopBar({ userName }: { userName?: string }) {
  const pathname = usePathname()
  const title = titles[pathname] ?? 'Family Finance'
  const initials = userName ? userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'FF'

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
      background: 'rgba(249,246,237,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.25rem',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: '1.25rem',
        fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em',
      }}>
        {title}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {userName && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {userName}
          </span>
        )}
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'var(--accent-green)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'white', fontWeight: 600,
          fontSize: '0.875rem', fontFamily: 'var(--font-body)',
        }}>
          {initials}
        </div>
        <form action={logout}>
          <button type="submit" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '4px', display: 'flex',
            alignItems: 'center',
          }}>
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </header>
  )
}
