'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Vault } from 'lucide-react'

const links = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/ledger', label: 'Ledger', icon: BookOpen },
  { href: '/vault', label: 'Vault', icon: Vault },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'rgba(249,246,237,0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          height: '64px',
          maxWidth: '480px',
          margin: '0 auto',
        }}
      >
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 20px',
                borderRadius: '12px',
                transition: 'background 0.15s',
                textDecoration: 'none',
                color: isActive ? 'var(--accent-green)' : 'var(--text-muted)',
                background: isActive ? 'rgba(45,106,79,0.08)' : 'transparent',
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '0.02em',
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
