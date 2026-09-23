export const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'intern'] as const
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  intern: 'Intern',
}

export const EMPLOYEE_STATUSES = ['active', 'on_leave', 'suspended', 'terminated'] as const
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number]
export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Active',
  on_leave: 'On Leave',
  suspended: 'Suspended',
  terminated: 'Terminated',
}

export const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'half_day', 'on_leave'] as const
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number]
export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  half_day: 'Half Day',
  on_leave: 'On Leave',
}

export const LEAVE_REQUEST_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'] as const
export type LeaveRequestStatus = (typeof LEAVE_REQUEST_STATUSES)[number]
export const LEAVE_REQUEST_STATUS_LABELS: Record<LeaveRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

export const PAYROLL_STATUSES = ['draft', 'processed', 'paid'] as const
export type PayrollStatus = (typeof PAYROLL_STATUSES)[number]
export const PAYROLL_STATUS_LABELS: Record<PayrollStatus, string> = {
  draft: 'Draft',
  processed: 'Processed',
  paid: 'Paid',
}

export interface Department {
  id: string
  name: string
  description: string
  manager: string | null
  manager_name: string | null
  employee_count: number
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  employee_number: string
  user: string | null
  full_name: string
  job_title: string
  department: string | null
  department_name: string | null
  manager: string | null
  manager_name: string | null
  employment_type: EmploymentType
  status: EmployeeStatus
  phone: string
  email: string
  national_id: string
  address: string
  date_of_birth: string | null
  hire_date: string
  termination_date: string | null
  basic_salary: string
  bank_name: string
  bank_account_number: string
  emergency_contact_name: string
  emergency_contact_phone: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  employee: string
  employee_name: string
  date: string
  status: AttendanceStatus
  check_in: string | null
  check_out: string | null
  notes: string
  created_at: string
  updated_at: string
}

export interface LeaveType {
  id: string
  name: string
  default_days_per_year: number
  is_paid: boolean
  created_at: string
  updated_at: string
}

export interface LeaveRequest {
  id: string
  employee: string
  employee_name: string
  leave_type: string
  leave_type_name: string
  start_date: string
  end_date: string
  reason: string
  requested_days: number
  status: LeaveRequestStatus
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  rejection_reason: string
  created_at: string
  updated_at: string
}

export interface PerformanceReview {
  id: string
  employee: string
  employee_name: string
  review_period_start: string
  review_period_end: string
  reviewer: string | null
  reviewer_name: string | null
  rating: number
  strengths: string
  areas_for_improvement: string
  goals: string
  reviewed_at: string
  created_at: string
  updated_at: string
}

export interface PayrollRecord {
  id: string
  employee: string
  employee_name: string
  pay_period_start: string
  pay_period_end: string
  status: PayrollStatus
  basic_salary: string
  allowances: string
  commission_amount: string
  deductions: string
  net_pay: string
  processed_at: string | null
  paid_at: string | null
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

export interface DepartmentInput {
  name: string
  description?: string
  manager?: string | null
}

export interface EmployeeInput {
  full_name: string
  job_title?: string
  department?: string | null
  manager?: string | null
  employment_type: EmploymentType
  phone?: string
  email?: string
  national_id?: string
  address?: string
  date_of_birth?: string | null
  hire_date?: string
  basic_salary?: number
  bank_name?: string
  bank_account_number?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  notes?: string
}

export interface LeaveTypeInput {
  name: string
  default_days_per_year?: number
  is_paid?: boolean
}

export interface LeaveRequestInput {
  employee: string
  leave_type: string
  start_date: string
  end_date: string
  reason?: string
}

export interface PerformanceReviewInput {
  employee: string
  review_period_start: string
  review_period_end: string
  rating: number
  strengths?: string
  areas_for_improvement?: string
  goals?: string
}

export interface PayrollRecordInput {
  employee: string
  pay_period_start: string
  pay_period_end: string
  basic_salary?: number
  allowances?: number
  commission_amount?: number
  deductions?: number
  notes?: string
}
