'use client'

import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/': 'Overview',
  '/ledger': 'The Ledger',
  '/vault': 'The Vault',
}

export default function TopBar() {
  const pathname = usePathname()
  const title = titles[pathname] ?? 'Family Finance'

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'rgba(249,246,237,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'var(--accent-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: '0.875rem',
          fontFamily: 'var(--font-body)',
        }}
      >
        FF
      </div>
    </header>
  )
}
