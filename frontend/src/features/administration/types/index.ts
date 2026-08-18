export const LOCATION_TYPES = ['region', 'district', 'ward'] as const
export type LocationType = (typeof LOCATION_TYPES)[number]
export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  region: 'Region',
  district: 'District',
  ward: 'Ward',
}

export const WORKFLOW_TYPES = [
  'land_acquisition', 'survey', 'subdivision', 'sale_agreement', 'title_deed',
  'power_of_attorney', 'ownership_transfer', 'expense', 'other',
] as const
export type WorkflowType = (typeof WORKFLOW_TYPES)[number]
export const WORKFLOW_TYPE_LABELS: Record<WorkflowType, string> = {
  land_acquisition: 'Land Acquisition',
  survey: 'Survey',
  subdivision: 'Subdivision',
  sale_agreement: 'Sale Agreement',
  title_deed: 'Title Deed',
  power_of_attorney: 'Power of Attorney',
  ownership_transfer: 'Ownership Transfer',
  expense: 'Expense',
  other: 'Other',
}

export const AUDIT_ACTIONS = ['create', 'update', 'delete'] as const
export type AuditAction = (typeof AUDIT_ACTIONS)[number]

export const ACTIVITY_ACTIONS = ['login', 'login_failed', 'logout'] as const
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number]
export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  login: 'Login',
  login_failed: 'Login Failed',
  logout: 'Logout',
}

export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  exchange_rate: string
  is_base: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CurrencyInput {
  code: string
  name: string
  symbol?: string
  exchange_rate?: number
  is_base?: boolean
  is_active?: boolean
}

export interface Location {
  id: string
  name: string
  location_type: LocationType
  parent: string | null
  parent_name: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LocationInput {
  name: string
  location_type: LocationType
  parent?: string | null
  is_active?: boolean
}

export interface SystemSetting {
  id: string
  company_name: string
  company_address: string
  company_phone: string
  company_email: string
  base_currency: string | null
  base_currency_code: string | null
  date_format: string
  timezone: string
  fiscal_year_start_month: number
  created_at: string
  updated_at: string
}

export type SystemSettingInput = Partial<Omit<SystemSetting, 'id' | 'base_currency_code' | 'created_at' | 'updated_at'>>

export interface ApprovalStep {
  id: string
  workflow: string
  order: number
  role: string
  role_name: string
  name: string
  created_at: string
  updated_at: string
}

export interface ApprovalStepInput {
  workflow: string
  order: number
  role: string
  name?: string
}

export interface ApprovalWorkflow {
  id: string
  name: string
  workflow_type: WorkflowType
  description: string
  min_amount: string | null
  is_active: boolean
  steps: ApprovalStep[]
  created_at: string
  updated_at: string
}

export interface ApprovalWorkflowInput {
  name: string
  workflow_type: WorkflowType
  description?: string
  min_amount?: number | null
  is_active?: boolean
}

export interface ActivityLog {
  id: string
  actor: string | null
  actor_email: string | null
  action: ActivityAction
  description: string
  ip_address: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  action: AuditAction
  content_type_app_label: string
  content_type_model: string
  object_id: string
  object_repr: string
  changes: Record<string, string>
  actor: string | null
  actor_email: string | null
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
