import { AlertTriangle, ArrowRightLeft, CheckCircle2, LandPlot, TrendingUp, UserPlus, Wallet } from 'lucide-react'

import { formatTZS } from '@/lib/utils'

import type { DashboardSummary } from '../types'
import { StatCard } from './stat-card'

export function KpiGrid({ data }: { data: DashboardSummary }) {
  const hasAnyTile =
    data.revenue || data.plots || data.leads || data.pending_transfers !== null || data.outstanding_balances !== null

  if (!hasAnyTile) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.revenue && (
        <>
          <StatCard icon={Wallet} label="Revenue Today" value={formatTZS(data.revenue.today)} />
          <StatCard icon={TrendingUp} label="Revenue This Month" value={formatTZS(data.revenue.this_month)} />
        </>
      )}

      {data.plots && (
        <>
          <StatCard icon={LandPlot} label="Plots Available" value={data.plots.available} />
          <StatCard icon={LandPlot} label="Plots Reserved" value={data.plots.reserved} />
          <StatCard icon={CheckCircle2} label="Plots Sold" value={data.plots.sold} />
        </>
      )}

      {data.leads && (
        <StatCard
          icon={UserPlus}
          label="New Leads"
          value={data.leads.new_today}
          sublabel={`${data.leads.new_this_month} this month`}
        />
      )}

      {data.pending_transfers !== null && (
        <StatCard
          icon={ArrowRightLeft}
          label="Pending Transfers"
          value={data.pending_transfers}
          tone={data.pending_transfers > 0 ? 'warning' : 'default'}
        />
      )}

      {data.outstanding_balances !== null && (
        <StatCard
          icon={AlertTriangle}
          label="Outstanding Balances"
          value={formatTZS(data.outstanding_balances)}
          tone={Number(data.outstanding_balances) > 0 ? 'negative' : 'default'}
        />
      )}
    </div>
  )
}
