export const RESERVATION_STATUSES = ['active', 'converted', 'expired', 'cancelled'] as const
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number]

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  active: 'Active',
  converted: 'Converted',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

export interface Reservation {
  id: string
  plot: string
  plot_number: string
  customer: string
  customer_name: string
  status: ReservationStatus
  reservation_fee: string
  reserved_at: string
  expiry_date: string
  converted_at: string | null
  cancelled_at: string | null
  reserved_by: string | null
  reserved_by_name: string | null
  created_at: string
  updated_at: string
}

export interface ReservationListParams {
  plot?: string
  customer?: string
  status?: ReservationStatus
  page?: number
}

export interface ReservationInput {
  plot: string
  customer: string
  reservation_fee: number
  expiry_date: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
