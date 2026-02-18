import { getTransactions, getSubscriptions } from '@/lib/actions'
import { formatCurrency, formatDate, EXPENSE_CATEGORIES, SUBSCRIPTION_CATEGORIES, getMonthName } from '@/lib/utils'
import LedgerClient from '@/components/LedgerClient'

export const dynamic = 'force-dynamic'

export default async function LedgerPage() {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [transactions, subscriptions] = await Promise.all([
    getTransactions(month, year),
    getSubscriptions(),
  ])

  const income = transactions.filter(t => t.type === 'income')
  const expenses = transactions.filter(t => t.type === 'expense')

  const totalIncome = income.reduce((s, t) => s + t.amount, 0)
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0)
  const totalSubscriptions = subscriptions.filter(s => s.isActive).reduce((s, sub) => s + sub.amount, 0)

  // Group expenses by category
  const byCategory = expenses.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = 0
    acc[t.category] += t.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <LedgerClient
      transactions={transactions}
      subscriptions={subscriptions}
      totalIncome={totalIncome}
      totalExpenses={totalExpenses}
      totalSubscriptions={totalSubscriptions}
      byCategory={byCategory}
      month={month}
      year={year}
    />
  )
}
