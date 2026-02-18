import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed initial data
  const currentDate = new Date()
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()

  // Create a default budget for current month
  await prisma.budget.upsert({
    where: { month_year: { month, year } },
    update: {},
    create: { month, year, monthlyIncome: 5000 },
  })

  // Create sample bank accounts
  await prisma.account.createMany({
    data: [
      { name: 'Main Checking', type: 'checking', balance: 2500 },
      { name: 'Savings', type: 'savings', balance: 10000 },
    ],
    skipDuplicates: true,
  })

  // Create sample subscriptions
  await prisma.subscription.createMany({
    data: [
      { name: 'ChatGPT', amount: 20, category: 'ai_tools', billingDay: 15 },
      { name: 'Google One', amount: 2.99, category: 'google', billingDay: 1 },
      { name: 'Home Internet', amount: 60, category: 'internet', billingDay: 5 },
    ],
    skipDuplicates: true,
  })

  console.log('Seed data created!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
