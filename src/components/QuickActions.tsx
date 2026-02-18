'use client'

import { useState } from 'react'
import { Plus, RefreshCw, X } from 'lucide-react'
import { addTransaction, updateAccountBalance, getAccounts } from '@/lib/actions'
import { EXPENSE_CATEGORIES } from '@/lib/utils'
import { useRouter } from 'next/navigation'

function LogExpenseModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await addTransaction({
      type: 'expense',
      description: fd.get('description') as string,
      amount: Number(fd.get('amount')),
      category: fd.get('category') as string,
      date: fd.get('date') as string,
    })
    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>Log Expense</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
              What did you spend on?
            </label>
            <input name="description" placeholder="e.g. Weekly groceries" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
              Amount
            </label>
            <input name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
              Category
            </label>
            <select name="category" required>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
              Date
            </label>
            <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}

function UpdateBalanceModal({ onClose }: { onClose: () => void }) {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useState(() => {
    getAccounts().then(setAccounts)
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await updateAccountBalance(fd.get('accountId') as string, Number(fd.get('balance')))
    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>Update Balance</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {accounts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No accounts yet. Add bank accounts in the Vault.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
                Account
              </label>
              <select name="accountId" required>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
                New Balance
              </label>
              <input name="balance" type="number" step="0.01" placeholder="0.00" required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Updating...' : 'Update Balance'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function QuickActions() {
  const [modal, setModal] = useState<'expense' | 'balance' | null>(null)

  return (
    <>
      <div
        className="animate-slide-up"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
        }}
        data-delay="3"
      >
        <button
          onClick={() => setModal('expense')}
          className="card"
          style={{
            border: '2px dashed var(--border)',
            background: 'transparent',
            padding: '1.25rem',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.625rem',
            transition: 'border-color 0.15s, background 0.15s',
            textAlign: 'left',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-green)'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(45,106,79,0.04)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(192,57,43,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Plus size={20} color="var(--accent-red)" />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Log Expense
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              Track spending
            </p>
          </div>
        </button>

        <button
          onClick={() => setModal('balance')}
          className="card"
          style={{
            border: '2px dashed var(--border)',
            background: 'transparent',
            padding: '1.25rem',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.625rem',
            transition: 'border-color 0.15s, background 0.15s',
            textAlign: 'left',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-green)'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(45,106,79,0.04)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(45,106,79,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RefreshCw size={18} color="var(--accent-green)" />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Update Balance
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              Sync your bank
            </p>
          </div>
        </button>
      </div>

      {modal === 'expense' && <LogExpenseModal onClose={() => setModal(null)} />}
      {modal === 'balance' && <UpdateBalanceModal onClose={() => setModal(null)} />}
    </>
  )
}
