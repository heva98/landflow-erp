export const SITE_VISIT_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'] as const
export type SiteVisitStatus = (typeof SITE_VISIT_STATUSES)[number]
export const SITE_VISIT_STATUS_LABELS: Record<SiteVisitStatus, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const BOOKING_STATUSES = ['booked', 'confirmed', 'cancelled', 'no_show'] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  booked: 'Booked',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

export const FOLLOW_UP_STATUSES = ['pending', 'done'] as const
export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number]
export const FOLLOW_UP_STATUS_LABELS: Record<FollowUpStatus, string> = {
  pending: 'Pending',
  done: 'Done',
}

export interface Driver {
  id: string
  full_name: string
  phone: string
  license_number: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Bus {
  id: string
  registration_number: string
  capacity: number
  driver: string | null
  driver_name: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VisitFeedback {
  id: string
  booking: string
  lead_name: string
  rating: number
  comments: string
  interested_in_purchasing: boolean
  submitted_at: string
  created_at: string
  updated_at: string
}

export interface FollowUp {
  id: string
  booking: string
  lead_name: string
  due_date: string
  status: FollowUpStatus
  notes: string
  assigned_to: string | null
  assigned_to_name: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface VisitPhoto {
  id: string
  site_visit: string
  file: string
  caption: string
  uploaded_by: string | null
  uploaded_by_name: string | null
  created_at: string
  updated_at: string
}

export interface SiteVisitBooking {
  id: string
  site_visit: string
  lead: string
  lead_name: string
  lead_phone: string
  status: BookingStatus
  guest_count: number
  qr_token: string
  qr_code: string
  is_checked_in: boolean
  checked_in_at: string | null
  checked_in_by: string | null
  checked_in_by_name: string | null
  notes: string
  feedback: VisitFeedback | null
  follow_ups: FollowUp[]
  created_at: string
  updated_at: string
}

export interface SiteVisit {
  id: string
  reference_number: string
  project: string
  project_name: string
  status: SiteVisitStatus
  visit_date: string
  departure_time: string | null
  meeting_point: string
  bus: string | null
  bus_registration: string | null
  notes: string
  organized_by: string | null
  organized_by_name: string | null
  booking_count: number
  checked_in_count: number
  bookings: SiteVisitBooking[]
  photos: VisitPhoto[]
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface SiteVisitListParams {
  project?: string
  status?: SiteVisitStatus
  search?: string
  page?: number
}

export interface DriverInput {
  full_name: string
  phone?: string
  license_number?: string
}

export interface BusInput {
  registration_number: string
  capacity: number
  driver?: string | null
}

export interface SiteVisitInput {
  project: string
  visit_date: string
  departure_time?: string | null
  meeting_point?: string
  bus?: string | null
  notes?: string
}

export interface BookingInput {
  site_visit: string
  lead: string
  guest_count?: number
  notes?: string
}

export interface FeedbackInput {
  booking: string
  rating: number
  comments?: string
  interested_in_purchasing?: boolean
}

export interface FollowUpInput {
  booking: string
  due_date: string
  notes?: string
  assigned_to?: string | null
}

export interface PhotoInput {
  site_visit: string
  caption?: string
  file: File
}
