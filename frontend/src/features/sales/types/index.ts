export const SALE_TYPES = ['cash', 'installment', 'corporate', 'bulk'] as const
export type SaleType = (typeof SALE_TYPES)[number]

export const SALE_TYPE_LABELS: Record<SaleType, string> = {
  cash: 'Cash Sale',
  installment: 'Installment Sale',
  corporate: 'Corporate Sale',
  bulk: 'Bulk Purchase',
}

export const SALE_STATUSES = ['active', 'cancelled'] as const
export type SaleStatus = (typeof SALE_STATUSES)[number]

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  active: 'Active',
  cancelled: 'Cancelled',
}

export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'mobile_money', 'cheque'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  cheque: 'Cheque',
}

export interface Invoice {
  id: string
  invoice_number: string
  amount: string
  issued_at: string
  due_date: string | null
  file: string | null
}

export interface Receipt {
  id: string
  receipt_number: string
  amount: string
  payment_method: PaymentMethod
  reference: string
  received_at: string
  file: string | null
}

export interface Sale {
  id: string
  sale_number: string
  plot: string
  plot_number: string
  customer: string
  customer_name: string
  reservation: string | null
  sale_type: SaleType
  status: SaleStatus
  sale_price: string
  discount: string
  down_payment: string
  net_price: string
  balance_due: string
  sold_at: string
  cancelled_at: string | null
  sold_by: string | null
  sold_by_name: string | null
  notes: string
  invoice: Invoice
  receipts: Receipt[]
  payment_plan_id: string | null
  created_at: string
  updated_at: string
}

export interface SaleListParams {
  plot?: string
  customer?: string
  reservation?: string
  sale_type?: SaleType
  status?: SaleStatus
  page?: number
}

export interface SaleInput {
  plot?: string
  customer?: string
  reservation?: string
  sale_type: SaleType
  sale_price: number
  discount?: number
  down_payment: number
  payment_method: PaymentMethod
  reference?: string
  notes?: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
