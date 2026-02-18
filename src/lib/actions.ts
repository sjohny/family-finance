'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from './prisma'

// ── Dashboard data ──────────────────────────────────────────────────────────

export async function getDashboardData() {
  const [accounts, investments, loans, currentMonthBudget, transactions] =
    await Promise.all([
      prisma.account.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.investment.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.loan.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.budget.findFirst({
        where: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      }),
      prisma.transaction.findMany({
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        orderBy: { date: 'desc' },
      }),
    ])

  const totalBanks = accounts.reduce((s, a) => s + a.balance, 0)
  const totalInvestments = investments.reduce((s, i) => s + i.currentValue, 0)
  const totalLoans = loans.reduce((s, l) => s + l.remainingBalance, 0)
  const netWorth = totalBanks + totalInvestments - totalLoans

  const monthlySpent = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const monthlyIncome = currentMonthBudget?.monthlyIncome ?? 0

  return {
    netWorth,
    totalBanks,
    totalInvestments,
    totalLoans,
    monthlyIncome,
    monthlySpent,
    accounts,
    recentTransactions: transactions.slice(0, 5),
  }
}

// ── Transactions ────────────────────────────────────────────────────────────

export async function getTransactions(month?: number, year?: number) {
  const now = new Date()
  const m = month ?? now.getMonth() + 1
  const y = year ?? now.getFullYear()

  const start = new Date(y, m - 1, 1)
  const end = new Date(y, m, 0, 23, 59, 59)

  return prisma.transaction.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: 'desc' },
  })
}

export async function addTransaction(data: {
  type: 'income' | 'expense'
  description: string
  amount: number
  category: string
  isRecurring?: boolean
  date?: string
}) {
  await prisma.transaction.create({
    data: {
      ...data,
      amount: Number(data.amount),
      date: data.date ? new Date(data.date) : new Date(),
    },
  })
  revalidatePath('/')
  revalidatePath('/ledger')
}

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/ledger')
}

// ── Budget ───────────────────────────────────────────────────────────────────

export async function upsertBudget(month: number, year: number, monthlyIncome: number) {
  await prisma.budget.upsert({
    where: { month_year: { month, year } },
    update: { monthlyIncome: Number(monthlyIncome) },
    create: { month, year, monthlyIncome: Number(monthlyIncome) },
  })
  revalidatePath('/')
  revalidatePath('/ledger')
}

// ── Subscriptions ────────────────────────────────────────────────────────────

export async function getSubscriptions() {
  return prisma.subscription.findMany({ orderBy: { createdAt: 'asc' } })
}

export async function addSubscription(data: {
  name: string
  amount: number
  category: string
  billingDay: number
}) {
  await prisma.subscription.create({
    data: { ...data, amount: Number(data.amount), billingDay: Number(data.billingDay) },
  })
  revalidatePath('/ledger')
}

export async function deleteSubscription(id: string) {
  await prisma.subscription.delete({ where: { id } })
  revalidatePath('/ledger')
}

// ── Accounts (Banks) ─────────────────────────────────────────────────────────

export async function getAccounts() {
  return prisma.account.findMany({ orderBy: { createdAt: 'asc' } })
}

export async function addAccount(data: { name: string; type: string; balance: number }) {
  await prisma.account.create({
    data: { ...data, balance: Number(data.balance) },
  })
  revalidatePath('/')
  revalidatePath('/vault')
}

export async function updateAccountBalance(id: string, balance: number) {
  await prisma.account.update({
    where: { id },
    data: { balance: Number(balance) },
  })
  revalidatePath('/')
  revalidatePath('/vault')
}

export async function deleteAccount(id: string) {
  await prisma.account.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/vault')
}

// ── Loans ────────────────────────────────────────────────────────────────────

export async function getLoans() {
  return prisma.loan.findMany({ orderBy: { createdAt: 'asc' } })
}

export async function addLoan(data: {
  name: string
  toWhom: string
  totalAmount: number
  remainingBalance: number
  monthlyPayment?: number
  interestRate?: number
}) {
  await prisma.loan.create({
    data: {
      ...data,
      totalAmount: Number(data.totalAmount),
      remainingBalance: Number(data.remainingBalance),
      monthlyPayment: Number(data.monthlyPayment ?? 0),
      interestRate: Number(data.interestRate ?? 0),
    },
  })
  revalidatePath('/')
  revalidatePath('/vault')
}

export async function updateLoanBalance(id: string, remainingBalance: number) {
  await prisma.loan.update({
    where: { id },
    data: { remainingBalance: Number(remainingBalance) },
  })
  revalidatePath('/')
  revalidatePath('/vault')
}

export async function deleteLoan(id: string) {
  await prisma.loan.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/vault')
}

// ── Investments ───────────────────────────────────────────────────────────────

export async function getInvestments() {
  return prisma.investment.findMany({ orderBy: { createdAt: 'asc' } })
}

export async function addInvestment(data: {
  name: string
  platform: string
  currentValue: number
  initialValue: number
}) {
  await prisma.investment.create({
    data: {
      ...data,
      currentValue: Number(data.currentValue),
      initialValue: Number(data.initialValue),
    },
  })
  revalidatePath('/')
  revalidatePath('/vault')
}

export async function updateInvestmentValue(id: string, currentValue: number) {
  await prisma.investment.update({
    where: { id },
    data: { currentValue: Number(currentValue) },
  })
  revalidatePath('/')
  revalidatePath('/vault')
}

export async function deleteInvestment(id: string) {
  await prisma.investment.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/vault')
}
