export const REPORT_TYPES = ['sales', 'installments', 'leads', 'land-inventory', 'cash-flow'] as const
export type ReportType = (typeof REPORT_TYPES)[number]

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  sales: 'Sales',
  installments: 'Installments',
  leads: 'Leads',
  'land-inventory': 'Land Inventory',
  'cash-flow': 'Cash Flow',
}

export const EXPORT_FORMATS = ['xlsx', 'pdf'] as const
export type ExportFormat = (typeof EXPORT_FORMATS)[number]

// --- sales report ---------------------------------------------------------

export interface SalesReportRow {
  sale_number: string
  sold_at: string
  project: string
  plot_number: string
  customer: string
  sale_type: string
  status: string
  sale_price: string
  discount: string
  net_price: string
  down_payment: string
  balance_due: string
  sold_by: string
}

export interface SalesReportSummary {
  count: number
  total_sale_price: string
  total_discount: string
  total_net_price: string
  total_down_payment: string
  total_balance_due: string
}

export interface SalesReport {
  rows: SalesReportRow[]
  summary: SalesReportSummary
}

export interface SalesReportParams {
  project?: string
  date_from?: string
  date_to?: string
  sale_type?: string
  status?: string
  sold_by?: string
}

// --- installment report ----------------------------------------------------

export interface InstallmentReportRow {
  sale_number: string
  customer: string
  project: string
  plot_number: string
  sequence: number
  due_date: string
  amount_due: string
  penalty_amount: string
  amount_paid: string
  balance: string
  status: string
}

export interface InstallmentReportSummary {
  count: number
  total_amount_due: string
  total_penalty: string
  total_paid: string
  total_balance: string
}

export interface InstallmentReport {
  rows: InstallmentReportRow[]
  summary: InstallmentReportSummary
}

export interface InstallmentReportParams {
  project?: string
  status?: string
  due_date_from?: string
  due_date_to?: string
}

// --- lead report -------------------------------------------------------------

export interface LeadReportRow {
  full_name: string
  phone: string
  email: string
  source: string
  status: string
  interested_project: string
  assigned_to: string
  created_at: string
}

export interface LeadReportSummary {
  count: number
  by_status: Record<string, number>
  by_source: Record<string, number>
  conversion_rate: string
}

export interface LeadReport {
  rows: LeadReportRow[]
  summary: LeadReportSummary
}

export interface LeadReportParams {
  project?: string
  source?: string
  status?: string
  assigned_to?: string
  date_from?: string
  date_to?: string
}

// --- land inventory report ----------------------------------------------------

export interface LandInventoryReportRow {
  project: string
  plot_number: string
  block: string
  street: string
  status: string
  area_sqm: string
  price: string
  discount: string
  final_price: string
  owner: string
}

export interface LandInventoryReportSummary {
  count: number
  total_area_sqm: string
  total_price: string
  total_final_price: string
  by_status: Record<string, number>
}

export interface LandInventoryReport {
  rows: LandInventoryReportRow[]
  summary: LandInventoryReportSummary
}

export interface LandInventoryReportParams {
  project?: string
  status?: string
}

// --- cash flow report (delegates to the finance module's ledger) ----------------

export interface ReportsCashFlowRow {
  name: string
  kind: string
  opening_balance: string
  inflow: string
  outflow: string
  closing_balance: string
}

export interface ReportsCashFlowSummary {
  count: number
  total_inflow: string
  total_outflow: string
  net_cash_flow: string
}

export interface ReportsCashFlowReport {
  rows: ReportsCashFlowRow[]
  summary: ReportsCashFlowSummary
}

export interface CashFlowReportParams {
  date_from: string
  date_to: string
}
