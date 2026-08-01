export const PAYMENT_PLAN_STATUSES = ['active', 'completed', 'defaulted', 'cancelled'] as const
export type PaymentPlanStatus = (typeof PAYMENT_PLAN_STATUSES)[number]

export const PAYMENT_PLAN_STATUS_LABELS: Record<PaymentPlanStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  defaulted: 'Defaulted',
  cancelled: 'Cancelled',
}

export const INSTALLMENT_STATUSES = ['pending', 'partial', 'paid', 'overdue'] as const
export type InstallmentStatus = (typeof INSTALLMENT_STATUSES)[number]

export const INSTALLMENT_STATUS_LABELS: Record<InstallmentStatus, string> = {
  pending: 'Pending',
  partial: 'Partially Paid',
  paid: 'Paid',
  overdue: 'Overdue',
}

export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'mobile_money', 'cheque'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  cheque: 'Cheque',
}

export interface InstallmentPayment {
  id: string
  receipt_number: string
  installment: string
  amount: string
  method: PaymentMethod
  reference: string
  paid_at: string
  recorded_by: string | null
  recorded_by_name: string | null
  notes: string
  created_at: string
}

export interface Installment {
  id: string
  payment_plan: string
  sequence: number
  due_date: string
  amount_due: string
  penalty_amount: string
  amount_paid: string
  balance: string
  status: InstallmentStatus
  paid_at: string | null
  flagged_overdue_at: string | null
  payments: InstallmentPayment[]
}

export interface PaymentPlan {
  id: string
  sale: string
  sale_number: string
  customer_name: string
  status: PaymentPlanStatus
  principal_amount: string
  interest_rate: string
  number_of_installments: number
  installment_amount: string
  start_date: string
  grace_period_days: number
  penalty_rate: string
  total_payable: string
  amount_paid: string
  outstanding_balance: string
  created_by: string | null
  notes: string
  installments: Installment[]
  created_at: string
  updated_at: string
}

export interface PaymentPlanListParams {
  sale?: string
  customer?: string
  status?: PaymentPlanStatus
  page?: number
}

export interface PaymentPlanInput {
  sale: string
  number_of_installments: number
  interest_rate?: number
  start_date: string
  grace_period_days?: number
  penalty_rate?: number
  notes?: string
}

export interface InstallmentPaymentInput {
  installment: string
  amount: number
  method: PaymentMethod
  reference?: string
  notes?: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
