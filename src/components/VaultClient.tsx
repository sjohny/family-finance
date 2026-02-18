'use client'

import { useState } from 'react'
import { Plus, Trash2, X, Edit2, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  addAccount, updateAccountBalance, deleteAccount,
  addLoan, updateLoanBalance, deleteLoan,
  addInvestment, updateInvestmentValue, deleteInvestment,
} from '@/lib/actions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type Tab = 'banks' | 'loans' | 'investments'

interface Props {
  accounts: any[]
  loans: any[]
  investments: any[]
}

// ── Modals ─────────────────────────────────────────────────────────────────

function AddAccountModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await addAccount({ name: fd.get('name') as string, type: fd.get('type') as string, balance: Number(fd.get('balance')) })
    setLoading(false); onClose(); router.refresh()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>Add Bank Account</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Account name</label>
            <input name="name" placeholder="e.g. Chase Checking" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Type</label>
            <select name="type" required>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="bank">Other Bank</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Current balance</label>
            <input name="balance" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Adding...' : 'Add Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

function UpdateBalanceModal({ account, onClose }: { account: any; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await updateAccountBalance(account.id, Number(fd.get('balance')))
    setLoading(false); onClose(); router.refresh()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>Update {account.name}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>New balance</label>
            <input name="balance" type="number" step="0.01" defaultValue={account.balance} required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Updating...' : 'Update Balance'}
          </button>
        </form>
      </div>
    </div>
  )
}

function AddLoanModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await addLoan({
      name: fd.get('name') as string,
      toWhom: fd.get('toWhom') as string,
      totalAmount: Number(fd.get('totalAmount')),
      remainingBalance: Number(fd.get('remainingBalance')),
      monthlyPayment: Number(fd.get('monthlyPayment') || 0),
      interestRate: Number(fd.get('interestRate') || 0),
    })
    setLoading(false); onClose(); router.refresh()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>Add a Debt</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>What is this debt for?</label>
            <input name="name" placeholder="e.g. Car loan, Mortgage" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Who do we owe?</label>
            <input name="toWhom" placeholder="e.g. Bank of America, Parents" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Original loan amount</label>
            <input name="totalAmount" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Remaining balance</label>
            <input name="remainingBalance" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Monthly payment (optional)</label>
            <input name="monthlyPayment" type="number" step="0.01" min="0" placeholder="0.00" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Interest rate % (optional)</label>
            <input name="interestRate" type="number" step="0.01" min="0" placeholder="0.00" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Adding...' : 'Add Debt'}
          </button>
        </form>
      </div>
    </div>
  )
}

function AddInvestmentModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await addInvestment({
      name: fd.get('name') as string,
      platform: fd.get('platform') as string,
      currentValue: Number(fd.get('currentValue')),
      initialValue: Number(fd.get('initialValue')),
    })
    setLoading(false); onClose(); router.refresh()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>Add Investment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Investment name</label>
            <input name="name" placeholder="e.g. S&P 500 Index Fund" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Platform / Broker</label>
            <input name="platform" placeholder="e.g. Fidelity, Vanguard" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Amount invested</label>
            <input name="initialValue" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Current value</label>
            <input name="currentValue" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Adding...' : 'Add Investment'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────

