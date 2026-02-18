import { getDashboardData } from '@/lib/actions'
import { formatCurrency, formatDate, EXPENSE_CATEGORIES } from '@/lib/utils'
import QuickActions from '@/components/QuickActions'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

function NetWorthCard({ netWorth, totalBanks, totalInvestments, totalLoans }: {
  netWorth: number
  totalBanks: number
  totalInvestments: number
  totalLoans: number
}) {
  return (
    <div
      className="card animate-slide-up"
      style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)',
        border: 'none',
        padding: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
      }}
      data-delay="1"
    >
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '160px', height: '160px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20px', left: '30%',
        width: '100px', height: '100px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
      }} />

      <div style={{ position: 'relative' }}>
        <p style={{
          color: 'rgba(255,255,255,0.65)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
          fontFamily: 'var(--font-body)',
        }}>
          Family Net Worth
        </p>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 8vw, 2.75rem)',
          fontWeight: 700,
          color: 'white',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: '1.5rem',
        }}>
          {formatCurrency(netWorth)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          {[
            { label: 'In banks', value: totalBanks, color: 'rgba(255,255,255,0.85)' },
            { label: 'Invested', value: totalInvestments, color: 'rgba(212,255,200,0.9)' },
            { label: 'We owe', value: totalLoans, color: 'rgba(255,180,160,0.9)' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginBottom: '2px', fontFamily: 'var(--font-body)' }}>
                {label}
              </p>
              <p style={{ color, fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BudgetCard({ monthlyIncome, monthlySpent }: { monthlyIncome: number; monthlySpent: number }) {
  const pct = monthlyIncome > 0 ? Math.min((monthlySpent / monthlyIncome) * 100, 100) : 0
  const remaining = monthlyIncome - monthlySpent
  const overBudget = remaining < 0

  return (
    <div className="card animate-slide-up" style={{ padding: '1.5rem' }} data-delay="2">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '2px' }}>
            This Month's Spending
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
            {formatCurrency(monthlySpent)}
          </p>
        </div>
        <span className={`badge ${overBudget ? 'badge-red' : 'badge-green'}`}>
          {overBudget ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {overBudget ? 'Over budget' : 'On track'}
        </span>
      </div>

      <div className="progress-bar" style={{ marginBottom: '0.625rem' }}>
        <div
          className="progress-fill"
          style={{
            width: `${pct}%`,
            background: overBudget
              ? 'var(--accent-red)'
              : pct > 75
              ? 'var(--accent-gold)'
              : 'var(--accent-green)',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        <span>{Math.round(pct)}% used</span>
        <span style={{ color: overBudget ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 500 }}>
          {overBudget ? `${formatCurrency(Math.abs(remaining))} over` : `${formatCurrency(remaining)} left`}
        </span>
      </div>

      {monthlyIncome === 0 && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Set your monthly income in the Ledger to track budget.
        </p>
      )}
    </div>
  )
}

function RecentTransactions({ transactions }: { transactions: any[] }) {
  const getCategoryEmoji = (cat: string) => {
    return EXPENSE_CATEGORIES.find(c => c.id === cat)?.emoji ?? '📦'
  }

  return (
    <div className="card animate-slide-up" style={{ padding: '1.5rem' }} data-delay="4">
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1rem',
        fontWeight: 600,
        marginBottom: '1rem',
        color: 'var(--text-primary)',
      }}>
        Recent Activity
      </h3>

      {transactions.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
          No transactions yet. Log an expense to get started!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {transactions.map((t) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: t.type === 'income' ? 'rgba(45,106,79,0.1)' : 'rgba(192,57,43,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', flexShrink: 0,
              }}>
                {t.type === 'income' ? '💰' : getCategoryEmoji(t.category)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.description}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {formatDate(t.date)}
                </p>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: t.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)',
                flexShrink: 0,
              }}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default async function Home() {
  const data = await getDashboardData()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <NetWorthCard
        netWorth={data.netWorth}
        totalBanks={data.totalBanks}
        totalInvestments={data.totalInvestments}
        totalLoans={data.totalLoans}
      />
      <BudgetCard
        monthlyIncome={data.monthlyIncome}
        monthlySpent={data.monthlySpent}
      />
      <QuickActions />
      <RecentTransactions transactions={data.recentTransactions} />
    </div>
  )
}
