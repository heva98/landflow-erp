export const COMMISSION_PLAN_TYPES = ['percentage', 'flat', 'tiered'] as const
export type CommissionPlanType = (typeof COMMISSION_PLAN_TYPES)[number]
export const COMMISSION_PLAN_TYPE_LABELS: Record<CommissionPlanType, string> = {
  percentage: 'Percentage of Sale',
  flat: 'Flat Amount per Sale',
  tiered: 'Tiered by Sale Amount',
}

export const COMMISSION_PAYMENT_STATUSES = ['pending', 'approved', 'paid', 'cancelled'] as const
export type CommissionPaymentStatus = (typeof COMMISSION_PAYMENT_STATUSES)[number]
export const COMMISSION_PAYMENT_STATUS_LABELS: Record<CommissionPaymentStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
  cancelled: 'Cancelled',
}

export interface Territory {
  id: string
  name: string
  region: string
  description: string
  created_at: string
  updated_at: string
}

export interface CommissionTier {
  id: string
  plan: string
  min_amount: string
  max_amount: string | null
  rate_percent: string
  created_at: string
  updated_at: string
}

export interface CommissionPlan {
  id: string
  name: string
  plan_type: CommissionPlanType
  rate_percent: string | null
  flat_amount: string | null
  is_active: boolean
  description: string
  tiers: CommissionTier[]
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  employee: string
  employee_name: string
  employee_number: string
  agent_code: string
  territory: string | null
  territory_name: string | null
  commission_plan: string | null
  commission_plan_name: string | null
  is_active: boolean
  notes: string
  created_at: string
  updated_at: string
}

export interface AgentRanking {
  id: string
  agent_code: string
  employee_name: string
  territory_name: string | null
  total_commission: string
  sale_count: number
  rank: number
}

export interface SalesTarget {
  id: string
  agent: string
  agent_name: string
  period_start: string
  period_end: string
  target_amount: string
  target_plot_count: number
  achieved_amount: string
  achieved_plot_count: number
  notes: string
  created_at: string
  updated_at: string
}

export interface CommissionPayment {
  id: string
  agent: string
  agent_name: string
  sale: string | null
  sale_number: string | null
  commission_plan: string | null
  commission_plan_name: string | null
  amount: string
  status: CommissionPaymentStatus
  calculated_at: string
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  paid_at: string | null
  payment_reference: string
  notes: string
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface TerritoryInput {
  name: string
  region?: string
  description?: string
}

export interface CommissionPlanInput {
  name: string
  plan_type: CommissionPlanType
  rate_percent?: number | null
  flat_amount?: number | null
  is_active?: boolean
  description?: string
}

export interface CommissionTierInput {
  plan: string
  min_amount: number
  max_amount?: number | null
  rate_percent: number
}

export interface AgentInput {
  employee: string
  territory?: string | null
  commission_plan?: string | null
  is_active?: boolean
  notes?: string
}

export interface SalesTargetInput {
  agent: string
  period_start: string
  period_end: string
  target_amount?: number
  target_plot_count?: number
  notes?: string
}
