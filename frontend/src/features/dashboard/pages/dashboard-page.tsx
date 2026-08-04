import { useDashboardQuery } from '../hooks/use-dashboard'
import { KpiGrid } from '../components/kpi-grid'
import { MonthlySalesChart } from '../components/monthly-sales-chart'
import { RecentActivityCard } from '../components/recent-activity-card'
import { TopAgentsCard } from '../components/top-agents-card'
import { UpcomingPaymentsCard } from '../components/upcoming-payments-card'

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboardQuery()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Loading dashboard…</p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-destructive">Failed to load dashboard data.</p>
      </div>
    )
  }

  const hasAnyWidget =
    data.revenue ||
    data.plots ||
    data.leads ||
    data.pending_transfers !== null ||
    data.outstanding_balances !== null ||
    data.monthly_sales ||
    data.top_agents ||
    data.upcoming_payments ||
    data.recent_activity

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

      {!hasAnyWidget ? (
        <p className="text-muted-foreground">You don't have access to any dashboard widgets.</p>
      ) : (
        <>
          <KpiGrid data={data} />

          {data.monthly_sales && <MonthlySalesChart data={data.monthly_sales} />}

          {(data.top_agents || data.upcoming_payments) && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {data.top_agents && <TopAgentsCard agents={data.top_agents} />}
              {data.upcoming_payments && <UpcomingPaymentsCard data={data.upcoming_payments} />}
            </div>
          )}

          {data.recent_activity && <RecentActivityCard entries={data.recent_activity} />}
        </>
      )}
    </div>
  )
}
