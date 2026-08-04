import type { InstallmentStatus } from '@/features/installments/types'

export interface DashboardRevenue {
  today: string
  this_month: string
}

export interface DashboardPlots {
  available: number
  reserved: number
  sold: number
}

export interface DashboardLeads {
  new_today: number
  new_this_month: number
}

export interface UpcomingPaymentRow {
  sale_number: string
  customer: string
  project: string
  plot_number: string
  due_date: string
  balance: string
  status: InstallmentStatus
}

export interface DashboardUpcomingPayments {
  count: number
  total_balance: string
  rows: UpcomingPaymentRow[]
}

export interface MonthlySalesPoint {
  month: string
  label: string
  total: string
  count: number
}

export interface TopAgent {
  id: string
  name: string
  deals: number
  total: string
}

export interface RecentActivityEntry {
  id: string
  action: string
  model: string
  object_repr: string
  actor: string
  created_at: string
}

export interface DashboardSummary {
  revenue: DashboardRevenue | null
  plots: DashboardPlots | null
  leads: DashboardLeads | null
  pending_transfers: number | null
  outstanding_balances: string | null
  upcoming_payments: DashboardUpcomingPayments | null
  monthly_sales: MonthlySalesPoint[] | null
  top_agents: TopAgent[] | null
  recent_activity: RecentActivityEntry[] | null
}
