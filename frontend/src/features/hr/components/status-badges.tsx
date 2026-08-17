import { Badge } from '@/components/ui/badge'

import {
  ATTENDANCE_STATUS_LABELS,
  EMPLOYEE_STATUS_LABELS,
  LEAVE_REQUEST_STATUS_LABELS,
  PAYROLL_STATUS_LABELS,
  type AttendanceStatus,
  type EmployeeStatus,
  type LeaveRequestStatus,
  type PayrollStatus,
} from '../types'

type Variant = 'secondary' | 'info' | 'warning' | 'success' | 'destructive'

const employeeVariant: Record<EmployeeStatus, Variant> = {
  active: 'success',
  on_leave: 'info',
  suspended: 'warning',
  terminated: 'destructive',
}
export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return <Badge variant={employeeVariant[status]}>{EMPLOYEE_STATUS_LABELS[status]}</Badge>
}

const attendanceVariant: Record<AttendanceStatus, Variant> = {
  present: 'success',
  absent: 'destructive',
  late: 'warning',
  half_day: 'info',
  on_leave: 'secondary',
}
export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return <Badge variant={attendanceVariant[status]}>{ATTENDANCE_STATUS_LABELS[status]}</Badge>
}

const leaveRequestVariant: Record<LeaveRequestStatus, Variant> = {
  pending: 'secondary',
  approved: 'success',
  rejected: 'destructive',
  cancelled: 'warning',
}
export function LeaveRequestStatusBadge({ status }: { status: LeaveRequestStatus }) {
  return <Badge variant={leaveRequestVariant[status]}>{LEAVE_REQUEST_STATUS_LABELS[status]}</Badge>
}

const payrollVariant: Record<PayrollStatus, Variant> = {
  draft: 'secondary',
  processed: 'info',
  paid: 'success',
}
export function PayrollStatusBadge({ status }: { status: PayrollStatus }) {
  return <Badge variant={payrollVariant[status]}>{PAYROLL_STATUS_LABELS[status]}</Badge>
}
