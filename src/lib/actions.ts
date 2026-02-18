'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from './prisma'
import { createToken, verifyToken, getSession, requireAuth } from './auth'
import bcrypt from 'bcryptjs'

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function register(data: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error('Email already in use')

  const hashed = await bcrypt.hash(data.password, 10)
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, password: hashed },
  })

  const token = await createToken(user.id)
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  redirect('/')
}

export async function login(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email } })
  if (!user) throw new Error('Invalid email or password')

  const valid = await bcrypt.compare(data.password, user.password)
  if (!valid) throw new Error('Invalid email or password')

  const token = await createToken(user.id)
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  redirect('/')
}

export async function logout() {
  cookies().delete('auth-token')
  redirect('/login')
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardData() {
  const session = await requireAuth()
  const userId = session.id

  const [accounts, investments, loans, currentMonthBudget, transactions] =
    await Promise.all([
      prisma.account.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.investment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.loan.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.budget.findFirst({
        where: { userId, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        orderBy: { date: 'desc' },
      }),
    ])

  const totalBanks = accounts.reduce((s, a) => s + a.balance, 0)
  const totalInvestments = investments.reduce((s, i) => s + i.currentValue, 0)
  const totalLoans = loans.reduce((s, l) => s + l.remainingBalance, 0)
  const netWorth = totalBanks + totalInvestments - totalLoans
  const monthlySpent = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return {
    netWorth, totalBanks, totalInvestments, totalLoans,
    monthlyIncome: currentMonthBudget?.monthlyIncome ?? 0,
    monthlySpent,
    accounts,
    recentTransactions: transactions.slice(0, 5),
    user: session,
  }
}

// ── Transactions ──────────────────────────────────────────────────────────────

export async function getTransactions(month?: number, year?: number) {
  const session = await requireAuth()
  const now = new Date()
  const m = month ?? now.getMonth() + 1
  const y = year ?? now.getFullYear()
  return prisma.transaction.findMany({
    where: {
      userId: session.id,
      date: { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0, 23, 59, 59) },
    },
    orderBy: { date: 'desc' },
  })
}

export async function addTransaction(data: {
  type: 'income' | 'expense'; description: string
  amount: number; category: string; isRecurring?: boolean; date?: string
}) {
  const session = await requireAuth()
  await prisma.transaction.create({
    data: { ...data, amount: Number(data.amount), userId: session.id, date: data.date ? new Date(data.date) : new Date() },
  })
  revalidatePath('/'); revalidatePath('/ledger')
}

export async function deleteTransaction(id: string) {
  const session = await requireAuth()
  await prisma.transaction.deleteMany({ where: { id, userId: session.id } })
  revalidatePath('/'); revalidatePath('/ledger')
}

// ── Budget ────────────────────────────────────────────────────────────────────

export async function upsertBudget(month: number, year: number, monthlyIncome: number) {
  const session = await requireAuth()
  await prisma.budget.upsert({
    where: { month_year_userId: { month, year, userId: session.id } },
    update: { monthlyIncome: Number(monthlyIncome) },
    create: { month, year, monthlyIncome: Number(monthlyIncome), userId: session.id },
  })
  revalidatePath('/'); revalidatePath('/ledger')
}

// ── Subscriptions ─────────────────────────────────────────────────────────────

export async function getSubscriptions() {
  const session = await requireAuth()
  return prisma.subscription.findMany({ where: { userId: session.id }, orderBy: { createdAt: 'asc' } })
}

export async function addSubscription(data: { name: string; amount: number; category: string; billingDay: number }) {
  const session = await requireAuth()
  await prisma.subscription.create({
    data: { ...data, amount: Number(data.amount), billingDay: Number(data.billingDay), userId: session.id },
  })
  revalidatePath('/ledger')
}

export async function deleteSubscription(id: string) {
  const session = await requireAuth()
  await prisma.subscription.deleteMany({ where: { id, userId: session.id } })
  revalidatePath('/ledger')
}

// ── Accounts ──────────────────────────────────────────────────────────────────

export async function getAccounts() {
  const session = await requireAuth()
  return prisma.account.findMany({ where: { userId: session.id }, orderBy: { createdAt: 'asc' } })
}

export async function addAccount(data: { name: string; type: string; balance: number }) {
  const session = await requireAuth()
  await prisma.account.create({ data: { ...data, balance: Number(data.balance), userId: session.id } })
  revalidatePath('/'); revalidatePath('/vault')
}

export async function updateAccountBalance(id: string, balance: number) {
  const session = await requireAuth()
  await prisma.account.updateMany({ where: { id, userId: session.id }, data: { balance: Number(balance) } })
  revalidatePath('/'); revalidatePath('/vault')
}

export async function deleteAccount(id: string) {
  const session = await requireAuth()
  await prisma.account.deleteMany({ where: { id, userId: session.id } })
  revalidatePath('/'); revalidatePath('/vault')
}

// ── Loans ─────────────────────────────────────────────────────────────────────

export async function getLoans() {
  const session = await requireAuth()
  return prisma.loan.findMany({ where: { userId: session.id }, orderBy: { createdAt: 'asc' } })
}

export async function addLoan(data: {
  name: string; toWhom: string; totalAmount: number
  remainingBalance: number; monthlyPayment?: number; interestRate?: number
}) {
  const session = await requireAuth()
  await prisma.loan.create({
    data: {
      ...data, userId: session.id,
      totalAmount: Number(data.totalAmount),
      remainingBalance: Number(data.remainingBalance),
      monthlyPayment: Number(data.monthlyPayment ?? 0),
      interestRate: Number(data.interestRate ?? 0),
    },
  })
  revalidatePath('/'); revalidatePath('/vault')
}

export async function updateLoanBalance(id: string, remainingBalance: number) {
  const session = await requireAuth()
  await prisma.loan.updateMany({ where: { id, userId: session.id }, data: { remainingBalance: Number(remainingBalance) } })
  revalidatePath('/'); revalidatePath('/vault')
}

export async function deleteLoan(id: string) {
  const session = await requireAuth()
  await prisma.loan.deleteMany({ where: { id, userId: session.id } })
  revalidatePath('/'); revalidatePath('/vault')
}

// ── Investments ───────────────────────────────────────────────────────────────

export async function getInvestments() {
  const session = await requireAuth()
  return prisma.investment.findMany({ where: { userId: session.id }, orderBy: { createdAt: 'asc' } })
}

export async function addInvestment(data: { name: string; platform: string; currentValue: number; initialValue: number }) {
  const session = await requireAuth()
  await prisma.investment.create({
    data: {
      ...data, userId: session.id,
      currentValue: Number(data.currentValue),
      initialValue: Number(data.initialValue),
    },
  })
  revalidatePath('/'); revalidatePath('/vault')
}

export async function updateInvestmentValue(id: string, currentValue: number) {
  const session = await requireAuth()
  await prisma.investment.updateMany({ where: { id, userId: session.id }, data: { currentValue: Number(currentValue) } })
  revalidatePath('/'); revalidatePath('/vault')
}

export async function deleteInvestment(id: string) {
  const session = await requireAuth()
  await prisma.investment.deleteMany({ where: { id, userId: session.id } })
  revalidatePath('/'); revalidatePath('/vault')
}
