'use client'

import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import {
  addTransaction, deleteTransaction,
  addSubscription, deleteSubscription, upsertBudget,
} from '@/lib/actions'
import { formatCurrency, formatDate, EXPENSE_CATEGORIES, SUBSCRIPTION_CATEGORIES, getMonthName } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type Tab = 'expenses' | 'income' | 'subscriptions'

interface Props {
  transactions: any[]
  subscriptions: any[]
  totalIncome: number
  totalExpenses: number
  totalSubscriptions: number
  byCategory: Record<string, number>
  month: number
  year: number
}

const RECURRING_FREQ = [
  { id: '', label: 'One-time expense' },
  { id: 'monthly', label: 'Every month' },
  { id: 'quarterly', label: 'Every quarter (3 months)' },
  { id: 'halfyearly', label: 'Every 6 months' },
  { id: 'yearly', label: 'Once a year' },
]

function AddTransactionModal({ type, onClose }: { type: 'income' | 'expense'; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [recurringFreq, setRecurringFreq] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const freq = fd.get('recurringFreq') as string
    await addTransaction({
      type,
      description: fd.get('description') as string,
      amount: Number(fd.get('amount')),
      category: type === 'income' ? 'income' : fd.get('category') as string,
      isRecurring: freq !== '',
      recurringFreq: freq || undefined,
      date: fd.get('date') as string,
    })
    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>
            {type === 'income' ? 'Add Income' : 'Add Expense'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Description</label>
            <input name="description" placeholder={type === 'income' ? 'e.g. Monthly salary' : 'e.g. Grocery run'} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Amount</label>
            <input name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>
          {type === 'expense' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Category</label>
              <select name="category" required>
                {EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Date</label>
            <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          {type === 'expense' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
                Repeats?
              </label>
              <select name="recurringFreq" value={recurringFreq} onChange={e => setRecurringFreq(e.target.value)}>
                {RECURRING_FREQ.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
              {recurringFreq && (
                <p style={{ fontSize: '0.78rem', color: 'var(--accent-green)', marginTop: '4px' }}>
                  ✓ This will be counted in your forecast
                </p>
              )}
            </div>
          )}
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Saving...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
          </button>
        </form>
      </div>
    </div>
  )
}

function AddSubscriptionModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await addSubscription({
      name: fd.get('name') as string,
      amount: Number(fd.get('amount')),
      category: fd.get('category') as string,
      billingDay: Number(fd.get('billingDay')),
    })
    setLoading(false); onClose(); router.refresh()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>Add Subscription</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Service name</label>
            <input name="name" placeholder="e.g. Netflix" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Monthly amount</label>
            <input name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Category</label>
            <select name="category" required>
              {SUBSCRIPTION_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Billing day of month</label>
            <input name="billingDay" type="number" min="1" max="31" defaultValue="1" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Saving...' : 'Add Subscription'}
          </button>
        </form>
      </div>
    </div>
  )
}

function SetIncomeModal({ month, year, onClose }: { month: number; year: number; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await upsertBudget(month, year, Number(fd.get('income')))
    setLoading(false); onClose(); router.refresh()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>Set Monthly Income</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
              Expected income for {getMonthName(month)} {year}
            </label>
            <input name="income" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LedgerClient({ transactions, subscriptions, totalIncome, totalExpenses, totalSubscriptions, byCategory, month, year }: Props) {
  const [tab, setTab] = useState<Tab>('expenses')
  const [modal, setModal] = useState<string | null>(null)
  const router = useRouter()

  const getCategoryInfo = (id: string) => EXPENSE_CATEGORIES.find(c => c.id === id) ?? { label: id, emoji: '📦' }
  const getSubCatInfo = (id: string) => SUBSCRIPTION_CATEGORIES.find(c => c.id === id) ?? { label: id, emoji: '📦' }
  const getFreqLabel = (freq: string) => RECURRING_FREQ.find(f => f.id === freq)?.label ?? freq

  const expenses = transactions.filter(t => t.type === 'expense')
  const income = transactions.filter(t => t.type === 'income')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="card animate-slide-up" style={{ padding: '1.25rem' }} data-delay="1">
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Money in</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--accent-green)' }}>+{formatCurrency(totalIncome)}</p>
        </div>
        <div className="card animate-slide-up" style={{ padding: '1.25rem' }} data-delay="2">
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Money out</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--accent-red)' }}>-{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className="card animate-slide-up" style={{ padding: '0.375rem', display: 'flex', gap: '0.25rem' }} data-delay="3">
        {(['expenses', 'income', 'subscriptions'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '0.5rem', border: 'none', borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.875rem',
            fontWeight: tab === t ? 600 : 400,
            background: tab === t ? 'var(--accent-green)' : 'transparent',
            color: tab === t ? 'white' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'expenses' && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 600 }}>{getMonthName(month)} Expenses</h3>
            <button className="btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }} onClick={() => setModal('expense')}>
              <Plus size={16} /> Add
            </button>
          </div>

          {Object.entries(byCategory).length > 0 && (
            <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                const ci = getCategoryInfo(cat)
                const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{ci.emoji} {ci.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600 }}>{formatCurrency(amt)}</span>
                    </div>
                    <div className="progress-bar" style={{ height: '5px' }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--accent-gold)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {expenses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No expenses this month yet.</p>
            ) : expenses.map(t => {
              const ci = getCategoryInfo(t.category)
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem', borderRadius: '10px', background: 'var(--bg-primary)',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(184,134,11,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0,
                  }}>{ci.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(t.date)} · {ci.label}
                      {t.recurringFreq && <span style={{ color: 'var(--accent-green)' }}> · 🔄 {getFreqLabel(t.recurringFreq)}</span>}
                    </p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-red)', flexShrink: 0, fontSize: '0.9375rem' }}>
                    -{formatCurrency(t.amount)}
                  </span>
                  <button onClick={async () => { await deleteTransaction(t.id); router.refresh() }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', flexShrink: 0 }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'income' && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 600 }}>Income</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-ghost" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }} onClick={() => setModal('set_income')}>Set Expected</button>
              <button className="btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }} onClick={() => setModal('income')}><Plus size={16} /> Add</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {income.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No income recorded this month.</p>
            ) : income.map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem', borderRadius: '10px', background: 'var(--bg-primary)',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(45,106,79,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0,
                }}>💰</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(t.date)}</p>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-green)', flexShrink: 0, fontSize: '0.9375rem' }}>
                  +{formatCurrency(t.amount)}
                </span>
                <button onClick={async () => { await deleteTransaction(t.id); router.refresh() }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', flexShrink: 0 }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'subscriptions' && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 600 }}>Recurring Bills</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{formatCurrency(totalSubscriptions)}/mo total</p>
            </div>
            <button className="btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }} onClick={() => setModal('subscription')}>
              <Plus size={16} /> Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {subscriptions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No subscriptions yet.</p>
            ) : subscriptions.map(sub => {
              const ci = getSubCatInfo(sub.category)
              return (
                <div key={sub.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem', borderRadius: '10px',
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '12px',
                    background: 'rgba(184,134,11,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', flexShrink: 0,
                  }}>{ci.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{sub.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ci.label} · Bills on day {sub.billingDay}</p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.9375rem', flexShrink: 0 }}>{formatCurrency(sub.amount)}/mo</span>
                  <button onClick={async () => { await deleteSubscription(sub.id); router.refresh() }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', flexShrink: 0 }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {modal === 'expense' && <AddTransactionModal type="expense" onClose={() => setModal(null)} />}
      {modal === 'income' && <AddTransactionModal type="income" onClose={() => setModal(null)} />}
      {modal === 'subscription' && <AddSubscriptionModal onClose={() => setModal(null)} />}
      {modal === 'set_income' && <SetIncomeModal month={month} year={year} onClose={() => setModal(null)} />}
    </div>
  )
}
