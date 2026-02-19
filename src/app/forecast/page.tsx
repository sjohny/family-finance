import { getForecastData, getIncomes } from '@/lib/actions'
import ForecastClient from '@/components/ForecastClient'

export const dynamic = 'force-dynamic'

export default async function ForecastPage() {
  const [forecastData, incomes] = await Promise.all([
    getForecastData(),
    getIncomes(),
  ])
  return <ForecastClient forecastData={forecastData} incomes={incomes} />
}
