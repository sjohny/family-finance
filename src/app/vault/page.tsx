import { getAccounts, getLoans, getInvestments } from '@/lib/actions'
import VaultClient from '@/components/VaultClient'

export const dynamic = 'force-dynamic'

export default async function VaultPage() {
  const [accounts, loans, investments] = await Promise.all([
    getAccounts(),
    getLoans(),
    getInvestments(),
  ])

  return (
    <VaultClient accounts={accounts} loans={loans} investments={investments} />
  )
}
