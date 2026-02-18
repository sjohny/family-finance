import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function getMonthName(month: number) {
  return new Date(2000, month - 1).toLocaleString('en-US', { month: 'long' })
}

export const EXPENSE_CATEGORIES = [
  { id: 'fuel', label: 'Fuel', emoji: '⛽' },
  { id: 'groceries', label: 'Groceries', emoji: '🛒' },
  { id: 'medicine', label: 'Medicine', emoji: '💊' },
  { id: 'leisure', label: 'Leisure', emoji: '🎮' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'food_drinks', label: 'Food & Drinks', emoji: '🍽️' },
  { id: 'cosmetics', label: 'Cosmetics', emoji: '✨' },
  { id: 'clothes', label: 'Clothes', emoji: '👕' },
  { id: 'other', label: 'Other', emoji: '📦' },
]

export const SUBSCRIPTION_CATEGORIES = [
  { id: 'ai_tools', label: 'AI Tools', emoji: '🤖' },
  { id: 'google', label: 'Google', emoji: '🔍' },
  { id: 'internet', label: 'Internet', emoji: '🌐' },
  { id: 'insurance', label: 'Insurance', emoji: '🛡️' },
  { id: 'other', label: 'Other', emoji: '📦' },
]