export default function VaultClient({ accounts, loans, investments }: Props) {
  const [tab, setTab] = useState<Tab>('banks')
  const [modal, setModal] = useState<string | null>(null)
  const [editAccount, setEditAccount] = useState<any>(null)
  const router = useRouter()

  const totalBanks = accounts.reduce((s, a) => s + a.balance, 0)
  const totalLoans = loans.reduce((s, l) => s + l.remainingBalance, 0)
  const totalInvested = investments.reduce((s, i) => s + i.currentValue, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem' }}>
        {[
          { label: 'In banks', value: totalBanks, color: 'var(--accent-green)', tab: 'banks' as Tab },
          { label: 'Money we owe', value: totalLoans, color: 'var(--accent-red)', tab: 'loans' as Tab },
          { label: 'Invested', value: totalInvested, color: 'var(--accent-gold)', tab: 'investments' as Tab },
        ].map(({ label, value, color, tab: t }) => (
          <div
            key={label}
            className="card animate-slide-up"
            style={{ padding: '1rem', cursor: 'pointer' }}
            data-delay="1"
            onClick={() => setTab(t)}
          >
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', lineHeight: 1.3 }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.0rem', color }}>{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card animate-slide-up" style={{ padding: '0.375rem', display: 'flex', gap: '0.25rem' }} data-delay="2">
        {(['banks', 'loans', 'investments'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '0.5rem', border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.875rem',
              fontWeight: tab === t ? 600 : 400,
              background: tab === t ? 'var(--accent-green)' : 'transparent',
              color: tab === t ? 'white' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Banks tab */}
      {tab === 'banks' && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 600 }}>Bank Accounts</h3>
            <button className="btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }} onClick={() => setModal('account')}>
              <Plus size={16} /> Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {accounts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No bank accounts yet.</p>
            ) : (
              accounts.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.875rem', borderRadius: '12px',
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'rgba(45,106,79,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', flexShrink: 0,
                  }}>
                    🏦
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{a.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {a.type.charAt(0).toUpperCase() + a.type.slice(1)} · Updated {formatDate(a.updatedAt)}
                    </p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                    {formatCurrency(a.balance)}
                  </span>
                  <button
                    onClick={() => setEditAccount(a)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                  >
                    <RefreshCw size={15} />
                  </button>
                  <button
                    onClick={async () => { await deleteAccount(a.id); router.refresh() }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Loans tab */}
      {tab === 'loans' && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 600 }}>Money We Owe</h3>
            <button className="btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }} onClick={() => setModal('loan')}>
              <Plus size={16} /> Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loans.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                🎉 No debts recorded!
              </p>
            ) : (
              loans.map(l => {
                const paidPct = l.totalAmount > 0 ? ((l.totalAmount - l.remainingBalance) / l.totalAmount) * 100 : 0
                return (
                  <div key={l.id} style={{
                    padding: '1rem', borderRadius: '12px',
                    background: 'var(--bg-primary)', border: '1px solid rgba(192,57,43,0.15)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{l.name}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Owed to {l.toWhom}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-red)' }}>
                          {formatCurrency(l.remainingBalance)}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>of {formatCurrency(l.totalAmount)}</p>
                      </div>
                    </div>
                    <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
                      <div className="progress-fill" style={{ width: `${paidPct}%`, background: 'var(--accent-green)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>
                        {Math.round(paidPct)}% paid off
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {l.monthlyPayment > 0 && (
                          <span className="badge badge-neutral">{formatCurrency(l.monthlyPayment)}/mo</span>
                        )}
                        {l.interestRate > 0 && (
                          <span className="badge badge-gold">{l.interestRate}% APR</span>
                        )}
                        <button
                          onClick={async () => { await deleteLoan(l.id); router.refresh() }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Investments tab */}
      {tab === 'investments' && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 600 }}>Investments</h3>
            <button className="btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }} onClick={() => setModal('investment')}>
              <Plus size={16} /> Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {investments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No investments tracked yet.</p>
            ) : (
              investments.map(inv => {
                const gain = inv.currentValue - inv.initialValue
                const gainPct = inv.initialValue > 0 ? (gain / inv.initialValue) * 100 : 0
                const isPositive = gain >= 0
                return (
                  <div key={inv.id} style={{
                    padding: '1rem', borderRadius: '12px',
                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{inv.name}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>via {inv.platform}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-gold)' }}>
                          {formatCurrency(inv.currentValue)}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          {isPositive ? <TrendingUp size={12} color="var(--accent-green)" /> : <TrendingDown size={12} color="var(--accent-red)" />}
                          <span style={{ fontSize: '0.75rem', color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                            {isPositive ? '+' : ''}{formatCurrency(gain)} ({gainPct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', gap: '0.5rem' }}>
                      <button
                        onClick={async () => {
                          const val = prompt('New value:', String(inv.currentValue))
                          if (val) { await updateInvestmentValue(inv.id, Number(val)); router.refresh() }
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        onClick={async () => { await deleteInvestment(inv.id); router.refresh() }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {modal === 'account' && <AddAccountModal onClose={() => setModal(null)} />}
      {modal === 'loan' && <AddLoanModal onClose={() => setModal(null)} />}
      {modal === 'investment' && <AddInvestmentModal onClose={() => setModal(null)} />}
      {editAccount && <UpdateBalanceModal account={editAccount} onClose={() => setEditAccount(null)} />}
    </div>
  )
}
