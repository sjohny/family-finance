'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Plus, X, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { addIncome, deleteIncome } from '@/lib/actions'
import { formatCurrency } from '@/lib/utils'

const INCOME_TYPES = [
  { id: 'monthly', label: 'Regular Monthly' },
  { id: 'extra', label: 'Extra / Bonus' },
  { id: 'expected', label: 'Expected (one-time)' },
]

const FREQUENCIES = [
  { id: 'monthly', label: 'Every month' },
  { id: 'quarterly', label: 'Every quarter' },
  { id: 'halfyearly', label: 'Every 6 months' },
  { id: 'yearly', label: 'Once a year' },
  { id: 'once', label: 'One time only' },
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function AddIncomeModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [frequency, setFrequency] = useState('monthly')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await addIncome({
      description: fd.get('description') as string,
      amount: Number(fd.get('amount')),
      type: fd.get('type') as string,
      frequency: fd.get('frequency') as string,
      month: fd.get('month') ? Number(fd.get('month')) : undefined,
      year: fd.get('year') ? Number(fd.get('year')) : new Date().getFullYear(),
    })
    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>Add Income Source</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Description</label>
            <input name="description" placeholder="e.g. Salary, Freelance, Bonus" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Amount</label>
            <input name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Income type</label>
            <select name="type" required>
              {INCOME_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>How often?</label>
            <select name="frequency" value={frequency} onChange={e => setFrequency(e.target.value)} required>
              {FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
          {(frequency === 'once') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Month</label>
                <select name="month">
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Year</label>
                <input name="year" type="number" defaultValue={new Date().getFullYear()} />
              </div>
            </div>
          )}
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Saving...' : 'Add Income'}
          </button>
        </form>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '0.875rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '0.5rem' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ fontSize: '0.875rem', color: p.color, marginBottom: '2px' }}>
          {p.name}: {formatCurrency(p.value ?? 0)}
        </p>
      ))}
    </div>
  )
}

export default function ForecastClient({ forecastData, incomes }: { forecastData: any; incomes: any[] }) {
  const [modal, setModal] = useState(false)
  const [tab, setTab] = useState<'chart' | 'income'>('chart')
  const router = useRouter()

  const { months, year } = forecastData

  const totalExpectedIncome = incomes
    .filter(i => i.frequency === 'monthly')
    .reduce((s, i) => s + i.amount, 0)

  const yearlyProjected = months.reduce((s: number, m: any) => s + m.expectedIncome, 0)
  const yearlyExpenses = months.reduce((s: number, m: any) => s + m.projectedExpenses, 0)
  const yearlySavings = yearlyProjected - yearlyExpenses

  // Chart data
  const chartData = months.map((m: any) => ({
    name: m.monthName,
    'Expected Income': m.expectedIncome,
    'Actual Income': m.actualIncome,
    'Actual Expenses': m.actualExpenses,
    'Projected Expenses': m.projectedExpenses,
    'Projected Savings': m.projectedSavings,
    'Actual Savings': m.actualSavings,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Year summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem' }}>
        {[
          { label: `${year} Income`, value: yearlyProjected, color: 'var(--accent-green)' },
          { label: `${year} Expenses`, value: yearlyExpenses, color: 'var(--accent-red)' },
          { label: 'Projected Savings', value: yearlySavings, color: yearlySavings >= 0 ? 'var(--accent-gold)' : 'var(--accent-red)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card animate-slide-up" style={{ padding: '1rem' }} data-delay="1">
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', lineHeight: 1.3 }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color }}>{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: '0.375rem', display: 'flex', gap: '0.25rem' }}>
        {(['chart', 'income'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '0.5rem', border: 'none', borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.875rem',
            fontWeight: tab === t ? 600 : 400,
            background: tab === t ? 'var(--accent-green)' : 'transparent',
            color: tab === t ? 'white' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}>
            {t === 'chart' ? '📈 Forecast' : '💰 Income Sources'}
          </button>
        ))}
      </div>

      {/* Chart tab */}
      {tab === 'chart' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Area chart */}
          <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              {year} Financial Forecast
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c0392b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#c0392b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b8860b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#b8860b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Area type="monotone" dataKey="Expected Income" stroke="#2d6a4f" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="Projected Expenses" stroke="#c0392b" strokeWidth={2} fill="url(#expenseGrad)" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="Projected Savings" stroke="#b8860b" strokeWidth={2} fill="url(#savingsGrad)" strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart - actual vs projected */}
          <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              Actual vs Projected
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Bar dataKey="Actual Income" fill="#2d6a4f" radius={[4,4,0,0]} />
                <Bar dataKey="Actual Expenses" fill="#c0392b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly breakdown table */}
          <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 600, marginBottom: '1rem' }}>
              Monthly Breakdown
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['Month', 'Expected Income', 'Proj. Expenses', 'Proj. Savings', 'Actual'].map(h => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {months.map((m: any) => {
                    const savings = m.projectedSavings
                    const isOver = savings < 0
                    return (
                      <tr key={m.month} style={{
                        borderBottom: '1px solid var(--border)',
                        background: m.isCurrent ? 'rgba(45,106,79,0.04)' : 'transparent',
                      }}>
                        <td style={{ padding: '0.625rem 0.75rem', fontWeight: m.isCurrent ? 700 : 400, color: m.isCurrent ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                          {m.monthName} {m.isCurrent ? '← now' : ''}
                        </td>
                        <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                          {formatCurrency(m.expectedIncome)}
                        </td>
                        <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: 'var(--accent-red)', fontFamily: 'var(--font-mono)' }}>
                          {formatCurrency(m.projectedExpenses)}
                        </td>
                        <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: isOver ? 'var(--accent-red)' : 'var(--accent-gold)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {formatCurrency(savings)}
                        </td>
                        <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {m.actualSavings !== null ? formatCurrency(m.actualSavings) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Income sources tab */}
      {tab === 'income' && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 600 }}>Income Sources</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {formatCurrency(totalExpectedIncome)}/mo regular income
              </p>
            </div>
            <button className="btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }} onClick={() => setModal(true)}>
              <Plus size={16} /> Add
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {incomes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                No income sources yet. Add your salary, freelance income, or any expected payments.
              </p>
            ) : (
              incomes.map(inc => {
                const freq = FREQUENCIES.find(f => f.id === inc.frequency)
                const type = INCOME_TYPES.find(t => t.id === inc.type)
                return (
                  <div key={inc.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem', borderRadius: '12px',
                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: 'rgba(45,106,79,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem', flexShrink: 0,
                    }}>
                      {inc.type === 'monthly' ? '💼' : inc.type === 'extra' ? '🎁' : '📅'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{inc.description}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '3px', flexWrap: 'wrap' }}>
                        <span className="badge badge-green">{type?.label}</span>
                        <span className="badge badge-neutral">{freq?.label}</span>
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-green)', flexShrink: 0 }}>
                      {formatCurrency(inc.amount)}
                    </span>
                    <button
                      onClick={async () => { await deleteIncome(inc.id); router.refresh() }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', flexShrink: 0 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {modal && <AddIncomeModal onClose={() => setModal(false)} />}
    </div>
  )
}
